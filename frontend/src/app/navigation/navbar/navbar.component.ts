import { ChangeDetectorRef, Component, EventEmitter, inject, Output, TemplateRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserLoginComponent } from '../dialog/user-login/user-login.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/tokenservice';
import { CommentService } from '../../service/comment.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationService } from '../../service/notification.service';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs';
import { ShoppingCartComponent } from '../dialog/shopping-cart/shopping-cart.component';
import { environment } from '../../../environments/environment.prod';
import { CartService } from '../../service/cart.service';
import { ToastrService } from 'ngx-toastr';

declare var google: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {
  isNavbarCollapsed = true;
  isMapOpen = false;
  showHomeNavbar = true;
  showOtherNavbar = false;
  showStoreNavbar = false;
  showSecondNavbar = false;
  currentRoute: string = '';
  activeNavbarType!: string;

  isDropdownOpen: boolean = false;
  IsUserLogged: boolean = false;
  showLoginPopup: boolean = false;
  tab = 'login';
  activeTab: string = 'login';
  loggedInUser: any;
  signupForm!: FormGroup;
  loginForm!: FormGroup;
  data: any
  usernameErrorMessage: string | null = null;
  userErrorMessage: string | null = null;
  emailErrorMessage: string | null = null;
  userCart: any;

  ////////////////
  notifications: any[] = []
  notificationCount: number = 0;
  private offcanvasService = inject(NgbOffcanvas);
  selectedCard: any;
  comments: any[] = [];
  ////////////////////
  loggedInUserId: number | null = null;
  searchTerm: string = '';

  @Output() userSearched = new EventEmitter<string>();  

  onSearch() {
    this.userSearched.emit(this.searchTerm); 
  }

  constructor(private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef,
    private commentService: CommentService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private notifService: NotificationService,
    private cartService: CartService,
    private toastrService: ToastrService,

  ) {

  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.determineNavbarVariant(event.url);
    });
    this.loadLoggedInUser()
    this.determineNavbarVariant(this.router.url);
    this.googleTranslateElementInit();
  }

  googleTranslateElementInit() {
    new google.translate.TranslateElement({ pageLanguage: 'fr' }, 'google_translate_element');
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  determineNavbarVariant(url: string) {
    if (url.includes('/homepage')) {
      this.showHomeNavbar = true;
      this.showOtherNavbar = false;
      this.showSecondNavbar = false;
      this.activeNavbarType = 'home';
    } else if (url.includes('/chat') || url.startsWith('/user-profil/') || url.startsWith('/store') || url.startsWith('/product-info') || url.startsWith('/messages') || url.startsWith('/sender-list')) {
      this.showHomeNavbar = false;
      this.showSecondNavbar = true;
      this.showOtherNavbar = true;
      this.activeNavbarType = 'other';
    }
  }

  switchToOtherNavbar() {
    this.showHomeNavbar = false;
    this.showOtherNavbar = true;
    this.showSecondNavbar = true;
    this.activeNavbarType = 'other';
  }

  switchToHomeNavbar() {
    this.showHomeNavbar = true;
    this.showOtherNavbar = false;
    this.showSecondNavbar = false;
    this.activeNavbarType = 'home';
  }

  toggleMap() {
    this.isMapOpen = !this.isMapOpen;
  }
  closeMap() {
    this.isMapOpen = false;
  }

  loginUser(): void {
    const dialogRef = this.dialog.open(UserLoginComponent, {
      width: 'auto',
      height: 'auto',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }
  loadLoggedInUser(): void {
    this.authService.loggedInUser$.pipe(
      filter(user => !!user)
    ).subscribe(user => {
      this.IsUserLogged = !!user;
      if (this.IsUserLogged) {
        this.loggedInUser = user;
        this.loggedInUserId = user.id;
        // Ensure the token is available before fetching notifications
        const authData = this.tokenService.getAuthData();
        if (authData?.accessToken) {
          this.getUserNotification();
        } else {
          //   console.warn('Access token is not available, delaying notification fetch.');
          setTimeout(() => this.getUserNotification(), 1000);
        }
      }
    });
  }

  getUserNotification(): void {
    if (this.loggedInUserId) {
      const authData = this.tokenService.getAuthData();
      if (authData?.accessToken) {
        this.notifService.getAllUserNotifications(this.loggedInUserId).subscribe(
          (notifications) => {
            this.notifications = notifications;
            this.notificationCount = notifications.length;
            this.notificationCount = this.notifications.filter(n => !n.read).length;
          },
          (error) => {
            //  console.error('Failed to fetch notifications:', error);
          }
        );
      } else {
        //console.warn('Access token is not available. Retrying...');
        setTimeout(() => this.getUserNotification(), 1000);
      }
    } else {
      //  console.warn('User ID is not available, cannot fetch notifications.');
    }
  }


  markNotificationAsRead(notificationId: number): void {
    this.notifService.markAsRead(notificationId).subscribe(
      () => {
        this.getUserNotification();
      },
      (error) => {
        // console.error('Failed to mark notification as read:', error);
      }
    );
  }


  onNotificationClick(notificationId: number): void {
    this.notifService.getUserNotificationById(notificationId).subscribe(
      (notifDetails: any) => {
        if (notifDetails && notifDetails.folder) {
          const folderId = notifDetails.folder.id;
          const commentId = notifDetails.comment?.id;

          this.markNotificationAsRead(notificationId);
          if (folderId) {
            const selectedCard = {
              ...notifDetails.folder,
              user: notifDetails.folder.user || {}
            };
            localStorage.setItem('selectedCard', JSON.stringify(selectedCard));

            if (commentId) {
              localStorage.setItem('highlightCommentId', commentId.toString());
            }

            this.router.navigate(['/chat', folderId], { queryParams: { commentId } })
            // .then(success => console.log('Navigation Success:', success))
            //        .catch(error => console.error('Navigation Error:', error));
          } else {
            this.router.navigate(['/chat']);
          }
        }
      },
      // (error) => console.error('Error fetching notification details:', error)
    );
  }


  DeleteNotification(id: number): void {
    this.notifService.deleteUserNotification(id).subscribe(
      () => {
        this.notifications = this.notifications.filter(notif => notif.id !== id);
        this.notificationCount = this.notifications.filter(notif => notif.isNew).length;

        this.snackBar.open('Notification supprimée avec succès', 'Fermer', {
          duration: 2000,
        });
      },
      // (error) => console.error('Failed to delete notification:', error)
    );
  }


  deleteAllNotifications(): void {
    this.notifService.deleteAllUserNotifications().subscribe(
      (response) => {
        this.notifications = [];
        this.notificationCount = 0;
      },
      (error) => {
        //   console.error('Failed to delete all notifications:', error);
      }
    );
  }

  openEnd(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }



  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.toastrService.success('Vous êtes déconnecté avec succès');
        this.IsUserLogged=false;
      },
      error: (errorMessage) => {
        console.error('Logout failed:', errorMessage);
        this.toastrService.error('Erreur lors de la déconnexion');
      }
    });
  }

  goToUserProfil(): void {
    if (this.loggedInUserId !== null) {
      this.router.navigate(['/user-profil', this.loggedInUserId]);
    }
  }

  // goToMessage(): void {
  //   if (this.loggedInUserId !== null) {
  //     this.router.navigate(['/sender-list', this.loggedInUserId]);
  //   }
  // }

  fetchUserCart(): void {
    this.cartService.getUserCart().subscribe(
      (userCart) => {
        userCart.items = userCart.items || [];
        userCart.items = userCart.items.map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            uploadedFileUrl: `${environment.apiUrl}/blog-backend/productFile/${item.product.uploadedFile}`
          }
        }));

        const dialogRef = this.dialog.open(ShoppingCartComponent, {
          width: 'auto',
          data: { userCart },
        });

        dialogRef.afterClosed().subscribe(result => {
        });
      },
      (error) => {
        this.toastrService.error('Erreur lors de l\'affichage du panier');
        //  console.error('Error fetching user cart:', error);
      }
    );
  }
}
import { ChangeDetectorRef, Component, inject, TemplateRef } from '@angular/core';
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
  currentRoute: string = '';
  activeNavbarType: string = '';

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

  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.determineNavbarVariant(event.url);
      }
    });
  }

 ngOnInit(){
  this.determineNavbarVariant(this.router.url);
    this.googleTranslateElementInit();
    this.checkUserLoginStatus();
    this.getNotification();

  }

  logout(): void {
    this.tokenService.removeAuthData();
    this.IsUserLogged = false;
  }

  checkUserLoginStatus(): void {
    const authData = this.tokenService.getAuthData();
    if (authData && authData.accessToken) {
      this.authService.verifyToken(authData.accessToken).subscribe(
        (response) => {
          this.IsUserLogged = response.valid && response.userId !== null;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error verifying token:', error);
          this.IsUserLogged = false;
        }
      );
    } else {
      this.IsUserLogged = false;
    }
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
      this.showStoreNavbar = false;
      this.activeNavbarType = 'home';
    } else if (url.includes('/chat')|| url.includes('user-folders/:id')) {
      this.showHomeNavbar = false;
      this.showOtherNavbar = true;
      this.showStoreNavbar = false;
      this.activeNavbarType = 'other';
    } 
  }

  switchToOtherNavbar() {
    this.showHomeNavbar = false;
    this.showOtherNavbar = true;
    this.showStoreNavbar = false;
    this.activeNavbarType = 'other';
  }

  switchToHomeNavbar() {
    this.showHomeNavbar = true;
    this.showOtherNavbar = false;
    this.showStoreNavbar = false;
    this.activeNavbarType = 'home';
  }
  // Method to switch to Store Navbar
  switchToStoreNavbar() {
    this.showHomeNavbar = false;
    this.showOtherNavbar = false;
    this.showStoreNavbar = true;
    this.activeNavbarType = 'store';

  }

  toggleMap() {
    this.isMapOpen = !this.isMapOpen;
  }
  closeMap() {
    this.isMapOpen = false;
  }
 
  loginUser(): void {
    this.dialog.open(UserLoginComponent, {
      width: '400px',
      data: { }
    });
  this.showLoginPopup=false;
}











getNotification() {
  this.notifService.getAllNotifications().subscribe(
    (notifications) => {
      console.log('Fetched Notifications:', notifications);
      this.notifications = notifications;
      this.notificationCount = notifications.length;
    },
    (error) => {
      // console.error('Failed to fetch notifications:', error);
    }

  )
}

// // navbar.component.ts
// onNotificationClick(notification: any): void {
//   console.log('Notification Clicked:', notification);

//   if (typeof notification === 'object' && notification !== null) {
//     if (notification.folder && notification.folder.id) {
//       console.log('Navigating to folder with ID:', notification.folder.id);
//       this.router.navigate(['/chat', notification.folder.id]);
//     } else if (notification.comment && notification.comment.id) {
//       console.log('Storing comment ID and navigating to chat:', notification.comment.id);
//       localStorage.setItem('highlightCommentId', notification.comment.id.toString());
//       this.router.navigate(['/chat']);
//     } else {
//       console.warn('Notification does not have a valid folder or comment property.');
//     }
//   } else if (typeof notification === 'number') {
//     // Handle case where notification is just an ID
//     console.log('Notification is an ID:', notification);
//     // Optionally, you may fetch the notification details here if needed
//   } else {
//     console.warn('Notification is not in expected format:', notification);
//   }
// }

onNotificationClick(notificationId: number): void {
  this.notifService.getNotificationById(notificationId).subscribe(
    (notifDetails: any) => {
      if (notifDetails && notifDetails.folder) {
        const folderId = notifDetails.folder.id;
        const commentId = notifDetails.comment?.id;

        if (folderId) {

        //  const selectedCard = { id: folderId, ...notifDetails.folder }; // Include the folder details
          const selectedCard = {
            ...notifDetails.folder,
            user: notifDetails.folder.user || {} // Ensure user is included
          };
          console.log('Selected Card:', selectedCard); // Debugging line
          localStorage.setItem('selectedCard', JSON.stringify(selectedCard));

          if (commentId) {
            localStorage.setItem('highlightCommentId', commentId.toString());
          }

          this.router.navigate(['/chat', folderId], { queryParams: { commentId } })
            .then(success => console.log('Navigation Success:', success))
            .catch(error => console.error('Navigation Error:', error));
        } else {
          this.router.navigate(['/notifications']);
        }
      }
    },
    (error) => console.error('Error fetching notification details:', error)
  );
}





DeleteNotification(id: number): void {
  this.notifService.deleteUserNotification(id).subscribe(
    () => {
      this.getNotification();
      this.snackBar.open('Notification supprimée avec succès', 'Fermer', {
        duration: 2000,
      });
    },

    (error) => {
      //  console.error('Failed to delete notification:', error);
    }
  );
}

deleteAllNotifications(): void {
  this.notifService.deleteAllNotifications().subscribe(
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

}
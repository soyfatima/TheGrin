import { Component, inject, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/tokenservice';
import { CookieService } from 'ngx-cookie-service';
import { NotificationService } from '../../service/notification.service';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../../service/order.service';
import { UserOrderComponent } from '../dialog/user-order/user-order.component';
import { environment } from '../../../environments/environment.prod';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommentService } from '../../service/comment.service';
import { ToastrService } from 'ngx-toastr';

//import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class HomeComponent implements OnInit {
  public menuIndex: number = 0;
  isNavbarCollapsed = true;
  collapsed = true;
  isNavbarOpen: boolean = false;
  loaderVisible = true;
  notifications: any[] = []
  notificationCount: number = 0;
  data: any;
  IsUserLogged: boolean = false;
  IsAdminLogged: boolean = false;

  private offcanvasService = inject(NgbOffcanvas)

  constructor(
    private router: Router,
    private authService: AuthService,
    private tokenService: TokenService,
    private cookieService: CookieService,
    private notifService: NotificationService,
    private orderService: OrderService,
    private commentService: CommentService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private toastrService: ToastrService,

  ) {
  }

  ngOnInit(): void {
    //Toggle Click Function
    $("#menu-toggle").click(function (e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
      $("#content").toggleClass("toggled");
    });
    const authData = this.tokenService.getAuthData();
    this.IsUserLogged = !!authData?.accessToken;
    this.IsAdminLogged = this.authService.isAdmin();
    this.authService.loggedInUser$.subscribe(user => {
      this.IsUserLogged = !!user;
      this.IsAdminLogged = user?.role === 'admin';
    });
    this.getOrderNotification();
  }


  public switchMemu(index: any) {
    this.menuIndex = index;
  }


  getOrderNotification() {
    this.notifService.getOrderNotification().subscribe(
      (notifications) => {
        this.notifications = notifications;
        this.notificationCount = notifications.length;
        this.notificationCount = this.notifications.filter(n => !n.read).length;
      },
      (error) => {
        // console.error('Failed to fetch notifications:', error);
      }

    )
  }

  markNotificationAsRead(notificationId: number): void {
    this.notifService.markAsRead(notificationId).subscribe(
      () => {
        this.getOrderNotification()
      },
      (error) => {
        // console.error('Failed to mark notification as read:', error);
      }
    );
  }

  onNotificationClick(notification: any): void {
    if (notification && notification.order && notification.order.id) {
      this.orderService.getOrderById(notification.order.id).subscribe(
        (order) => {
          order.items = order.items.map((item: any) => ({
            ...item,
            product: {
              ...item.product,
              uploadedFileUrl: `${environment.apiUrl}/blog-backend/productFile/${item.product.uploadedFile}`
            }
          }));

          this.dialog.open(UserOrderComponent, {
            width: '700px',
            data: order
          });

          this.markNotificationAsRead(notification.id);
        },
        (error) => {
          //    console.error('Failed to fetch order:', error);
        }
      );
    }
  }


  DeleteNotification(id: number): void {
    this.orderService.deleteOrderNotification(id).subscribe(
      () => {
        this.getOrderNotification()
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
    this.orderService.deleteAllOrderNotifications().subscribe(
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

  // logout(): void {
  //   this.tokenService.removeAuthData();
  //   this.router.navigate(['login']);
  // }


  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.toastrService.success('Vous êtes déconnecté avec succès');
      },
      error: (errorMessage) => {
        console.error('Logout failed:', errorMessage);
        this.toastrService.error('Erreur lors de la déconnexion');
      }
    });
  }
  ngAfterViewInit() {
    this.loader();
  }

  loader() {
    setTimeout(() => {
      this.loaderVisible = false;
    }, 1000);
  }
}

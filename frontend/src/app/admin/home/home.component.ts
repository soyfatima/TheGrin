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
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommentService } from '../../service/comment.service';

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
data:any;
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
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    //Toggle Click Function
    $("#menu-toggle").click(function (e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
      $("#content").toggleClass("toggled");
    });
    this.getNotification();
  }


  public switchMemu(index: any) {
    this.menuIndex = index;
  }


  getNotification() {
    this.notifService.getAllNotifications().subscribe(
      (notifications) => {
        this.notifications = notifications;
        this.notificationCount = notifications.length;
      },
      (error) => {
       // console.error('Failed to fetch notifications:', error);
      }

    )
  }

  // onNotificationClick(notification: any): void {
  //   if (notification && notification.order && notification.order.id) {
  //     this.orderService.getOrderById(notification.order.id).subscribe(
  //       (order) => {
  //         order.items = order.items.map((item: any) => ({
  //           ...item,
  //           product: { 
  //             ...item.product,
  //             uploadedFileUrl: `${environment.apiUrl}/blog-backend/uploads/${item.product.uploadedFile}`
  //           }
  //         }));
  
  //         this.dialog.open(UserOrderComponent, {
  //           width: '700px',
  //           data: order
  //         });
  
  //         this.notificationCount = Math.max(0, this.notificationCount - 1);
  //       },
  //       (error) => {
  //     //    console.error('Failed to fetch order:', error);
  //       }
  //     );
  //   } else if (notification && notification.comment && notification.comment.id) {
  //     this.commentService.getCommentById(notification.comment.id).subscribe(
  //       (comment) => {
  //         this.dialog.open(UserCommentsComponent, {
  //           width: '700px',
  //           data: { comments: [comment] } 
  //         });
  
  //         this.notificationCount = Math.max(0, this.notificationCount - 1);
  //       },
  //       (error) => {
  //      //   console.error('Failed to fetch comment:', error);
  //       }
  //     );
  //   } else {
  //    // console.error('Notification does not have an associated order or comment', notification);
  //   }
  // }
  
  onNotificationClick(notification:any): void {

  }

  DeleteNotification(id: number): void {
    this.notifService.deleteNotification(id).subscribe(
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

  logout(): void {
    this.tokenService.removeAuthData();
    this.router.navigate(['login']);
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
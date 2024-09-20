import { Component } from '@angular/core';
import { filter } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../service/tokenservice';
import { MessageService } from '../../service/MessagingService';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sender-list',
  templateUrl: './sender-list.component.html',
  styleUrl: './sender-list.component.css'
})
export class SenderListComponent {


  /////////////////////////////
  userId!: number
  sender: any[] = []
  loggedInUser: any;
  IsUserLogged: boolean = false;
  loggedInUserId: number | null = null;
  constructor(private messagingService: MessageService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,



  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id']; // Convert the ID to a number
      if (isNaN(this.userId)) {
        console.error('Recipient ID is not a number');
        return;
      }
      this.loadLoggedInUser();
    });
  }

  loadLoggedInUser(): void {
    this.authService.loggedInUser$.pipe(
      filter(user => !!user)
    ).subscribe(user => {
      this.IsUserLogged = !!user;
      if (this.IsUserLogged) {
        this.loggedInUserId = user.id;
        const authData = this.tokenService.getAuthData();
        if (authData?.accessToken) {
          this.loadSenders();
        }
      }
    });
  }

  loadSenders(): void {
    if (!this.loggedInUserId) {
      console.error('Logged-in user ID is not available');
      return;
    }

    this.messagingService.getSenders(this.loggedInUserId).subscribe(
      (senders) => {
        this.sender = senders.map((sender) => {
          return {
            ...sender,
            //user: sender.user, 
            unreadCount: sender.unreadCount,
            profileImageUrl: sender.uploadedFile
              ? `${environment.apiUrl}/blog-backend/ProfilPic/${sender.uploadedFile}`
              : 'https://api.dicebear.com/6.x/initials/svg?seed=' + sender.username
          };
        });

        console.log('Loaded and mapped senders:', this.sender);
      },
      (error) => console.error('Error loading senders:', error)
    );
  }

  truncateMessage(content: string, maxLength: number): string {
    if (content.length > maxLength) {
        return content.substring(0, maxLength) + '...';
    }
    return content;
}


  // Navigate to the message view for a specific sender
  viewMessagesFromSender(senderId: number): void {
    if (!this.loggedInUserId) {
      alert('You need to be logged in to view messages.');
      return;
    }
    
    // Mark messages as read
    this.messagingService.markMessagesAsRead(this.loggedInUserId, senderId).subscribe(() => {
      const sender = this.sender.find(s => s.id === senderId);
      if (sender) {
        sender.unreadCount = 0; 
      }
    });
  
    this.router.navigate(['/messages', senderId]);
  
  }



  // viewMessagesSender(senderId: number): void {
  //   if (!this.loggedInUserId) {
  //     console.error('Logged-in user ID is not available');
  //     return;
  //   }

  //   // Mark messages as read
  //   this.messagingService.markMessagesAsRead(this.loggedInUserId, senderId).subscribe(() => {
  //     const sender = this.sender.find(s => s.id === senderId);
  //     if (sender) {
  //       sender.unreadCount = 0; 
  //     }
  //   });
  // }
}
import { Component } from '@angular/core';
import { MessageService } from '../../service/MessagingService';
import { AuthService } from '../../service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TokenService } from '../../service/tokenservice';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrl: './messaging.component.css'
})

export class MessagingComponent {

  recipientId!: number;
  userId!:number;
  content: string = '';
  messages: any[] = [];
  isSending: boolean = false; // Add this property
  isRecipient: boolean = false; // Add this property


  
  /////////////////////////////
  loggedInUser: any;
  IsUserLogged: boolean = false;
  loggedInUserId: number | null = null;
  constructor(private messagingService: MessageService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,



  ) {}

//   ngOnInit(): void {
//     this.route.params.subscribe(params => {
//       this.recipientId = +params['id']; // Get recipient ID from route params and convert to number
//       if (isNaN(this.recipientId)) {
//         console.error('Recipient ID is not a number');
//         return;
//       }
//     });  
//     this.authService.loggedInUser$.subscribe(user => {
//       if (user) {
//         this.loggedInUserId = user.id;


//       } else {
//         this.loggedInUserId = null;
//       }
//     });

//    // this.loadLoggedInUser();
// this.loadMessages()
//   }
  
  // loadLoggedInUser(): void {
  //   this.authService.loggedInUser$.pipe(
  //     filter(user => !!user)
  //   ).subscribe(user => {
  //     this.IsUserLogged = !!user;
  //     if (this.IsUserLogged) {
  //       this.loggedInUser = user;
  //       this.loggedInUserId = user.id;
  //       // Ensure the token is available before fetching notifications
  //       const authData = this.tokenService.getAuthData();
  //       if (authData?.accessToken) {
  //         this.loadMessages()
  //       } else {
  //         //   console.warn('Access token is not available, delaying notification fetch.');
  //       }
  //     }
  //   });
  // }

  ngOnInit(): void {
    this.recipientId = +this.route.snapshot.paramMap.get('id')!;
    this.loadLoggedInUser();
  }
  
  loadLoggedInUser(): void {
    this.authService.loggedInUser$.pipe(
      filter(user => !!user) // Ensure user exists before proceeding
    ).subscribe(user => {
      this.IsUserLogged = !!user;
      if (this.IsUserLogged) {
        this.loggedInUser = user;
        this.loggedInUserId = user.id;
  
        console.log('Logged-in user ID:', this.loggedInUserId);
  
        // Load messages now that the logged-in user ID is set
        this.loadMessages(); // Call this here
      } else {
        console.error('No user logged in');
      }
    });
  }
  
  sendMessage(): void {
    if (!this.loggedInUserId) {
        alert('You need to be logged in to send messages.');
        return;
    }

    if (!this.recipientId) {
        console.error('Recipient ID is not defined');
        return;
    }

    if (this.isSending) {
        return; // Prevent multiple sends
    }

    this.isSending = true;

    this.messagingService.sendMessage(this.loggedInUserId, this.recipientId, this.content).subscribe(
        () => {
            this.content = ''; // Clear the input after sending
            this.loadMessages(); // Refresh messages
            this.isSending = false; // Re-enable sending
        },
        (error) => {
            console.error('Error sending message:', error);
            this.isSending = false; // Re-enable sending on error
        }
    );
}

  
  // loadMessages(): void {
  //   this.messagingService.getMessages(this.recipientId).subscribe(
  //     (response) => {
  //       this.messages = response.messages.map(msg => ({
  //         ...msg,
  //         senderProfileImageUrl: msg.sender?.uploadedFile
  //           ? `${environment.apiUrl}/blog-backend/ProfilPic/${msg.sender.uploadedFile}`
  //           : 'https://api.dicebear.com/6.x/initials/svg?seed=Sender',
  //         recipientProfileImageUrl: msg.recipient?.uploadedFile
  //           ? `${environment.apiUrl}/blog-backend/ProfilPic/${msg.recipient.uploadedFile}`
  //           : 'https://api.dicebear.com/6.x/initials/svg?seed=Recipient',
  //       //  isSender: true // Since only the logged-in user sends messages
  //       isSender: msg.sender.id === userId  
  //     }));
  //       console.log('Loaded messages:', this.messages);  // Log to check if messages are received
  //     },
  //     (error) => console.error('Error loading messages:', error)
  //   );
  // }
  loadMessages(): void {
    console.log('Loading messages for recipient:', this.recipientId);
  
    this.messagingService.getMessages(this.recipientId).subscribe(
      messages => {
        console.log('Fetched messages:', messages);
  
        // Map messages and include profile image URLs
        this.messages = messages.map(message => ({
          ...message,
          senderProfileImageUrl: message.sender?.uploadedFile
            ? `${environment.apiUrl}/blog-backend/ProfilPic/${message.sender.uploadedFile}`
            : 'https://api.dicebear.com/6.x/initials/svg?seed=Sender',
          recipientProfileImageUrl: message.recipient?.uploadedFile
            ? `${environment.apiUrl}/blog-backend/ProfilPic/${message.recipient.uploadedFile}`
            : 'https://api.dicebear.com/6.x/initials/svg?seed=Recipient',
        }));
  
        console.log('Processed messages:', this.messages);
      },
      error => {
        console.error('Error fetching messages:', error);
      }
    );
  }
  

  
  

}
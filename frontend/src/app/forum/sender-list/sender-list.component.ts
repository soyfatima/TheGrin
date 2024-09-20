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
  userId!:number
  sender:any [] = []
  loggedInUser: any;
  IsUserLogged: boolean = false;
  loggedInUserId: number | null = null;
  constructor(private messagingService: MessageService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,



  ) {}

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
          // Map through each sender and attach their profile image URL
          return {
           // ...sender,
            user: sender.user, // Ensure you're passing the user object correctly
            unreadCount: sender.unreadCount,
            profileImageUrl: sender.uploadedFile
              ? `${environment.apiUrl}/blog-backend/ProfilPic/${sender.uploadedFile}` // Assuming the `uploadedFile` holds the image file
              : 'https://api.dicebear.com/6.x/initials/svg?seed=' + sender.username // Default image if no profile picture
          };
        });
  
        console.log('Loaded and mapped senders:', this.sender);
      },
      (error) => console.error('Error loading senders:', error)
    );
  }
  

  // Navigate to the message view for a specific sender
  viewMessagesFromSender(senderId: number): void {
    if (!this.loggedInUserId) {
      alert('You need to be logged in to view messages.');
      return;
    }

    this.router.navigate(['/messages', senderId]);
  }


}
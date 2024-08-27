import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderService } from '../../service/folder.service';
import { CommentService } from '../../service/comment.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../service/auth.service';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../service/tokenservice';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-folders',
  templateUrl: './user-folders.component.html',
  styleUrl: './user-folders.component.css'
})

export class UserFoldersComponent implements OnInit {
  tab = 'forumComment';
  activeTab: string = 'forumComment';
  userId!: number;
  folders: any[] = [];
  comments: any[] = [];

  paginatedComments: any[] = [];
  paginatedFolders: any[] = [];

  pageSize = 10;
  pageIndexComments = 0;
  pageIndexFolders = 0;
  //////////////////////////
  loggedInUserId: number | null = null;
  IsUserLogged: boolean = false;

  isEditing: boolean = false;
  uploadedFile: File | null = null;
  previewImageUrl: string | ArrayBuffer | null = null; // To store the preview image URL
  usernameForm: FormGroup;
  
  loggedInUser: any = null;
  user: any = {};
  @ViewChild('paginatorComments', { static: true }) paginatorComments!: MatPaginator;
  @ViewChild('paginatorFolders', { static: true }) paginatorFolders!: MatPaginator;
  selectedCard: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private folderService: FolderService,
    private commentService: CommentService,
    private authService: AuthService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef,

  ) {
    this.usernameForm = this.fb.group({
      username: [''],
      uploadedFile: [null]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadFolders();
      this.loadComments();
      this.loadLoggedInUser();
      // this.loadUserInfo();
      this.authService.loggedInUser$.subscribe(user => {
        this.IsUserLogged = !!user;
        if (this.IsUserLogged) {
          this.loggedInUserId = user.id;
        }
      });
    });
  }

  paginateComments() {
    const startIndex = this.pageIndexComments * this.pageSize;
    this.paginatedComments = this.comments.slice(startIndex, startIndex + this.pageSize);
  }

  paginateFolders() {
    const startIndex = this.pageIndexFolders * this.pageSize;
    this.paginatedFolders = this.folders.slice(startIndex, startIndex + this.pageSize);
  }

  handlePageEventComments(event: PageEvent) {
    this.pageIndexComments = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginateComments();
  }

  handlePageEventFolders(event: PageEvent) {
    this.pageIndexFolders = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginateFolders();
  }

  loadFolders(): void {
    this.folderService.getUserFolders(this.userId).subscribe(
      (folders: any[]) => {
        this.folders = folders || [];
        this.paginateFolders();
        this.folders = this.folders.map(folder => {
          const uploadedFileUrl = folder.user?.uploadedFile ? `${environment.apiUrl}/blog-backend/uploads/${folder.user.uploadedFile}` : null;
          return {
            ...folder,
            uploadedFileUrl
          };
        });
        this.cdr.detectChanges();
      },
      (error) => {
        //   console.error('Error fetching folders:', error);
      }
    );
  }

  loadComments(): void {
    this.commentService.getUserComments(this.userId).subscribe(
      (comments: any[]) => {
        this.comments = comments;
        this.comments = comments || [];
        this.paginateComments();
      },
      (error) => {
        //   console.error('Error fetching comments:', error);
      }
    );
  }

  switchTab(tab: string): void {
    this.tab = tab;
    this.pageIndexComments = 0;
    this.pageIndexFolders = 0;
    if (tab === 'forumComment') {
      this.paginateComments();
    } else if (tab === 'userFolder') {
      this.paginateFolders();
    }
  }
  navigateToChat(folderId: number, commentId?: number): void {
    if (!folderId) {
      //console.error('Invalid folderId:', folderId);
      return;
    }

    this.selectedCard = this.folders.find(folder => folder.id === folderId);
    localStorage.setItem('selectedCard', JSON.stringify(this.selectedCard));

    const queryParams = commentId ? { commentId } : {};
    this.router.navigate(['/chat', folderId], { queryParams });
  }

  chooseImage(event: any): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  EditUserInfo(): void {
    if (this.usernameForm.valid && this.loggedInUserId !== null) { // Check if loggedInUserId is not null
      const username = this.usernameForm.get('username')?.value;

      const formData = new FormData();
      formData.append('username', username);
      if (this.uploadedFile) {
        formData.append('uploadedFile', this.uploadedFile, this.uploadedFile.name);
      }

      this.authService.updateUserInfo(this.loggedInUserId, formData).subscribe(
        (response) => {
          this.loadFolders();
          this.loadLoggedInUser();
          this.isEditing = false;
           this.cdr.detectChanges();
        },
        (error) => {
          // Handle error appropriately
        }
      );
    } else {
      // console.error('User ID is not available');
    }
  }



  loadLoggedInUser(): void {
    this.authService.loggedInUser$.subscribe(user => {
      this.IsUserLogged = !!user;
      if (this.IsUserLogged) {
        this.loggedInUser = user; // Store user info
        this.loggedInUserId = user.id;
  
        // Update image URL with cache-busting query parameter
        if (user.uploadedFile) {
          this.previewImageUrl = `${environment.apiUrl}/blog-backend/uploads/${user.uploadedFile}?t=${new Date().getTime()}`;
          console.log('Updated previewImageUrl:', this.previewImageUrl);
        } else {
          console.log('No uploaded file found for user.');
        }
      } else {
        console.log('User is not logged in.');
      }
    });
  }

  loadUserInfo(): void {
    this.authService.getUserInfo(this.userId).subscribe(
      (user: any) => {
        this.user = user;
      },
      (error) => {
        console.error('Error fetching user info:', error);
      }
    );
  }
  cancel(): void {
    this.isEditing = false;
  }


}
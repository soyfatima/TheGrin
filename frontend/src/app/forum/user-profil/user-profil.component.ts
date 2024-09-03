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
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  styleUrl: './user-profil.component.css'
})
export class UserProfilComponent implements OnInit {
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
  admin: any = {};
  isAdmin: boolean = false;
  isUser: boolean = false;

  @ViewChild('paginatorComments', { static: true }) paginatorComments!: MatPaginator;
  @ViewChild('paginatorFolders', { static: true }) paginatorFolders!: MatPaginator;
  selectedCard: any;
  username: any;

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
    this.isAdmin = this.authService.isAdmin();
    console.log('Is Admin:', this.isAdmin);

    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadFolders();
      this.loadComments();
      this.loadLoggedInUser();
      //this.loadUserInfo();
      //this.loadAdminInfo();
      this.authService.loggedInUser$.subscribe(user => {
        this.IsUserLogged = !!user;
        if (this.IsUserLogged) {
          this.loggedInUserId = user.id;
        }
      });
    });

    if(this.isAdmin) {
      this.loadAdminInfo()

    } else{
      this.loadUserInfo()
    }
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
          const uploadedFileUrl = folder.user?.uploadedFile ? `${environment.apiUrl}/blog-backend/ProfilPic/${folder.user.uploadedFile}` : null;
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
    if (this.usernameForm.valid && this.loggedInUserId !== null) {
      const username = this.usernameForm.get('username')?.value;

      const formData = new FormData();
      formData.append('username', username);
      if (this.uploadedFile) {
        formData.append('uploadedFile', this.uploadedFile, this.uploadedFile.name);
      }

      this.authService.updateUserInfo(this.loggedInUserId, formData).subscribe(
        response => {
          this.loggedInUser.username = response.username;
          if (response.uploadedFile) {
            this.previewImageUrl = `${environment.apiUrl}/blog-backend/ProfilPic/${response.uploadedFile}?t=${new Date().getTime()}`;
          }
          this.loadLoggedInUser(); // Reload user info to get the updated image URL
          this.isEditing = false;
          this.cdr.detectChanges();
        },
        error => {
          console.error('Error updating user info:', error);
        }
      );
    }
  }


  loadLoggedInUser(): void {
    this.authService.loggedInUser$.subscribe(user => {
      this.IsUserLogged = !!user;
      if (this.IsUserLogged) {
        this.loggedInUser = user;
        this.loggedInUserId = user.id;
      }
    });
  }

  loadUserInfo(): void {
    this.authService.getUserInfo(this.userId).subscribe(
      user => {
        this.user = user;
        this.isUser = true;
        if (user.uploadedFile) {
          this.user.uploadedFileUrl = `${environment.apiUrl}/blog-backend/ProfilPic/${user.uploadedFile}?t=${new Date().getTime()}`;
        } else {
          console.log('No uploaded file found for this user.');
        }
      },
      error => {
        console.error('Error fetching user info:', error);
      }
    );
  }


  loadAdminInfo(): void {
    this.authService.getAdminInfo(this.userId).subscribe(
      admin => {
        this.admin = admin;
        this.isAdmin = true;
        console.log('admin info', this.admin)
        if (admin.uploadedFile) {
          this.user.uploadedFileUrl = `${environment.apiUrl}/blog-backend/ProfilPic/${admin.uploadedFile}?t=${new Date().getTime()}`;
        } else {
          console.log('No uploaded file found for this user.');
        }
      },
      error => {
        console.error('Error fetching user info:', error);
      }
    );
  }


  cancel(): void {
    this.isEditing = false;
  }

}

import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FolderService } from '../../service/folder.service';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentService } from '../../service/comment.service';
import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/tokenservice';
import { debounceTime, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../navigation/dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  tab = 'forum';
  activeTab: string = 'forum';
  isCategoryHidden = false;
  isMobile = false;
  folderForm!: FormGroup;
  folders: any[] = [];
  adminNotes: any[] = [];
  currentDate: Date = new Date();

  selectedCard: any = null;
  selectedNote: any = null;

  forum: any[] = [];
  filteredForum: any[] = [];
  selectedCategory: string = '';
  //currentPage: number = 1;
  itemsPerPage: number = 10;
  visiblePageRange: number[] = [];

  currentPageUserFolders: number = 1;
  currentPageAdminNotes: number = 1;
  filteredAdminNotes: any;

  visiblePageRangeUserFolders: number[] = [];
  visiblePageRangeAdminNotes: number[] = [];
  /////////////////////////////
  commentContent: string = '';
  folderId!: number;
  comments: any[] = [];
  replyContent: string = '';
  replyingTo: number | null = null;
  isEditing: boolean = false;
  isEditingComment: { [key: number]: boolean } = {};
  editContent: string = '';
  /////////////////////////////
  loggedInUserId: number | null = null;
  isUserReplyVisible: { [key: number]: boolean } = {};

  ///////////////////////////
  commentsCount: { [key: number]: number } = {};
  lastCommentDetails: { [key: number]: { user: string, time: string, id: number } } = {};
  lastCommentId: number | null = null;
  userSuggestions: any[] = [];
  private searchSubject = new Subject<string>();
  formattedReplyContent: string = '';
  highlightCommentId: number | null = null;
  highlightReplyId: number | null = null; // To store the ID of the reply to highlight

  @ViewChild('commentList') commentList!: ElementRef;
  sanitizedContent!: SafeHtml;

  category: any[] = [
    { name: 'fertilité' },
    { name: 'cardiologie' },
    { name: 'santé bébé' },
    { name: 'génécologie' },
    { name: 'blague/détente' },
    { name: 'problème de couple' },
    { name: 'problème familiale' },
    { name: 'relation sentimental' },
    { name: 'autre' }
  ]

  Categories: any[] = [
    { label: 'fertilité', value: 'fertilité', },
    { label: 'cardiologie', value: 'cardiologie', },
    { label: 'santé bébé', value: 'santé bébé', },
    { label: 'génécologie', value: 'génécologie', },
    { label: 'blague/détente', value: 'blague/détente', },
    { label: 'problème de couple', value: 'problème de couple', },
    { label: 'problème familiale', value: 'problème familiale', },
    { label: 'relation sentimental', value: 'relation sentimental', },
    { label: 'autre', value: 'autre', }
  ]

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    // Adjust sidebar visibility based on viewport width
    if (this.isMobile && !this.isCategoryHidden) {
      this.isCategoryHidden = true;
    }
  }


  constructor(
    private fb: FormBuilder,
    private folderService: FolderService,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private commentService: CommentService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
  ) {

    this.searchSubject.pipe(
      debounceTime(300) // Adjust debounce time as needed
    ).subscribe(prefix => {
      if (prefix.length > 1) {
        this.fetchUserSuggestions(prefix);
      } else {
        this.userSuggestions = [];
      }
    });
  }


  setSanitizedContent(content: string): void {
    this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(content);
  }

  ngOnInit() {
    this.folderForm = this.fb.group({
      category: ['', Validators.required],
      title: ['', Validators.required],
      content: ['', Validators.required],
      uploadedFile: [null],

    });

    this.route.paramMap.subscribe(params => {
      const folderId = +params.get('id')!;
      const commentId = +this.route.snapshot.queryParamMap.get('commentId')!;
  
      this.folderId = folderId;
      console.log('Route Folder ID:', this.folderId);
      console.log('Query Comment ID:', commentId);
  
      // Load selected card and comments
      const savedCard = JSON.parse(localStorage.getItem('selectedCard')!);
      if (savedCard && savedCard.id === folderId) {
        this.selectedCard = savedCard;
        this.fetchComments(this.selectedCard.id);
      }  else {
          // If no matching card, reset state
          this.deselectCard();
        }
        
      // Highlight comment if available
      if (commentId) {
        this.highlightCommentId = commentId;
        console.log('Highlight Comment ID:', this.highlightCommentId);
      } else {
        // Clear state if the folderId doesn't match
        this.highlightCommentId = null;
      }
    });
  
    // Clear highlightCommentId from localStorage
    localStorage.removeItem('highlightCommentId');
  
    // Other initialization
    this.onResize();
    this.fetchFolders();
    this.updateTime();
    this.getLoggedInUserId();
    this.fetchAdminNote();
  }

  selectCard(folder: any): void {
    this.selectedCard = folder;
    localStorage.setItem('selectedCard', JSON.stringify(folder));
    this.fetchComments(folder.id);
    this.cdr.detectChanges();
  }
  deselectCard(): void {
    this.selectedCard = null;
    localStorage.removeItem('selectedCard');
    this.comments = [];
    this.cdr.detectChanges();
  
    // Manually clear query parameters from the URL
    window.history.replaceState({}, '', '/chat');
  }
  

  selectNote(note: any): void {
    this.selectedNote = note;
    localStorage.setItem('selectedNote', JSON.stringify(note));
  }

  deselectNote(): void {
    this.selectedNote = null;
    localStorage.removeItem('selectedNote');
  }

  //fetch folders and details
  fetchFolders(): void {
    this.folderService.getFolderDetails().subscribe(
      (folders) => {
        this.folders = folders
          .map((folder: { uploadedFile: any; user: any; createdAt: Date }) => ({
            ...folder,
            FolderUploadedFileUrl: folder.uploadedFile ? `${environment.apiUrl}/blog-backend/userFile/${folder.uploadedFile}` : null,
            userProfileImageUrl: folder.user?.uploadedFile ? `${environment.apiUrl}/blog-backend/uploads/${folder.user.uploadedFile}` : null,
          }))
          .sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Trier par date décroissante

        this.filteredForum = this.folders;
        this.folders.forEach(folder => {
          this.fetchComments(folder.id);
        });

      },
      (error) => {
        //console.error('Error fetching folders:', error);
      }
    );
  }

  fetchAdminNote(): void {
    this.folderService.fetchAdminNote().subscribe(
      (folders) => {
        this.adminNotes = folders.map((folder: { uploadedFile: any; }) => ({
          ...folder,
          uploadedFileUrl: folder.uploadedFile ? `${environment.apiUrl}/blog-backend/adminFile/${folder.uploadedFile}` : null,
        }));
   //   console.log('admin folder', this.adminNotes);
        this.adminNotes = folders;
        this.filteredAdminNotes = this.adminNotes;
        this.updateVisiblePageRangeAdminNotes();
      },
      (error) => {
        // console.error('Error fetching admin notes:', error);
      }
    );
  }


  deleteFolder(): void {
    if (this.selectedCard) {
      const folderId = this.selectedCard.id;

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { message: 'Êtes-vous sûre de vouloir supprimé ce post ?' }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.folderService.deleteFolder(folderId).subscribe(
            () => {
              this.toastrService.success('Folder deleted successfully');
              this.folders = this.folders.filter(folder => folder.id !== folderId); // Remove the folder from the list
              this.deselectCard();
              //   this.fetchFolders();
              this.cdr.detectChanges();
            },
            (error) => {
              this.toastrService.error('Failed to delete folder');
            }
          );
        }
      });
    }
  }

  updateTime(): void {
    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  submitComment(): void {
    if (this.commentContent.trim() === '') {
      return;
    }
    this.commentService.addComment(this.selectedCard.id, this.commentContent)
      .subscribe(
        response => {
          this.commentContent = '';
          this.fetchComments(this.selectedCard.id);
        },
        error => {
          //   console.error('Error adding comment:', error);
        }
      );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.lastCommentId) {
        this.scrollToLastComment();
      }
    }, 300);
  }

  fetchComments(folderId: number): void {
    this.commentService.getComments(folderId).subscribe(
      (comments: any[]) => {
        this.commentsCount[folderId] = comments.length;
        if (comments.length > 0) {
          const lastComment = comments[comments.length - 1];
          this.lastCommentDetails[folderId] = {
            user: lastComment.user.username,
            time: lastComment.createdAt,
            id: lastComment.id
          };
          this.lastCommentId = lastComment.id;
        } else {
          this.lastCommentDetails[folderId] = {
            user: '',
            time: '',
            id: 0
          };
          this.lastCommentId = null;
        }
  
        if (this.selectedCard && this.selectedCard.id === folderId) {
          this.comments = comments;
        }
  
        // Optionally handle highlighting here
        if (this.highlightCommentId) {
          setTimeout(() => {
            const commentElement = document.getElementById(`comment-${this.highlightCommentId}`);
            if (commentElement) {
              commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              commentElement.classList.add('highlight');
            }
          }, 100);
        }
      },
      (error) => {
        console.error('Error fetching comments for folder ID:', folderId, error);
      }
    );
  }
  
  handleLastCommentClick(folderId: number): void {
    this.selectCard(this.paginatedUserFolders.find(folder => folder.id === folderId));
    setTimeout(() => {
      this.scrollToLastComment();
    }, 300);
  }

  scrollToLastComment(): void {
    setTimeout(() => {
      if (this.lastCommentId) {
        const commentElement = document.getElementById(`comment-${this.lastCommentId}`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          //console.error('Comment element not found with ID:', `comment-${this.lastCommentId}`);
        }
      } else {
        //console.error('No last comment ID available');
      }
    }, 300); // Adjust the timeout as needed
  }


  CountComments(folderId: number): void {
    this.commentService.getComments(folderId).subscribe(
      (comments: any[]) => {
        this.commentsCount[folderId] = comments.length;
      },
      (error) => {
        // console.error('Error fetching comments for folder ID:', folderId, error);
      }
    );
  }

  calculateCommentCounts(): void {
    this.comments.forEach(comment => {
      if (this.commentsCount[comment.folderId]) {
        this.commentsCount[comment.folderId]++;
      } else {
        this.commentsCount[comment.folderId] = 1;
      }
    });
  }

  ///////////////////////////
  //reply

  submitReply(): void {
    if (this.replyContent.trim() === '' || this.replyingTo === null) {
      return;
    }

    this.commentService.addReply(this.replyingTo, this.replyContent)
      .subscribe(
        response => {
          //response=response;
          this.replyContent = '';
          this.replyingTo = null;
          this.fetchComments(this.selectedCard.id);
        },
        error => {
          //  console.error('Error adding reply:', error);
        }
      );
  }
  
  fetchUserSuggestions(prefix: string): void {
    this.commentService.getUserSuggestions(prefix)
      .subscribe(
        suggestions => {
          this.userSuggestions = suggestions;
        },
        error => {
          // console.error('Error fetching user suggestions:', error);
          this.userSuggestions = [];
        }
      );
  }

  onReplyContentChange(): void {
    const mentionMatch = this.replyContent.match(/@(\w*)$/);
    if (mentionMatch) {
      const prefix = mentionMatch[1];
      if (prefix.length > 1) {
        this.fetchUserSuggestions(prefix);
      } else {
        this.userSuggestions = [];
      }
    } else {
      this.userSuggestions = [];
    }
  }

  getHighlightedContent(content: string): string {
    if (!content) return '';
    return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  }


  selectUser(username: string): void {
    const mentionRegex = /@(\w*)$/;
    this.replyContent = this.replyContent.replace(mentionRegex, `@${username} `);
    this.userSuggestions = [];
  }

  replyToComment(commentId: number): void {
    this.replyingTo = commentId;
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyContent = '';
  }

  editReply(reply: any): void {
    reply.isEditing = true;
    reply.editContent = reply.content;
  }

  cancelEditReply(reply: any): void {
    reply.isEditing = false;
  }

  saveReply(reply: any): void {
    const content = reply.editContent;
    const id = reply.id;
    const folderId = reply.folderId;

    this.commentService.updateReply(id, folderId, content).subscribe(
      (response) => {
        reply.content = content;
        reply.isEditing = false;
        this.cdr.detectChanges();
      },
      (error) => {
        // console.error('Error updating reply', error);
      }
    );
  }
  deleteReply(replyId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Êtes-vous sûre de vouloir supprimé votre réponse ?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User confirmed deletion
        this.commentService.deleteReply(replyId).subscribe(
          () => {
            this.toastrService.success('Comment deleted successfully');
            this.comments = this.comments.filter(comment => comment.id !== replyId);
            this.fetchFolders();
          },
          (error) => {
            this.toastrService.error('Failed to delete comment');
          }
        );
      }
    });
  }
  showUserReply(commentId: number): void {
    this.isUserReplyVisible[commentId] = !this.isUserReplyVisible[commentId];
    
    // Highlight the replies of the specific comment
    if (this.isUserReplyVisible[commentId]) {
      this.highlightReplyId = commentId; // Or set this to the specific reply ID if needed
    } else {
      this.highlightReplyId = null;
    }
  }
  ///////////////////////////
  //folder edit
  EditContent(): void {
    if (this.selectedCard) {
      this.isEditing = true;
      this.editContent = this.selectedCard.content;
    }
  }

  EditFolderContent(): void {
    if (this.selectedCard) {
      const content = this.editContent;
      const id = this.selectedCard.id;
      const folderId = id;
      this.folderService.updateFolderContent(folderId, content).subscribe(
        (response) => {
          this.selectedCard.content = content;
          const folderIndex = this.folders.findIndex(folder => folder.id === id);
          if (folderIndex !== -1) {
            this.folders[folderIndex].content = content;
          }
          this.isEditing = false;

          this.cdr.detectChanges();
        },
        (error) => {
          // console.error('Error updating folder', error);
        }
      );
    }
  }


  cancelEdit(): void {
    this.isEditing = false;
    this.editContent = '';
  }

  ///////////////////////////
  //comment

  editComment(comment: any): void {
    comment.isEditing = true;
    comment.editContent = comment.content;
  }

  cancelEditComment(comment: any): void {
    comment.isEditing = false;
  }

  saveComment(comment: any): void {
    const content = comment.editContent;
    const id = comment.id;
    const folderId = comment.folderId;

    this.commentService.updateComment(id, folderId, content).subscribe(
      (response) => {
        comment.content = content;
        comment.isEditing = false;
        this.cdr.detectChanges();
      },
      (error) => {
        // console.error('Error updating comment', error);
      }
    );
  }

  deleteComment(commentId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Êtes-vous sûre de vouloir supprimé ce commentaire ?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commentService.deleteComment(commentId).subscribe(
          () => {
            this.toastrService.success('Commentaire supprimé avec succès');
            this.comments = this.comments.filter(comment => comment.id !== commentId);
            //    this.fetchFolders();
          },
          (error) => {
            this.toastrService.error('Erreur lors de la suppression');
          }
        );
      }
    });
  }


  ////////////////////////////
  ///publish post

  onSubmit() {
    if (this.folderForm.invalid) {
      return;
    }

    const folderData = new FormData();
    folderData.append('category', this.folderForm.get('category')?.value);
    folderData.append('title', this.folderForm.get('title')?.value);
    folderData.append('content', this.folderForm.get('content')?.value);

    // Only append the file if it exists
    const uploadedFile = this.folderForm.get('uploadedFile')?.value;
    if (uploadedFile) {
      folderData.append('uploadedFile', uploadedFile);
    }

    this.folderService.createFolder(folderData).subscribe(
      (response) => {
        this.folderForm.reset();
        this.toastrService.success('Poste créé avec succès');
        this.fetchFolders();
      },
      (error) => {
        // console.error('Error during folder creation:', error);
        this.toastrService.error('Erreur lors de la création');
      }
    );
  }


  chooseImage(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.folderForm.patchValue({
        uploadedFile: fileInput.files[0]
      });
    } else {
      this.folderForm.patchValue({
        uploadedFile: null
      });
    }
  }


  toggleCategory() {
    this.isCategoryHidden = !this.isCategoryHidden;
  }
  filterForumByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === '') {
      this.filteredForum = this.folders;  // Reset to all folders if 'Tout afficher'
      this.filteredAdminNotes = this.adminNotes;  // Reset to all admin notes if 'Tout afficher'
    } else {
      this.filteredForum = this.folders.filter(folder => folder.category === category);
      this.filteredAdminNotes = this.adminNotes.filter(note => note.category === category);
    }

    // Update visible page ranges for both datasets
    this.updateVisiblePageRangeUserFolders();
    this.updateVisiblePageRangeAdminNotes();
  }

  get paginatedUserFolders(): any[] {
    const startIndex = (this.currentPageUserFolders - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredForum.slice(startIndex, endIndex);
  }

  get paginatedAdminNotes(): any[] {
    const startIndex = (this.currentPageAdminNotes - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAdminNotes.slice(startIndex, endIndex);
  }

  changePageUserFolders(pageNumber: number): void {
    this.currentPageUserFolders = pageNumber;
    this.updateVisiblePageRangeUserFolders();
  }

  changePageAdminNotes(pageNumber: number): void {
    this.currentPageAdminNotes = pageNumber;
    this.updateVisiblePageRangeAdminNotes();
  }

  previousPageUserFolders(): void {
    if (this.currentPageUserFolders > 1) {
      this.currentPageUserFolders--;
      this.updateVisiblePageRangeUserFolders();
    }
  }

  nextPageUserFolders(): void {
    if (this.currentPageUserFolders < this.getTotalPagesUserFolders()) {
      this.currentPageUserFolders++;
      this.updateVisiblePageRangeUserFolders();
    }
  }

  previousPageAdminNotes(): void {
    if (this.currentPageAdminNotes > 1) {
      this.currentPageAdminNotes--;
      this.updateVisiblePageRangeAdminNotes();
    }
  }

  nextPageAdminNotes(): void {
    if (this.currentPageAdminNotes < this.getTotalPagesAdminNotes()) {
      this.currentPageAdminNotes++;
      this.updateVisiblePageRangeAdminNotes();
    }
  }

  getTotalPagesUserFolders(): number {
    return Math.ceil(this.filteredForum.length / this.itemsPerPage);
  }

  getTotalPagesAdminNotes(): number {
    return Math.ceil(this.filteredAdminNotes.length / this.itemsPerPage);
  }

  updateVisiblePageRangeUserFolders(): void {
    const totalPages = this.getTotalPagesUserFolders();
    this.visiblePageRangeUserFolders = this.calculateVisiblePageRange(this.currentPageUserFolders, totalPages);
  }

  updateVisiblePageRangeAdminNotes(): void {
    const totalPages = this.getTotalPagesAdminNotes();
    this.visiblePageRangeAdminNotes = this.calculateVisiblePageRange(this.currentPageAdminNotes, totalPages);
  }

  calculateVisiblePageRange(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    let startPage = currentPage - Math.floor(maxVisiblePages / 2);
    let endPage = currentPage + Math.ceil(maxVisiblePages / 2) - 1;

    if (startPage < 1) {
      endPage += (1 - startPage);
      startPage = 1;
    }
    if (endPage > totalPages) {
      startPage -= (endPage - totalPages);
      endPage = totalPages;
    }
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }

  switchTab(tab: string): void {
    this.tab = tab;
  }


  getLoggedInUserId(): void {
    const authData = this.tokenService.getAuthData();
    if (authData && authData.accessToken) {
      this.authService.verifyToken(authData.accessToken).subscribe(
        (response) => {
          if (response.valid) {
            this.loggedInUserId = response.userId;
            this.cdr.detectChanges();
          } else {
            this.loggedInUserId = null;
          }
        },
        (error) => {
          //console.error('Error verifying token:', error);
          this.loggedInUserId = null;
        }
      );
    }
  }


  goToUserFolders(id: number,): void {
    this.router.navigate(['/user-folders', id]);
  }
}

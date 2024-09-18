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
import { userService } from '../../service/user.service';

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
  folderId!: number;


  selectedCard: any = null;
  selectedNote: any = null;

  forum: any[] = [];
  adminNotes: any[] = [];
  adminNotesCount: number = 0;

  currentDate: Date = new Date();
  selectedCategory: string = '';
  uploadedFile: File | null = null;

  /////////////////////////////
  commentContent: string = '';
  comments: any[] = [];
  replyContent: string = '';
  replyingTo: number | null = null;
  isEditing: boolean = false;
  isEditingComment: { [key: number]: boolean } = {};
  editContent: string = '';
  /////////////////////////////
  IsUserLogged: boolean = false;
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
  highlightReplyId: number | null = null;

  @ViewChild('commentList') commentList!: ElementRef;
  sanitizedContent!: SafeHtml;
  //////////////////
  paginatedComments: any[] = [];
  paginatedAdminNote: any[] = [];
  paginatedFolder: any[] = [];

  commentCurrentPage: number = 1;
  folderCurrentPage: number = 1;
  adminNotescurrentPage: number = 1;

  commentTotalPages: number = 0;
  folderTotalPage: number = 0;
  adminNotesTotalPage: number = 0;
  itemsPerPage: number = 10;
  /////////////////
  isAdmin: boolean = false;
  userId!: number

  category: any[] = [
    { name: 'fertilité' },
    { name: 'cardiologie' },
    { name: 'santé bébé' },
    { name: 'génécologie' },
    { name: 'blague/détente' },
    { name: 'problème de couple' },
    { name: 'problème familiale' },
    { name: 'relation sentimental' },
    { name: 'administrateur' },
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
    { label: 'administrateur', value: 'administrateur' },
    { label: 'autre', value: 'autre', }
  ]


  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
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
    private userService: userService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
  ) {
    this.folderForm = this.fb.group({
      category: ['', Validators.required],
      title: ['', Validators.required],
      content: ['', Validators.required],
      uploadedFile: [null],
    });

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(prefix => {
      if (prefix.length > 1) {
        this.fetchUserSuggestions(prefix);
      } else {
        this.userSuggestions = [];
      }
    });

    this.route.params.subscribe(params => {
      this.userId = +params['id'];
    });
  }


  setSanitizedContent(content: string): void {
    this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(content);
  }

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();

    this.route.paramMap.subscribe(params => {
      const folderId = +params.get('id')!;
      const commentId = +this.route.snapshot.queryParamMap.get('commentId')!;
      this.folderId = folderId;
      // Load selected card and comments
      const savedCard = JSON.parse(localStorage.getItem('selectedCard')!);
      if (savedCard && savedCard.id === folderId) {
        this.selectedCard = savedCard;
        this.fetchComments(this.selectedCard.id);
      } else {
        this.deselectCard();
      }
      if (commentId) {
        this.highlightCommentId = commentId;
      } else {
        this.highlightCommentId = null;
      }
    });
    localStorage.removeItem('highlightCommentId');
    //logged user
    this.authService.loggedInUser$.subscribe(user => {
      if (user) {
        this.loggedInUserId = user.id;

        if (this.isAdmin) {
          this.loggedInUserId = user.id;
        }
        this.fetchAdminNote();

      } else {
        this.loggedInUserId = null;
      }
    });

    // Other initialization
    this.onResize();
    this.fetchFolders();
    this.updateTime();
    this.updateCommentPagination();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.highlightCommentOrReply();
    }, 100);
    // Scroll to last comment if no specific highlight
    setTimeout(() => {
      if (!this.highlightCommentId && !this.highlightReplyId && this.lastCommentId) {
        this.scrollToLastComment();
      }
    }, 300);
  }

  updateTime(): void {
    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  selectCard(folder: any): void {
    this.selectedCard = folder;
    localStorage.setItem('selectedCard', JSON.stringify(folder));
    this.fetchComments(folder.id);
    this.cdr.detectChanges();
  }

  deselectCard(): void {
    this.selectedCard = null;
    this.comments = [];
    this.highlightCommentId = null;
    this.router.navigate(['/chat'], {
      replaceUrl: true
    });

    this.cdr.detectChanges();
  }

  selectNote(note: any): void {
    this.selectedNote = note;
    localStorage.setItem('selectedNote', JSON.stringify(note));
    this.viewNoteAndMarkAsRead(note)
  }



  deselectNote(): void {
    this.selectedNote = null;
    localStorage.removeItem('selectedNote');
  }

  ////////////////////////////////
  //folders
  fetchFolders(): void {
    this.folderService.getFolderDetails().subscribe(
      (folders) => {
        this.folders = folders
          .filter((folder: { isAdmin: any; }) => !folder.isAdmin)
          .map((folder: { uploadedFile: any; user: any; createdAt: Date }) => ({
            ...folder,
            FolderUploadedFileUrl: folder.uploadedFile ? `${environment.apiUrl}/blog-backend/userFile/${folder.uploadedFile}` : null,
            userProfileImageUrl: folder.user?.uploadedFile ? `${environment.apiUrl}/blog-backend/ProfilPic/${folder.user.uploadedFile}` : 'https://api.dicebear.com/6.x/initials/svg?seed=User',
          }))
          .sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        this.paginatedFolder = this.folders;
        this.folders.forEach(folder => {
          this.fetchComments(folder.id);
          this.paginatedFolders();
        });

      },
      (error) => {
        // console.error('Error fetching folders:', error);
      }
    );
  }


  fetchAdminNote(): void {
    this.folderService.fetchAdminNote().subscribe(
      (folders: any[]) => {

        // Check read status per user
        this.adminNotes = folders.map((folder) => {
          const userStatus = folder.noteReadStatus.find((status: { user: { id: number }; read: boolean }) => status.user.id === this.loggedInUserId);
          return {
            ...folder,
            uploadedFileUrl: folder.uploadedFile ? `${environment.apiUrl}/blog-backend/adminFile/${folder.uploadedFile}` : null,
            read: userStatus ? userStatus.read : false
          };
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        this.paginatedAdminNote = this.adminNotes;
        this.paginatedAdminNotes();
        this.adminNotesCount = this.adminNotes.filter(n => !n.read).length;

      },
      (error) => {
        //  console.error('Error fetching admin notes:', error);
      }
    );
  }

  viewNoteAndMarkAsRead(note: any): void {
    if (this.loggedInUserId) {

      this.folderService.markNoteAsRead(note.id, this.loggedInUserId).subscribe(
        (response) => {
          this.fetchAdminNote();
          this.cdr.detectChanges();
        },
        (error) => {
          // console.error('Error marking note as read:', error);
        }
      );
    }
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
              this.toastrService.success('Votre poste a été supprimé ');
              this.folders = this.folders.filter(folder => folder.id !== folderId); // Remove the folder from the list
              this.deselectCard();
              this.fetchFolders();
              this.cdr.detectChanges();
            },
            (error) => {
              this.toastrService.error('Erreur lors de la suppression');
            }
          );
        }
      });
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

  fetchComments(folderId: number): void {
    this.commentService.getComments(folderId).subscribe(
      (comments: any[]) => {
        this.comments = comments.map(comment => {
          const isAdmin = comment.user?.role === 'admin';

          comment.userProfileImageUrl = comment.user?.uploadedFile
            ? `${environment.apiUrl}/blog-backend/ProfilPic/${comment.user.uploadedFile}`
            : 'https://api.dicebear.com/6.x/initials/svg?seed=User';

          comment.isAdmin = isAdmin;

          if (comment.replies) {
            comment.replies = comment.replies.map((reply: { userProfileImageUrl: string; user: { uploadedFile: any; }; }) => {
              reply.userProfileImageUrl = reply.user?.uploadedFile
                ? `${environment.apiUrl}/blog-backend/ProfilPic/${reply.user.uploadedFile}`
                : 'https://api.dicebear.com/6.x/initials/svg?seed=User';
              return reply;
            });
          }
          return comment;
        });

        const totalCommentsCount = comments.reduce((acc, comment) => {
          return acc + 1 + (comment.replies ? comment.replies.length : 0);
        }, 0);

        this.commentsCount[folderId] = totalCommentsCount;
        this.cdr.detectChanges();

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

        this.updateCommentPagination();
        this.paginatedComments = this.comments;
        this.highlightCommentOrReply()
      },
      (error) => {
        //  console.error('Error fetching comments for folder ID:', folderId, error);
      }
    );
  }

  private highlightCommentOrReply(): void {
    if (this.highlightCommentId) {
      const commentElement = document.getElementById(`comment-${this.highlightCommentId}`);
      if (commentElement) {
        commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        commentElement.classList.add('highlight');
      }
    }

    if (this.highlightReplyId) {
      const replyElement = document.getElementById(`reply-${this.highlightReplyId}`);
      if (replyElement) {
        replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        replyElement.classList.add('highlight');
      }
    }
  }

  handleLastCommentClick(folderId: number): void {
    this.selectCard(this.paginatedFolder.find(folder => folder.id === folderId));
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
    }, 300);
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
        //  console.error('Error updating comment', error);
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
            this.fetchFolders();
          },
          (error) => {
            this.toastrService.error('Erreur lors de la suppression');
          }
        );
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
          this.replyContent = '';
          this.replyingTo = null;
          this.fetchComments(this.selectedCard.id);
        },
        error => {
          //  console.error('Error adding reply:', error);
        }
      );
  }

  showUserReply(commentId: number, replyIdToHighlight: number | null = null): void {
    this.isUserReplyVisible[commentId] = !this.isUserReplyVisible[commentId];
    if (this.isUserReplyVisible[commentId]) {
      this.highlightReplyId = replyIdToHighlight;
    } else {
      this.highlightReplyId = null;
    }
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
            this.toastrService.success('Votre réponse a été supprimé');
            this.comments = this.comments.filter(comment => comment.id !== replyId);
            this.fetchFolders();
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

  ////////////////////////////
  //filter category

  toggleCategory() {
    this.isCategoryHidden = !this.isCategoryHidden;
  }

  filterForumByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === '') {
      this.paginatedFolder = this.folders;
      this.paginatedAdminNote = this.adminNotes;
    } else {
      this.paginatedFolder = this.folders.filter(folder => folder.category === category);
      this.paginatedAdminNote = this.adminNotes.filter(note => note.category === category);
    }
  }

  //////////////////////////
  //pagination

  paginatedFolders() {
    this.folderTotalPage = Math.ceil(this.folders.length / this.itemsPerPage)
    const startIndex = (this.folderCurrentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedFolder = this.folders.slice(startIndex, endIndex);

  }
  goToFolderPage(page: number) {
    if (page > 0 && page <= this.folderTotalPage) {
      this.folderCurrentPage = page;
      this.paginatedFolders();
    }
  }

  nextFolderPage() {
    if (this.folderCurrentPage < this.folderTotalPage) {
      this.folderCurrentPage++;
      this.paginatedFolders();
    }
  }

  prevFolderPage() {
    if (this.folderCurrentPage > 1) {
      this.folderCurrentPage--;
      this.paginatedFolders()
    }
  }
  ///////////////////////////
  paginatedAdminNotes() {
    this.adminNotesTotalPage = Math.ceil(this.adminNotes.length / this.itemsPerPage)
    const startIndex = (this.adminNotescurrentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAdminNote = this.adminNotes.slice(startIndex, endIndex);

  }

  goToAdminPage(page: number) {
    if (page > 0 && page <= this.adminNotesTotalPage) {
      this.adminNotescurrentPage = page;
      this.paginatedAdminNotes()
    }
  }

  nextAdminPage() {
    if (this.adminNotescurrentPage < this.adminNotesTotalPage) {
      this.adminNotescurrentPage++;
      this.paginatedAdminNotes()
    }
  }

  prevAdminPage() {
    if (this.adminNotescurrentPage > 1) {
      this.adminNotescurrentPage--;
      this.paginatedAdminNotes()
    }
  }

  //////////////////////////
  updateCommentPagination() {
    this.commentTotalPages = Math.ceil(this.comments.length / this.itemsPerPage);
    const startIndex = (this.commentCurrentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedComments = this.comments.slice(startIndex, endIndex);
  }

  goToCommentPage(page: number) {
    if (page > 0 && page <= this.commentTotalPages) {
      this.commentCurrentPage = page;
      this.updateCommentPagination();
    }
  }

  nextCommentPage() {
    if (this.commentCurrentPage < this.commentTotalPages) {
      this.commentCurrentPage++;
      this.updateCommentPagination()
    }
  }

  prevCommentPage() {
    if (this.commentCurrentPage > 1) {
      this.commentCurrentPage--;
      this.updateCommentPagination()
    }
  }

  /////////////////////////

  switchTab(tab: string): void {
    this.tab = tab;
  }

  goToUserProfil(id: number,): void {
    this.router.navigate(['/user-profil', id]);
  }

  toggleBlockUser(userId: number, currentBlockedState: boolean): void {
    if (userId) {
      const newBlockedState = !currentBlockedState; // Toggle the state
      this.userService.blockUser(userId, newBlockedState).subscribe(
        () => {
          const action = newBlockedState ? 'blocked' : 'unblocked';
          this.updateCommentState(userId, newBlockedState);
        },
        error => {
          //  console.error(`Error ${newBlockedState ? 'blocking' : 'unblocking'} user:`, error);
        }
      );
    } else {
      //   console.error('Invalid user ID');
    }
  }

  updateCommentState(userId: number, newBlockedState: boolean): void {
    const comment = this.comments.find(c => c.user.id === userId);
    if (comment) {
      comment.user.blocked = newBlockedState;
    }
  }


}

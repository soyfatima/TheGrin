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
  currentDate: Date = new Date();

  forum: any[] = [];
  filteredForum: any[] = [];
  selectedCategory: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  visiblePageRange: number[] = [];
  selectedCard: any = null;
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
  isUserReplyVisible: boolean = false
  ///////////////////////////
  commentsCount: { [key: number]: number } = {};
  lastCommentDetails: { [key: number]: { user: string, time: string, id: number } } = {};
  lastCommentId: number | null = null;
  userSuggestions: any[] = [];
  private searchSubject = new Subject<string>();
  formattedReplyContent: string = '';

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
    private sanitizer: DomSanitizer
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
      this.folderId = folderId;
      this.selectedCard = JSON.parse(localStorage.getItem('selectedCard')!);
      if (this.selectedCard && this.selectedCard.id === folderId) {
        this.fetchComments(this.selectedCard.id);
      }
    });

    const savedCard = localStorage.getItem('selectedCard');
    if (savedCard) {
      this.selectedCard = JSON.parse(savedCard);
      this.fetchComments(this.selectedCard.id);
    }
    this.onResize();
    this.fetchFolders();
    this.updateTime();
    this.getLoggedInUserId();
  }

  selectCard(folder: any): void {
    this.selectedCard = folder;
    localStorage.setItem('selectedCard', JSON.stringify(folder));
    this.fetchComments(folder.id);
    this.cdr.detectChanges(); // Force change detection

  }


  deselectCard(): void {
    this.selectedCard = null;
    localStorage.removeItem('selectedCard');
    this.comments = [];
    this.cdr.detectChanges(); // Force change detection
    // this.fetchComments(folder.id);

  }
  //fetch folders and details
  fetchFolders(): void {
    this.folderService.getFolderDetails().subscribe(
      (folders) => {
        // Assurez-vous que 'createdAt' est le nom correct du champ de date dans votre API
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
//        console.error('Error fetching folders:', error);
      }
    );
  }



  deleteFolder() {
    if (this.selectedCard) {
      const id = this.selectedCard.id;
      const folderId = id;

      if (confirm('Are you sure you want to delete this folder?')) {
        this.folderService.deleteFolder(folderId).subscribe(
          () => {
            this.toastrService.success('Folder deleted successfully');
            this.folders = this.folders.filter(folder => folder.id !== folderId); // Remove the folder from the list
            this.deselectCard();
            this.fetchFolders();
            this.cdr.detectChanges();
          },
          (error) => {
            this.toastrService.error('Failed to delete folder');
        //    console.error('Failed to delete folder:', error);
          }

        );
      }
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
    }, 300); // Adjust the delay as necessary
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
          this.lastCommentId = lastComment.id; // Set the last comment ID
        } else {
          this.lastCommentDetails[folderId] = {
            user: '',
            time: '',
            id: 0
          };
          this.lastCommentId = null; // No comments
        }
        this.comments = comments.map((comment: any) => {
          const profilePictureUrl = comment.user?.uploadedFile ? `${environment.apiUrl}/blog-backend/uploads/${comment.user.uploadedFile}` : null;
          console.log('User Profile Picture URL:', profilePictureUrl); // Log URL for debugging
          return {
            ...comment,
            userProfilePictureUrl: profilePictureUrl
          };
        });

        console.log('comments', comments)
        if (this.selectedCard && this.selectedCard.id === folderId) {
          this.comments = comments;
          //  setTimeout(() => this.scrollToLastComment(), 300); // Ensure comments are rendered
        }
      },
      (error) => {
        // console.error('Error fetching comments for folder ID:', folderId, error);
      }
    );
  }

  handleLastCommentClick(folderId: number): void {
    // Select the card
    this.selectCard(this.paginatedForum.find(folder => folder.id === folderId));

    // Wait for the view to update and then scroll
    setTimeout(() => {
      this.scrollToLastComment();
    }, 300); // Adjust the timeout if necessary
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
    const mentionMatch = this.replyContent.match(/@(\w*)$/); // Capture last mention in the input
    if (mentionMatch) {
      const prefix = mentionMatch[1]; // Get the prefix after '@'
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
    // Replace the last mention with the selected username
    const mentionRegex = /@(\w*)$/;
    this.replyContent = this.replyContent.replace(mentionRegex, `@${username} `);
    this.userSuggestions = []; // Clear suggestions after selection
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
    reply.editContent = reply.content; // Pre-fill the textarea with the existing content
  }

  cancelEditReply(reply: any): void {
    reply.isEditing = false;
  }

  saveReply(reply: any): void {
    const content = reply.editContent;
    const id = reply.id;
    const folderId = reply.folderId; // Ensure folderId is correctly retrieved from the reply object

    this.commentService.updateReply(id, folderId, content).subscribe(
      (response) => {
        // Update the reply content
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
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteReply(replyId).subscribe(
        () => {
          this.toastrService.success('commentaire supprimé avec succès');
          this.comments = this.comments.filter(comment => comment.id !== replyId);
          this.fetchFolders();
        },
        (error) => {
          this.toastrService.error('Erreur lors de la suppression');
          //    console.error('Failed to delete comment:', error);
        }
      );
    }
  }
  showUserReply() {
    this.isUserReplyVisible = !this.isUserReplyVisible
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
    const folderId = comment.folderId; // Assuming folderId is available in comment object

    this.commentService.updateComment(id, folderId, content).subscribe(
      (response) => {
        // Update the comment content
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
    if (confirm('Are you sure you want to delete this comment?')) {

      this.commentService.deleteComment(commentId).subscribe(
        () => {
          this.toastrService.success('Commentaire supprimé avec succès');
          this.comments = this.comments.filter(comment => comment.id !== commentId);
          this.fetchFolders();

        },
        (error) => {
          this.toastrService.error('Erreur lors de la suppression');
          //  console.error('Failed to delete comment:', error);
        }
      );
    }
  }


  //create folder
  // onSubmit() {
  //   if (this.folderForm.invalid) {
  //     return;
  //   }

  //   const folderData = this.folderForm.value;
  //   this.folderService.createFolder(folderData).subscribe(
  //     (response) => {
  //       this.toastrService.success('Poste crée avec succès');
  //       this.folderForm.reset();
  //     },
  //     (error) => {
  //       this.toastrService.error('Erreur lors de la création');
  //       //  console.error('Failed to create folder:', error);
  //     }
  //   );
  // }

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


  // Method to handle file selection
  chooseImage(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.folderForm.patchValue({
        uploadedFile: fileInput.files[0]
      });
    } else {
      // Clear the uploadedFile if no file is selected
      this.folderForm.patchValue({
        uploadedFile: null
      });
    }
  }


  toggleCategory() {
    this.isCategoryHidden = !this.isCategoryHidden;
  }

  filterForumByCategory(category: string) {
    this.selectedCategory = category;
    if (this.selectedCategory) {
      this.filteredForum = this.folders.filter(forum => forum.category === category);
    } else {
      this.filteredForum = this.folders;
    }
  }


  clearFilter() {
    this.selectedCategory = '';
    this.filteredForum = this.forum;
  }


  get paginatedForum(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredForum.slice(startIndex, endIndex);
  }

  changePage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.updateVisiblePageRange();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredForum.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pageCount = Math.ceil(this.filteredForum.length / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  updateVisiblePageRange(): void {
    const totalPages = this.getTotalPages();
    const maxVisiblePages = 5;
    // Calcul de la plage de pages actuellement affichée
    let startPage = this.currentPage - Math.floor(maxVisiblePages / 2);
    let endPage = this.currentPage + Math.ceil(maxVisiblePages / 2) - 1;

    // Ajustement de la plage de pages si elle dépasse les limites
    if (startPage < 1) {
      endPage += (1 - startPage);
      startPage = 1;
    }
    if (endPage > totalPages) {
      startPage -= (endPage - totalPages);
      endPage = totalPages;
    }
    // Mise à jour de la plage de pages actuellement affichée
    this.visiblePageRange = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
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
            this.cdr.detectChanges(); // Force change detection
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

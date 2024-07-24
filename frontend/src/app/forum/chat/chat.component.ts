import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FolderService } from '../../service/folder.service';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { CommentService } from '../../service/comment.service';
import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/tokenservice';

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
  isUserReplyVisible:boolean = false

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

    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private commentService: CommentService,
    private cdr: ChangeDetectorRef
  ) {
    this.route.paramMap.subscribe(params => {
      this.folderId = +params.get('id')!;
    });
  }


  ngOnInit() {
    this.folderForm = this.fb.group({
      category: ['', Validators.required],
      title: ['', Validators.required],
      content: ['', Validators.required]
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

  //fetch folders and details
  fetchFolders(): void {
    this.folderService.getFolderDetails().subscribe(
      (folders) => {
        this.folders = folders.map((folder: { uploadedFile: any; }) => ({
          ...folder,
          uploadedFileUrl: `${environment.apiUrl}/blog-backend/uploads/${folder.uploadedFile}`,
        }));
        this.filteredForum = this.folders;
        //console.log('folders', folders)
      },
      (error) => {
        // console.error('Error fetching folders:', error);
      }
    );
  }

  
  selectCard(folder: any): void {
    this.selectedCard = folder;
    console.log('Selected card:', this.selectedCard); 
    localStorage.setItem('selectedCard', JSON.stringify(folder));
    this.fetchComments(folder.id);
    this.cdr.detectChanges(); // Force change detection

  }

  deselectCard(): void {
    this.selectedCard = null;
    localStorage.removeItem('selectedCard');
    this.comments = []; 
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

  fetchComments(id: any): void {
    this.commentService.getComments(this.selectedCard.id).subscribe(
      (data: Comment[]) => {
        this.comments = data;
      },
      (error) => {
        // console.error('Error fetching comments:', error);
      }
    );
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
        console.log('Reply updated successfully', response);

        // Update the reply content
        reply.content = content;
        reply.isEditing = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error updating reply', error);
      }
    );
  }

showUserReply(){
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
      console.log(`Updating folder with id: ${folderId}, content: ${content}`);
      this.folderService.updateFolderContent(folderId, content).subscribe(
        (response) => {
          console.log('Folder updated successfully', response);
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
        console.log('Comment updated successfully', response);

        // Update the comment content
        comment.content = content;
        comment.isEditing = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error updating comment', error);
      }
    );
  }


  //create folder
  onSubmit() {
    if (this.folderForm.invalid) {
      return;
    }

    const folderData = this.folderForm.value;
    this.folderService.createFolder(folderData).subscribe(
      (response) => {
        this.toastrService.success('Poste crée avec succès');
        this.folderForm.reset();
        console.log('folder', response);
      },
      (error) => {
        this.toastrService.error('Erreur lors de la création');
        //  console.error('Failed to create folder:', error);
      }
    );
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
            console.log('Logged in user ID:', this.loggedInUserId);
            this.cdr.detectChanges(); // Force change detection
          } else {
            this.loggedInUserId = null;
          }
        },
        (error) => {
          console.error('Error verifying token:', error);
          this.loggedInUserId = null;
        }
      );
    }
  }
}

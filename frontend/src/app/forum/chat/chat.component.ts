import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FolderService } from '../../service/folder.service';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { CommentService } from '../../service/comment.service';

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
  replyingTo: number | null = null; // Initialize replyingTo to null

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

  cards = [
    {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'cindy', time: ' il y a 1 min',
      titre: 'distribution of letters, as opposed  ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    },
    {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'nobody', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed  ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    },
    {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'jushuao', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed  ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    },
    {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'its-Me', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed  ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    },
    {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'its-Me', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed  ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    }, {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'its-Me', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed  ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    }, {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'its-Me', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed  ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    }, {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'its-Me', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed  ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    }, {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'its-Me', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed  ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    },
  ];

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
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private commentService: CommentService
  ) {
    this.route.paramMap.subscribe(params => {
      this.folderId = +params.get('id')!; // Adjust based on your route
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
      this.fetchComments(this.selectedCard.id); // Fetch comments if a card is already selected
    }
    this.onResize();
    this.fetchFolders();
    this.updateTime();
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
        console.log('folders', folders)
      },
      (error) => {
        console.error('Error fetching folders:', error);
      }
    );
  }
  updateTime(): void {
    setInterval(() => {
      this.currentDate = new Date();
    }, 1000); // Met à jour la date et l'heure chaque seconde
  }

  submitComment(): void {
    if (this.commentContent.trim() === '') {
      // Optionally handle empty comment submission
      return;
    }
    this.commentService.addComment(this.selectedCard.id, this.commentContent)
      .subscribe(
        response => {
          console.log('Comment added successfully', response);
          this.commentContent = '';
          this.fetchComments(this.selectedCard.id);
        },
        error => {
          console.error('Error adding comment:', error);
          // Optionally, handle error (show notification, etc.)
        }
      );
  }

  fetchComments(id: any): void {
    this.commentService.getComments(this.selectedCard.id).subscribe(
      (data:Comment[]) => {
        this.comments = data;
        console .log('comment and replies' , data)
      },
      (error) => {
        console.error('Error fetching comments:', error);
      }
    );
  }


  submitReply(): void {
    if (this.replyContent.trim() === '' || this.replyingTo === null) {
      return;
    }
  
    this.commentService.addReply(this.replyingTo, this.replyContent)
      .subscribe(
        response => {
          console.log('Reply added successfully', response);
          this.replyContent = '';
          this.replyingTo = null;
          this.fetchComments(this.selectedCard.id); // Refresh comments after adding a reply
        },
        error => {
          console.error('Error adding reply:', error);
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
  

  onSubmit() {
    if (this.folderForm.invalid) {
      return;
    }

    console.log('Form Values:', this.folderForm.value); // Log form values

    const folderData = this.folderForm.value; // Directly use form values as JSON

    this.folderService.createFolder(folderData).subscribe(
      (response) => {
        this.toastrService.success('Poste crée avec succès');
        this.folderForm.reset();
        console.log('folder', response);
      },
      (error) => {
        this.toastrService.error('Erreur lors de la création');
        console.error('Failed to create folder:', error);
      }
    );
  }

  toggleCategory() {
    this.isCategoryHidden = !this.isCategoryHidden;
  }

  
  selectCard(folder: any): void {
    this.selectedCard = folder;
    localStorage.setItem('selectedCard', JSON.stringify(folder)); // Save the selected folder to LocalStorage
    this.fetchComments(folder.id); // Fetch comments for the selected folder
  }

  deselectCard(): void {
    this.selectedCard = null;
    localStorage.removeItem('selectedCard'); // Remove from LocalStorage
    this.comments = []; // Clear comments when deselecting a card
  }
  
  filterForumByCategory(category: string) {
    this.selectedCategory = category;
    if (this.selectedCategory) {
      this.filteredForum = this.folders.filter(forum => forum.category === category); // Utilisez `this.folders` ici
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


}

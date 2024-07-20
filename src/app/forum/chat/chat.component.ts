import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  tab = 'forum';
  activeTab: string = 'forum';
  iscategoryActive: boolean = false
  forum: any[] = [];
  filteredForum: any[] = [];
  selectedCategory: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  visiblePageRange: number[] = [];
  selectedCard: any = null;

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
      username: 'cindy', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed to using Content here, content here ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    },
    {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'nobody', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed to using Content here, content here ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    },
    {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'jushuao', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed to using Content here, content here ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    },
    {
      img: 'https://firebasestorage.googleapis.com/v0/b/store-img-e8d36.appspot.com/o/TheGrin%2Fcta-img.jpg?alt=media&token=1ce80d8a-0b09-425d-a61c-c4dc52d64848',
      username: 'its-Me', time: 'publié il y a 1 min',
      titre: 'distribution of letters, as opposed to using Content here, content here ....',
      message: 'distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here distribution of letters, as opposed to using Content here, content here ....'
    },
  ]

  constructor() { }

  ngOnInit() {
    const savedCard = localStorage.getItem('selectedCard');
    if (savedCard) {
      this.selectedCard = JSON.parse(savedCard);
    }
  }

  toggleCategory() {
    this.iscategoryActive = !this.iscategoryActive
  }

  filterForumByCategory(category: string) {
    this.selectedCategory = category;
    if (this.selectedCategory) {
      this.filteredForum = this.forum.filter(forum => forum.category === category);

    } else {
      this.filteredForum = this.forum;
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



  selectCard(card: any): void {
    this.selectedCard = card;
    localStorage.setItem('selectedCard', JSON.stringify(card)); // Enregistrer dans LocalStorage
  }

  deselectCard(): void {
    this.selectedCard = null;
    localStorage.removeItem('selectedCard'); // Supprimer de LocalStorage
  }

}

import { ChangeDetectorRef, Component } from '@angular/core';
import { FolderService } from '../../../service/folder.service';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../../../dialog-service';
import { ModifyComponent } from '../../dialog/modify/modify.component';

@Component({
  selector: 'app-my-note',
  templateUrl: './my-note.component.html',
  styleUrl: './my-note.component.css'
})
export class MyNoteComponent {
  folders: any[] = [];
  iscategoryActive: boolean = false
  filteredFolders: any[] = [];
  selectedCategory: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 4;
  visiblePageRange: number[] = [];
  comments!: any[];
  commentCount: number = 0;

  category = [
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

  constructor(private folderService: FolderService,
    private dialog: MatDialog,
    private toastrService: ToastrService,
    private dialogService: DialogService,
    private cdr : ChangeDetectorRef


  ) { }

  ngOnInit() {
    this.fetchAdminNote()
  }

  fetchAdminNote(): void {
    this.folderService.fetchAdminNote().subscribe(
      (folders) => {
        this.folders = folders.map((folder: { uploadedFile: any; }) => ({
          ...folder,
          uploadedFileUrl: folder.uploadedFile ? `${environment.apiUrl}/blog-backend/adminFile/${folder.uploadedFile}` : null,
      }));
        console.log('folder', this.folders)

           this.filteredFolders = this.folders;
      },
      (error) => {
        // console.error('Error fetching folders:', error);
      }
    );
  }



  //edit folders
  openDialog(folder: any): void {
    const dialogRef = this.dialog.open(ModifyComponent, {
      width: '500px',
      data: { folder, type: 'folder' }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  toggleCategory() {
    this.iscategoryActive = !this.iscategoryActive
  }

  //filter by category
  filterFoldersByCategory(category: string) {
    this.selectedCategory = category;
    if (this.selectedCategory) {
      this.filteredFolders = this.folders.filter(folder => folder.category === category);
    } else {
      this.filteredFolders = this.folders;
    }
  }

  //clear
  clearFilter() {
    this.selectedCategory = '';
    this.filteredFolders = this.folders;
  }

  //delete folder
  deleteFolder(id: number): void {
    this.dialogService.openDialog({}).subscribe((result: boolean) => {
      if (result) {
        this.folderService.deleteAdminNote(id).subscribe(
          () => {
            this.folders = this.folders.filter(folder => folder.id !== id);
            this.cdr.detectChanges();
this.fetchAdminNote()
            this.toastrService.success('article supprimé avec succès')

          },
          (error) => {
            this.toastrService.error('erreur lors de la suppression')
            // console.error('Error deleting folder:', error);
          }
        );
      }
    });

  }

  //fetch comments
  openCommentDialog(folderId: number): void {
    // this.commentService.getCommentsByFolderId(folderId).subscribe(
    //   (comments: any[]) => {
    //     this.comments = comments;
    //     this.commentCount = comments.length
    //     const dialogConfig = new MatDialogConfig();
    //     dialogConfig.data = { comments };
    //     dialogConfig.width = '500px';
    //     const dialogRef = this.dialog.open(UserCommentsComponent, dialogConfig);
    // //    this.commentCount = 0;

    //     dialogRef.afterClosed().subscribe(result => {
    //     });
    //   },
    //   (error) => {
    //     console.error('Erreur lors de la récupération des commentaires', error);
    //   }
    // );
  }

  get paginatedFolders(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredFolders.slice(startIndex, endIndex);
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
    return Math.ceil(this.filteredFolders.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pageCount = Math.ceil(this.filteredFolders.length / this.itemsPerPage);
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

}

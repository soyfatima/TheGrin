import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AnimationService } from '../../../service/animate-service';
import { ProductService } from '../../../service/product.service';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from '../../../dialog-service';
import { ModifyComponent } from '../../dialog/modify/modify.component';

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css',
  //  animations: [AnimationService.prototype.getFadeUpAnimation()]

})
export class ListProductsComponent {

  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  visiblePageRange: number[] = [];

  category: any[] = [
    { name: 'Équipements de diagnostic' },
    { name: 'Équipements de soins' },
    { name: 'Matériel de réanimation' },
    { name: 'Mobilier médical' },
    { name: 'Équipements de stérilisation' },
    { name: 'Prothèses et orthèses' },
    { name: 'Instruments chirurgicaux' },
    { name: 'Matériel de perfusion et d’injection' },
    { name: 'Équipements de radiologie et imagerie' },
    { name: 'Accessoires de laboratoire' }
];


  constructor(private route: ActivatedRoute,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private animationService: AnimationService,
    private productService: ProductService,
    private toastrService: ToastrService,

  ) { }

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.productService.fetchProduct().subscribe(
      (products) => {
        this.products = products.map((product: { uploadedFile: any; }) => ({
          ...product,

          uploadedFileUrl: `${environment.apiUrl}/blog-backend/productFile/${product.uploadedFile}`

        }));
        this.filteredProducts = this.products;
        //this.cdr.detectChanges();

      },
      (error) => {
     //   console.error('Error fectching products', error)
      }
    )
  }



  openDialog(product: any): void {
    const dialogRef = this.dialog.open(ModifyComponent, {
      width: '500px',
      data: { product, type: 'product' },
    });
   
    dialogRef.afterClosed().subscribe(result => {
      if (result) { 
        this.fetchProducts(); 
      }
    });
  }

  deleteProduct(id: number): void {
    this.dialogService.openDialog({}).subscribe((result: boolean) => {
      if (result) {
        this.productService.deleteProduct(id).subscribe(
          () => {
            this.products = this.products.filter(products => products.id !== id);
            this.fetchProducts();
            this.cdr.detectChanges();
            this.toastrService.success('article supprimé avec succès')
          },
          (error) => {
            this.toastrService.error('erreur lors de la suppression')
            //console.error('Error deleting folder:', error);
          }
        );
      }
    });
  }


  filterProductsByCategory(category: string) {
    this.selectedCategory = category;
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(products => products.category === category);

    } else {
      this.filteredProducts = this.products;
    }
  }

  clearFilter() {
    this.selectedCategory = '';
    this.filteredProducts = this.products;
  }



  get paginatedProducts(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
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
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pageCount = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
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

  formatNumberWithSeparator(montant: number): string {
    return this.productService.formatNumberWithSeparator(montant);
  }

}

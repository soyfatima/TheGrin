import { ChangeDetectorRef, Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AnimationService } from '../../service/animate-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { MatDialog } from '@angular/material/dialog';
import { CartService } from '../../service/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  userId:any;
  cart: any;
  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  visiblePageRange: number[] = [];

  category: any[] = [
    { name: 'invecters' },
    { name: 'panneau solaire' },
    { name: 'batteries' },
    { name: 'E-solaire hydride' },
    { name: 'accessoires' },
  ]

  product = [
    {
      imgsrc: 'https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/belt.webp',
      reduction: '10%', name: 'omdular', category: 'ondular', price: '134.000 fcfa'
    },
    {
      imgsrc: 'https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/belt.webp',
      reduction: '10%', name: 'omdular', category: 'ondular', price: '134.000 fcfa'
    },
    {
      imgsrc: 'https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Products/belt.webp',
      reduction: '10%', name: 'omdular', category: 'ondular', price: '134.000 fcfa'
    },

  ]


  constructor(private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private animationService: AnimationService,
    private productService: ProductService,
    private cartService: CartService,
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

          uploadedFileUrl: `${environment.apiUrl}/blog-backend/uploads/${product.uploadedFile}`

        }));
        this.filteredProducts = this.products;
      },
      (error) => {
        console.error('Error fectching products', error)
      }
    )
  }
  // openDialog(product: any): void {
  //   const dialogRef = this.dialog.open(PurchaseProductComponent, {
  //      width: '800px',
  //     data: { product, type:'product' }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //   });
  // }
  

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

  redirectTopurchaseProduct(id: number,): void {
    this.router.navigate(['/product-info', id]);
  }
  trackByProductId(index: number, product: any): number {
    return product.id;
  }

  //add to cart
  addToCart(productId: number): void {
    this.cartService.addToCart1(productId).subscribe(
      (data) => {
        this.toastrService.success('Article ajouté au panier avec succès');
      },
      (error) => {
        if (error.status === 409) { // Conflict status code for 'Item already in cart'
          this.toastrService.warning('Cet article est déjà dans votre panier');
        } else if (error.status === 404) { // Not found status code for 'Product not found'
          this.toastrService.error('Produit non trouvé');
        } else {
         // this.toastrService.error('Veuillez vous connecter pour ajouter cet article à votre panier');
        }
        console.error('Error adding product to cart:', error);
      }
    );
  }
  
}
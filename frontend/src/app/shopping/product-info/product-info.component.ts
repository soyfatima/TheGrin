import { Component, Inject } from '@angular/core';
import { ProductService } from '../../service/product.service';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../service/cart.service';
import { OrderComponent } from '../modal/order/order.component';

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrl: './product-info.component.css'
})
export class ProductInfoComponent {
  productDetails: any;
  productId!: number;
  quantity: number = 1;
  selectedSize: string = ''; 
  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private toastrService: ToastrService,
    private dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.productId = +params.get('id')!;
      this.fetchProductDetails();
    });
  }

  //fetch product details
  fetchProductDetails(): void {
    this.productService.getProductDetailsById(this.productId).subscribe(
      (productDetails) => {
        this.productDetails = {
          ...productDetails,
          uploadedFileUrl: `${environment.apiUrl}/blog-backend/uploads/${productDetails.uploadedFile}`
        };
      },
      (error) => {
        console.error('Error fetching product details:', error);
      }
    );
  }

  selectSize(selectedSize: string): void {
    this.selectedSize = selectedSize;
    this.updateCartItem();
  }

  incrementQuantity(): void {
    this.quantity++;
    this.updateCartItem();
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateCartItem();
    }
  }

  updateCartItem(): void {
    const updateData = { quantity: this.quantity, selectedSize: this.selectedSize };
    this.cartService.updateCartItem(this.productId, updateData).subscribe(
      (response) => {
        this.quantity = response.quantity; 
      this.selectedSize = response.selectedSize;
      },
      (error) => {
        console.error('Error updating item:', error);
      }
    );
  }

  SingleItemPrice(): void {
    this.cartService.getSingleItemPrice(this.productId).subscribe(
      (data) => {

        this.totalPrice = data.totalPrice;
      this.totalQuantity = data.totalQuantity; 
    
        this.dialog.open(OrderComponent, {
          width: 'auto',
     data: { totalPrice: this.totalPrice, totalQuantity: this.totalQuantity, itemId: this.productId },
     
        });
      },
      (error) => {
        console.error('Error when proceeding order', error);
      }
    );
  }
  //add to card with quantity
  addToCartWithQuantity(productId: number, quantity: number): void {
    this.cartService.addToCartWithQuantity(productId, quantity).subscribe(
      (data) => {
        this.toastrService.success('Article ajouté au panier avec succès');
      },
      (error) => {
        if (error.status === 409) { // Conflict status code for 'Item already in cart'
          this.toastrService.warning('Cet article est déjà dans votre panier');
        } else if (error.status === 404) { // Not found status code for 'Product not found'
          this.toastrService.error('Produit non trouvé');
        } else {
          this.toastrService.error('Veuillez vous connecter pour ajouter cet article à votre panier');
        }
        console.error('Error adding product to cart:', error);
      }
    );
  }




}

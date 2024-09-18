import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CartService } from '../../../service/cart.service';
import { OrderService } from '../../../service/order.service';
import { OrderComponent } from '../order/order.component';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {
  userCart: any;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  isOrderVisible: boolean = false;
  cartVisible: boolean = true;
  address!: string;
  phoneNumber!: string;
  productId: any;
  itemId!: number;

  selectedSize: { [itemId: number]: string } = {};
  @Output() cartUpdated = new EventEmitter<boolean>();

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,

    public dialogRef: MatDialogRef<ShoppingCartComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    this.userCart = this.data.userCart;
    //this.removeCartItem(this.productId);
    this.route.paramMap.subscribe(params => {
      this.itemId = +params.get('id')!;
    });
  }
  removeItem(item: any): void {
    const index = this.userCart.items.indexOf(item);
    if (index > -1) {
      this.userCart.items.splice(index, 1);
    }
  }

  incrementQuantity(item: any): void {
    item.quantity++;
    this.updateCartItem(item);
  }

  decrementQuantity(item: any): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateCartItem(item);
    }
  }

  selectSize(selectedSize: string, item: any): void {
    item.selectedSize = selectedSize;
    this.updateCartItem(item)
  }

  updateCartItem(item: any): void {
    const updateData = { quantity: item.quantity, selectedSize: item.selectedSize };
    this.cartService.updateCartItemFromCart(item.id, updateData).subscribe(
      (response) => {
      },
      (error) => {
     //   console.error('Error updating item:', error);
      }
    );
  }

  //get total cart price for all cart cart-item
  getTotalCartPrice() {
    this.cartService.getTotalCartPrice().subscribe(
      (data) => {
        this.totalPrice = data.totalPrice;
        this.totalQuantity = data.totalQuantity;
        this.dialog.open(OrderComponent, {
          width: 'auto',
           data: data
        });
      },
      (error) => {
       // console.error('Error when proceeding order', error);
      }
    );
  }

  //get total cart price for single cart cart-item
  fetchSingleItemPrice(itemId: number): void {
    this.cartService.getSingleItemPrice(itemId).subscribe(
      (data) => {

        this.totalPrice = data.totalPrice;
        this.totalQuantity = data.totalQuantity;
        this.dialog.open(OrderComponent, {
          width: 'auto',
          data: { ...data, itemId: itemId },
        });
      },
      (error) => {
      //  console.error('Error when proceeding order', error);
      }
    );
  }

  removeCartItem(productId: number): void {
    this.cartService.removeFromCart(productId).subscribe(
      (response) => {
        this.data = response;
        this.toastrService.success('article supprimé du panier')
        this.cartUpdated.emit(true);
      },
      (error) => {
     //   console.error('Error removing item:', error);
        this.toastrService.error('erreur lors de la suppression de l\'article du panier')
      }
    );
  }

  onClose(): void {
    this.dialogRef.close();
}
}
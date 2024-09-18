import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { OrderService } from "../../../service/order.service";
import { Component, Inject } from "@angular/core";
import { ToastrService } from 'ngx-toastr';
import { ProductService } from "../../../service/product.service";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent {
  TotalAmount: any;
  orderData: any = {};
  fields: any[] = [
    { label: 'Nom & Prénom', type: 'text', modalName: 'username', },
    { label: 'Votre adresse', type: 'text', modalName: 'address' },
    { label: 'Numéro tel', type: 'text', modalName: 'phoneNumber' }
  ];
  isCartOrder: boolean = false;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private toastrService: ToastrService,
    public dialogRef: MatDialogRef<OrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.TotalAmount = this.data;
  }

  ngOnInit() {
    this.isCartOrder = !!this.data.itemId;
  }

  submitOrder() {
    if (this.isSingleOrder()) {
      this.orderService.orderSingle(this.orderData, this.data.itemId).subscribe(
        (data) => {
          this.handleOrderSuccess(data);
        },
        (error) => {
          this.handleOrderError(error);
        }
      );
    } else {
      this.orderService.globalOrder(this.orderData).subscribe(
        (data) => {
          this.handleOrderSuccess(data);

        },
        (error) => {
          this.handleOrderError(error);
        }
      );
    }
  }

  private isSingleOrder(): boolean {
    return !!this.data.itemId;
  }

  private handleOrderSuccess(data: any) {
    this.toastrService.success('Commande effectuée avec succès');
    this.dialogRef.close(data);
  }

  private handleOrderError(error: any) {
    this.toastrService.error('Erreur lors de la commande');
    //  console.error('Erreur lors de la commande :', error);
  }

  // Format number with separator
  formatNumberWithSeparator(number: number): string {
    return number.toLocaleString('en-US');
  }

  // Parse formatted string to number
  parseNumberFromString(value: string): number {
    return parseFloat(value.replace(/,/g, ''));
  }

  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.formatNumberWithSeparator(this.parseNumberFromString(input.value));
    this.TotalAmount.price = formattedValue, { emitEvent: false };
  }


  onYesClick(): void {
    this.dialogRef.close(true);
  }
}

import { ChangeDetectorRef, Component } from '@angular/core';
import { OrderService } from '../../../service/order.service';
import { MatDialog } from '@angular/material/dialog';
import { UserOrderComponent } from '../../dialog/user-order/user-order.component';
import { environment } from '../../../../environments/environment';
import { ProductService } from '../../../service/product.service';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from '../../../dialog-service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
  orders: any[] = []
  
  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService,
  private productService: ProductService,
  private toastrService: ToastrService,

  ) { }

  ngOnInit() {
    this.fetchOrders();
  }


  fetchOrders() {
    this.orderService.fetchOrders()
      .subscribe(
        (orders: any[]) => {
          this.orders = orders.map(order => {
            const mappedOrder = {
              ...order,
              items: order.items.map((item: { product: { uploadedFile: any; }; }) => ({
                ...item,
                product: {
                  ...item.product,
                  uploadedFileUrl: `${environment.apiUrl}/blog-backend/productFile/${item.product.uploadedFile}`,
                }
              }))
            };
            return mappedOrder;
          });
        },
        error => {
       //   console.error('Error fetching orders:', error);
        }
      );
  }


  openOrderModal(order: any): void {
    const dialogRef = this.dialog.open(UserOrderComponent, {
      width: '700px',
      data: order
    });
    dialogRef.afterClosed().subscribe(result => {
    });

  }


  deleteOrder(id: number): void {
    this.dialogService.openDialog({}).subscribe((result: boolean) => {
      if (result) {
        this.orderService.deleteOrder(id).subscribe(
          () => {
            this.orders = this.orders.filter(orders => orders.id !== id);
            this.fetchOrders();
            this.cdr.detectChanges();
            this.toastrService.success('article supprimé avec succès')

          },
          
          (error) => {
            this.toastrService.error('erreur lors de la suppression')

        //    console.error('Error deleting folder:', error);
          }
        );
      }
    });
  }


  deleteAllOrder(): void {
    this.orderService.deleteAllOrder().subscribe(
      (response) => {
        this.orders = [];
      },
      (error) => {
       // console.error('Failed to delete all order:', error);
      }
    );
  }
  formatNumberWithSeparator(montant: number): string {
    return this.productService.formatNumberWithSeparator(montant);
  }
}

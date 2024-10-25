import { Component, Inject } from '@angular/core';
import { FolderService } from '../../../service/folder.service';
import { ProductService } from '../../../service/product.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modify',
  templateUrl: './modify.component.html',
  styleUrl: './modify.component.css'
})
export class ModifyComponent {

  dialogRef: any;
  folder: any;
  product: any;
  isFolder!: boolean;


  ProductCategory = [
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
  ]

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private folderService: FolderService,
    private productService: ProductService,
    private toastrService: ToastrService,
  ) {
    this.isFolder = data.type === 'folder';
    this.folder = data.folder;
    this.product = data.product && data.product.sizes ? { ...data.product } : { sizes: [] };
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }

  onSave(): void {
    if (this.isFolder) {
      const { id, ...updatedFolderData } = this.folder;
      this.folderService.updateAdminNote(id, updatedFolderData).subscribe(
        (response) => {
          this.toastrService.success("Votre article a été modifié avec succès");
          this.dialogRef.close(true);
        },
        (error) => {
          this.toastrService.success('erreur de mise à jour')
         // console.error('Error updating folder:', error);
        }
      );
    } else {
      const { id, ...updatedProductData } = this.product;
      this.productService.updateProduct(id, updatedProductData).subscribe(
        (response) => {
          this.toastrService.success("Votre produit a été modifié avec succès");
          this.dialogRef.close(true);
        },
        (error) => {
          this.toastrService.error('Erreur de mise à jour');
        //  console.error('Error updating product:', error);
        }
      );
    }
  }

  addSize(): void {
    this.product.sizes.push('');
  }

  removeSize(index: number): void {
    this.product.sizes.splice(index, 1);
  }

  
  formatNumberWithSeparator(number: number): string {
    if (isNaN(number)) return '';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  // Method to parse a formatted string back to a plain number
  parseNumberFromString(value: string): number {
    const parsed = parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
    return isNaN(parsed) ? 0 : parsed; 
  }

  // Méthode pour gérer l'entrée du prix
  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsedValue = this.parseNumberFromString(input.value);
    const formattedValue = this.formatNumberWithSeparator(parsedValue);
    this.product.price = formattedValue, { emitEvent: false };
  }


}
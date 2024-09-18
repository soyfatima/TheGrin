import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../service/product.service';
import { ToastrService } from 'ngx-toastr';

export interface Categories {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-add-products',
  templateUrl: './add-products.component.html',
  styleUrl: './add-products.component.css'
})
export class AddProductsComponent {
image:any;
productForm!:FormGroup;
montant:any;

Categories:any[] = [
  {label: 'Équipements de diagnostic', value: 'diagnostic'},
  {label: 'Équipements de soins', value: 'soins'},
  {label: 'Matériel de réanimation', value: 'reanimation'},
  {label: 'Mobilier médical', value: 'mobilier'},
  {label: 'Équipements de stérilisation', value: 'sterilisation'},
  {label: 'Prothèses et orthèses', value: 'protheses'},
  {label: 'Instruments chirurgicaux', value: 'chirurgie'},
  {label: 'Matériel de perfusion et d’injection', value: 'perfusion'},
  {label: 'Équipements de radiologie et imagerie', value: 'radiologie'},
  {label: 'Accessoires de laboratoire', value: 'laboratoire'}
];

constructor(private fb:FormBuilder,
   private productService:ProductService,
   private toastrService: ToastrService,
  ){}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      category:['', Validators.required],
      name:['', Validators.required],
      content:['', Validators.required],
      uploadedFile:[null, Validators.required],
      remise:['', Validators.required],
      price:['', Validators.required],
      sizes: this.fb.array([this.createSize()])
    })
    
  }

  get sizes(): FormArray {
    return this.productForm.get('sizes') as FormArray;
  }

  createSize(): FormGroup {
    return this.fb.group({
      size: ['']
    });
  }

  addSize(): void {
    this.sizes.push(this.createSize());
  }

  removeSize(index: number): void {
    this.sizes.removeAt(index);
  }

  onSubmit(){
    if(this.productForm.invalid){
      return;
    }

  const productData = new FormData();
  productData.append('category', this.productForm.get('category')?.value)
  productData.append('name', this.productForm.get('name')?.value)
  productData.append('content', this.productForm.get('content')?.value)
  productData.append('price', this.productForm.get('price')?.value)
  productData.append('remise', this.productForm.get('remise')?.value)
  productData.append('uploadedFile', this.productForm.get('uploadedFile')?.value);

  const sizes = this.sizes.value.map((sizeGroup: { size: string }) => sizeGroup.size);
  productData.append('sizes', JSON.stringify(sizes));

  this.productService.createProduct(productData).subscribe(
    (response) => {
      this.productForm.reset()
      this.toastrService.success('Produits ajouté avec succès')
    },
    (error) => {
      this.toastrService.error('erreur lors de l\'ajout du produit')
      //console.error('Failed to create product:', error);
    
    }
  )
  }

  // Method to handle file selection
  chooseImage(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.productForm.patchValue({
        uploadedFile: fileInput.files[0]
      });
    }
  }
  formatNumberWithSeparator(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Méthode pour analyser une chaîne formatée en nombre
  parseNumberFromString(value: string): number {
    return parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
  }

  // Méthode pour gérer l'entrée du prix
  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const parsedValue = this.parseNumberFromString(input.value);
    const formattedValue = this.formatNumberWithSeparator(parsedValue);
    this.productForm.get('price')?.setValue(formattedValue, { emitEvent: false });
  }
}

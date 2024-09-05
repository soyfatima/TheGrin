import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './navigation/homepage/homepage.component';
import { NavbarComponent } from './navigation/navbar/navbar.component';
import { TopComponent } from './navigation/top/top.component';
import { OurServicesComponent } from './navigation/our-services/our-services.component';
import { AboutUsComponent } from './navigation/about-us/about-us.component';
import { FeaturesComponent } from './navigation/features/features.component';
import { FooterComponent } from './navigation/footer/footer.component';
import { ChatComponent } from './forum/chat/chat.component';
import { ContactUsComponent } from './navigation/dialog/contact-us/contact-us.component';
import { UserLoginComponent } from './navigation/dialog/user-login/user-login.component';
import { ConfirmDialogComponent } from './navigation/dialog/confirm-dialog/confirm-dialog.component';
import { AddProductsComponent } from './admin/products/add-products/add-products.component';
import { ListProductsComponent } from './admin/products/list-products/list-products.component';
import { UserOrderComponent } from './admin/dialog/user-order/user-order.component';
import { OrderListComponent } from './admin/products/order-list/order-list.component';
import { AdminGuard } from './guard/admin.guard';
import { LoginGuard } from './guard/login.guard';
import { HomeComponent } from './admin/home/home.component';
import { OnConfirmComponent } from './admin/dialog/on-confirm/on-confirm.component';
import { ResetPasswordComponent } from './navigation/reset-password/reset-password.component';
import { LoginComponent } from './admin/login/login.component';
import { SidebarComponent } from './admin/sidebar/sidebar.component';
import { AddNoteComponent } from './admin/notes/add-note/add-note.component';
import { MyNoteComponent } from './admin/notes/my-note/my-note.component';
import { ModifyComponent } from './admin/dialog/modify/modify.component';
import { UserProfilComponent } from './forum/user-profil/user-profil.component';
import { StoreComponent } from './shopping/store/store.component';
import { ProductComponent } from './shopping/product/product.component';
import { ProductInfoComponent } from './shopping/product-info/product-info.component';
import { OrderComponent } from './shopping/modal/order/order.component';
import { ShoppingCartComponent } from './shopping/modal/shopping-cart/shopping-cart.component';

const routes: Routes = [
  // { path: '', component: },

  { path: '', component: HomepageComponent, pathMatch: 'full' },
  { path: 'homepage', component: HomepageComponent },
  { path: 'top', component: TopComponent },
  { path: 'our-services', component: OurServicesComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'store', component: StoreComponent },
  { path: 'product', component: ProductComponent },

  { path: 'chat', component: ChatComponent },
  { path: 'chat/:id', component: ChatComponent },

  { path: 'contact-us', component: ContactUsComponent },
  { path: 'confirm-dialog', component: ConfirmDialogComponent },

  { path: 'navbar', component: NavbarComponent, canActivate: [LoginGuard] },
  { path: 'user-login', component: UserLoginComponent, canActivate: [LoginGuard] },
  { path: 'user-profil/:id', component: UserProfilComponent, canActivate: [LoginGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [LoginGuard] },
  { path: 'product-info/:id', component: ProductInfoComponent, canActivate: [LoginGuard] },
  { path: 'order', component: OrderComponent, canActivate: [LoginGuard] },
  { path: 'shopping-cart', component: ShoppingCartComponent, canActivate: [LoginGuard] },

  // Admin routes
  { path: 'login', component: LoginComponent, canActivate: [AdminGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AdminGuard] },
  { path: 'sidebar', component: SidebarComponent, canActivate: [AdminGuard] },
  { path: 'on-confirm', component: OnConfirmComponent, canActivate: [AdminGuard] },
  { path: 'add-products', component: AddProductsComponent, canActivate: [AdminGuard] },
  { path: 'list-products', component: ListProductsComponent, canActivate: [AdminGuard] },
  { path: 'user_order', component: UserOrderComponent, canActivate: [AdminGuard] },
  { path: 'order-list', component: OrderListComponent, canActivate: [AdminGuard] },
  { path: 'modify', component: ModifyComponent, canActivate: [AdminGuard] },
  { path: 'add-note', component: AddNoteComponent, canActivate: [AdminGuard] },
  { path: 'my-note', component: MyNoteComponent, canActivate: [AdminGuard] }

];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
//import { CarouselModule } from 'ngx-bootstrap/carousel';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../environments/environment.prod';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './service/token-interceptor.service';
import { MessagingService } from './sockService';

import { TokenService } from './service/tokenservice';
import { requestService } from './service/request.service';
import { AnimationService } from './service/animate-service';
import { CookieService } from 'ngx-cookie-service';
import { SafeHtmlPipe } from './safe-html.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//angular material
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { ToastrModule } from 'ngx-toastr';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatBadgeModule } from '@angular/material/badge';

/////
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './navigation/homepage/homepage.component';
import { NavbarComponent } from './navigation/navbar/navbar.component';
import { TopComponent } from './navigation/top/top.component';
import { OurServicesComponent } from './navigation/our-services/our-services.component';
import { AboutUsComponent } from './navigation/about-us/about-us.component';
import { FeaturesComponent } from './navigation/features/features.component';
import { FooterComponent } from './navigation/footer/footer.component';
import { ChatComponent } from './forum/chat/chat.component';
import { BlogComponent } from './forum/blog/blog.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ContactUsComponent } from './navigation/dialog/contact-us/contact-us.component';
import { UserLoginComponent } from './navigation/dialog/user-login/user-login.component';
import { ConfirmDialogComponent } from './navigation/dialog/confirm-dialog/confirm-dialog.component';
import { UserOrderComponent } from './admin/dialog/user-order/user-order.component';
import { AddProductsComponent } from './admin/products/add-products/add-products.component';
import { ListProductsComponent } from './admin/products/list-products/list-products.component';
import { OrderListComponent } from './admin/products/order-list/order-list.component';
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
import { ShoppingCartComponent } from './shopping/modal/shopping-cart/shopping-cart.component';
import { ProductInfoComponent } from './shopping/product-info/product-info.component';
import { OrderComponent } from './shopping/modal/order/order.component';
import { ListUserComponent } from './admin/list-user/list-user.component';
import { LinkifyPipe } from './linkify.pipe';
import { MessagingComponent } from './forum/messaging/messaging.component';
import { SenderListComponent } from './forum/sender-list/sender-list.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    LoginComponent,
    NavbarComponent,
    TopComponent,
    OurServicesComponent,
    AboutUsComponent,
    FeaturesComponent,
    FooterComponent,

    ChatComponent,
    BlogComponent,
    HomeComponent,
    ContactUsComponent,
    SafeHtmlPipe,
    UserLoginComponent,
    ConfirmDialogComponent,
    SidebarComponent,

    UserOrderComponent,
    AddProductsComponent,
    ListProductsComponent,
    OrderListComponent,
    OnConfirmComponent,

    ResetPasswordComponent,
    AddNoteComponent,
    MyNoteComponent,
    ModifyComponent,
    UserProfilComponent,

    ProductComponent,
    ShoppingCartComponent,
    ProductInfoComponent,
    StoreComponent,
    OrderComponent,
    ListUserComponent,
    LinkifyPipe,
    MessagingComponent,
    SenderListComponent

  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgbModule,
    FormsModule,
    MatSnackBarModule,
    HammerModule,
    //ang mat
    MatExpansionModule,
    ReactiveFormsModule,
    MatListModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatBadgeModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
    }),
  ],

  providers: [
    provideAnimationsAsync(),
    TokenService, CookieService,
    requestService,
    TokenInterceptor,
    //MessagingService,

    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },

    //{ provide: LocationStrategy, useClass: HashLocationStrategy },
    AnimationService,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, direction: 'ltr' } },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

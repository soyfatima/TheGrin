import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
//import { CarouselModule } from 'ngx-bootstrap/carousel';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../environments/environment.prod';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { TokenInterceptor } from './service/token-interceptor.service';
import { TokenService } from './service/tokenservice';
import { requestService } from './service/request.service';
import { AnimationService } from './service/animate-service';
import { CookieService } from 'ngx-cookie-service';
import { SafeHtmlPipe } from './safe-html.pipe';

//angular material
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './navigation/homepage/homepage.component';
import { LoginComponent } from './navigation/login/login.component';
import { NavbarComponent } from './navigation/navbar/navbar.component';
import { TopComponent } from './navigation/top/top.component';
import { OurServicesComponent } from './navigation/our-services/our-services.component';
import { AboutUsComponent } from './navigation/about-us/about-us.component';
import { FeaturesComponent } from './navigation/features/features.component';
import { FooterComponent } from './navigation/footer/footer.component';
import { SidebarComponent } from './forum/sidebar/sidebar.component';
import { ChatComponent } from './forum/chat/chat.component';
import { BlogComponent } from './forum/blog/blog.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HomeComponent } from './navigation/home/home.component';
import { ContactUsComponent } from './navigation/dialog/contact-us/contact-us.component';
import { UserLoginComponent } from './navigation/dialog/user-login/user-login.component';
import { UserFoldersComponent } from './forum/user-folders/user-folders.component';

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
    SidebarComponent,
    ChatComponent,
    BlogComponent,
    HomeComponent,
    ContactUsComponent,
    SafeHtmlPipe,
    UserLoginComponent,
    UserFoldersComponent,

  ],
  
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
     //ang mat
     MatExpansionModule,
     ReactiveFormsModule,
     MatListModule,
     MatIconModule,
     MatDialogModule,
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
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true,
  },
  
  //{ provide: LocationStrategy, useClass: HashLocationStrategy },
  AnimationService,
  { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, direction: 'ltr' } },
  {provide: LocationStrategy, useClass: HashLocationStrategy}
],
  bootstrap: [AppComponent]
})
export class AppModule { }

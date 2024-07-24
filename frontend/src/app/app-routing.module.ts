import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './navigation/homepage/homepage.component';
import { NavbarComponent } from './navigation/navbar/navbar.component';
import { TopComponent } from './navigation/top/top.component';
import { OurServicesComponent } from './navigation/our-services/our-services.component';
import { AboutUsComponent } from './navigation/about-us/about-us.component';
import { FeaturesComponent } from './navigation/features/features.component';
import { FooterComponent } from './navigation/footer/footer.component';
import { SidebarComponent } from './forum/sidebar/sidebar.component';
import { ChatComponent } from './forum/chat/chat.component';
import { HomeComponent } from './navigation/home/home.component';
import { ContactUsComponent } from './navigation/dialog/contact-us/contact-us.component';
import { UserLoginComponent } from './navigation/dialog/user-login/user-login.component';
import { UserFoldersComponent } from './forum/user-folders/user-folders.component';

const routes: Routes = [
  // { path: '', component: },

  { path: '', component: HomepageComponent, pathMatch: 'full' },
  { path: 'homepage', component: HomepageComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'top', component: TopComponent },
  { path: 'our-services', component: OurServicesComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'footer', component: FooterComponent },

  { path: 'home', component: HomeComponent},
  { path: 'sidebar', component: SidebarComponent},
  { path: 'chat', component: ChatComponent },
   { path: 'contact-us', component: ContactUsComponent },


  { path: 'user-login', component: UserLoginComponent },
  { path: 'User-folders/:id', component: UserFoldersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

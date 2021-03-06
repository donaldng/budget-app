import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { ExpensesPage } from '../pages/expenses/expenses';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { ManagePage } from '../pages/manage/manage';
import { SettingPage } from '../pages/setting/setting';
import { NumberPage } from '../pages/number/number';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicStorageModule } from '@ionic/storage';
import { Camera } from '@ionic-native/camera';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { AdMobFree } from '@ionic-native/admob-free';

import { SocialSharing } from '@ionic-native/social-sharing';
import { Instagram } from '@ionic-native/instagram';

// Services
import { ImageService } from '../service/image';
import { AdMobService } from '../service/admob';
import { DateService } from '../service/date';
import { FirebaseService } from '../service/firebasedb';

@NgModule({
  declarations: [
    MyApp,
    ExpensesPage,
    HomePage,
    TabsPage,
    ManagePage,
    SettingPage,
    NumberPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    IonicImageViewerModule
  ],
  bootstrap: [IonicApp, IonicApp],
  entryComponents: [
    MyApp,
    ExpensesPage,
    HomePage,
    TabsPage,
    ManagePage,
    SettingPage,
    NumberPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    Instagram,
    AdMobFree,
    SocialSharing,
    ImageService,
    AdMobService,
    DateService,
    FirebaseService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}


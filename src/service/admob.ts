import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';

@Injectable()
export class AdMobService {
    paidVersion:boolean = false;
    bannerConfig: AdMobFreeBannerConfig = {
        id: this.AdsId(),
        isTesting: false,
        overlap: false,
        autoShow: true
    };
    
    constructor(public platform: Platform, public admob: AdMobFree) {
    }

    AdsId(){
        let adId;
        if(this.platform.is('android')) {
            adId = 'ca-app-pub-8912779457218327/8169940814';
        } else if (this.platform.is('ios')) {
            adId = 'ca-app-pub-8912779457218327/8529033465';
        }
        return adId;
    }

    showInterstitialAds(){
        let showchance = Math.round(Math.random()); // 50% chance of showing
        if (!this.paidVersion && showchance <= 0.4){
            this.admob.interstitial.config(this.bannerConfig);
            
            this.admob.interstitial.prepare().then(() => {
                this.admob.banner.remove();
                this.runAds();
            }).catch(e => console.log(e));    
        }
    }  
    
    runAds(){
        if (!this.paidVersion){
            this.admob.banner.config(this.bannerConfig);
            this.admob.banner.prepare().then(() => {
            }).catch(e => console.log(e));
        }                
    }
 
}

import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

@Component({
    selector: 'page-setting',
    templateUrl: 'setting.html',
})

export class SettingPage {
    items;
    budget;
    currency;
    duration;
    tripStart;
    tripEnd;

    constructor( public params: NavParams, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController, public toastCtrl: ToastController ) {
        this.items = ['$', '¥', '€', '£', '฿'];
        this.storage.get('budget').then((v) => {
            if(v) this.budget = v;
        });

        this.storage.get('currency').then((v) => {
            if(v) this.currency = v;

        });

        this.storage.get('duration').then((v) => {

            if (v){
                this.duration = v.split(" ~ ");
                this.tripStart = this.duration[0];
                this.tripEnd = this.duration[1];
            }
            else{
                this.tripStart = new Date().toISOString().slice(0, 19);
                this.tripEnd = new Date();
                this.tripEnd.setDate(this.tripEnd.getDate() + 7);
                this.tripEnd = this.tripEnd.toISOString().slice(0, 19);
            }
        });
    }

    presentToast() {
        let toast = this.toastCtrl.create({
          message: 'Ok, I got it!',
          duration: 3000,
          position: 'top'
      });
        toast.present();
    }

    submitForm() {
        this.storage.set('budget', Number(this.budget));
        this.storage.set('currency', this.currency);
        this.storage.set('duration', this.tripStart + ' ~ ' + this.tripEnd);
        this.storage.set('reload_home', 1);
        this.presentToast();
    }
}
import { Component } from '@angular/core';
import { NavParams, ViewController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';

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
    saveimageFlag;
    editFlag;

    constructor( public events: Events, public params: NavParams, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController, public toastCtrl: ToastController, private alertCtrl: AlertController) {
        this.items = ['$', '¥', '€', '£', '฿'];
        this.currency = '$';
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

        this.storage.get('saveimageFlag').then((v) => {
            if(v) this.saveimageFlag = v;
        });    
        this.storage.get('editFlag').then((v) => {
            if(v) this.editFlag = v;
        }); 
    }

    presentToast() {
        let toast = this.toastCtrl.create({
          message: 'Ok, I got it!',
          duration: 2000,
          position: 'top'
      });
        toast.present();
    }

    goHome(){
        this.navCtrl.parent.select(0);
    }
    
    dismiss() {
        this.viewCtrl.dismiss();
    }
    
    reset(){
        this.storage.clear();

        this.tripStart = new Date().toISOString().slice(0, 19);
        this.tripEnd = new Date();
        this.tripEnd.setDate(this.tripEnd.getDate() + 7);
        this.tripEnd = this.tripEnd.toISOString().slice(0, 19);

        var duration = this.tripStart + ' ~ ' + this.tripEnd;

        this.events.publish('reload:home', 'tot_budget', 0);
        this.events.publish('reload:home', 'duration', duration);
        this.events.publish('reload:expenses', []);

        this.dismiss()

    }

    presentConfirm() {
        let alert = this.alertCtrl.create({
            title: 'Reset',
            message: 'Do you want to reset all your current trips information?',
            buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                }
            },
            {
                text: 'Yes',
                handler: () => {
                    this.reset();
                }
            }
            ]
        });
        alert.present();
    }

    submitForm() {
        var duration = this.tripStart + ' ~ ' + this.tripEnd;
        var budget = Number(this.budget);

        this.storage.set('budget', budget);
        this.storage.set('currency', this.currency);
        this.storage.set('duration', duration);
        this.storage.set('saveimageFlag', this.saveimageFlag);
        this.storage.set('editFlag', this.editFlag);

        this.events.publish('reload:home', 'tot_budget', budget);
        this.events.publish('reload:home', 'duration', duration);
        this.events.publish('update:currency', this.currency);
        this.events.publish('saveimageFlag', this.saveimageFlag);
        this.events.publish('editFlag', this.editFlag);

        this.presentToast();
        this.dismiss()
    }
}
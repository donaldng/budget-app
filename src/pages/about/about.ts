import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular'
import { ModalController } from 'ionic-angular';
import { ManagePage } from '../manage/manage';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})
export class AboutPage {
    expensesList;
    display_currency;
    oriList;

    constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public modalCtrl: ModalController, public storage: Storage) {
        this.display_currency = '$';
        
        this.loadData();
        this.getCurrency();
        this.task = setInterval(this.getCurrency.bind(this), 1000);
    }
    
getCurrency(){
    this.storage.get('currency').then((currency) => {
        if (currency){
            if(this.display_currency != currency)
                this.display_currency = currency;
        }
    });
}

loadData(){
    this.storage.get('expensesList').then((expensesList) => {
        if (expensesList){
            this.expensesList = expensesList.sort(function(a, b) { 
                                                        return b.id - a.id;
                                                    });
            this.oriList = expensesList;
        }
        else{
            this.storage.set('expensesList', []);
        }
    });
}

presentActionSheet(theItem) {
    const actionSheet = this.actionSheetCtrl.create({
        title: 'Action',
        buttons: [
        {
            text: 'Edit',
            handler: () => {
                let id = theItem.id;
                this.gotoManage(id, this.oriList);
            }
        },
        {
            text: 'Delete',
            role: 'destructive',
            handler: () => {
                let index = this.expensesList.indexOf(theItem);
                this.expensesList.splice(index,1);
                this.storage.set('expensesList', this.expensesList);
            }
        },
        {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
            }
        }
        ]
    });

    actionSheet.present();
}

gotoManage(id, list) {
    let modal = this.modalCtrl.create(ManagePage, {'id': id, 'expensesList':list});
    modal.onDidDismiss(data => {
        this.loadData();
    });

    modal.present();
}
}

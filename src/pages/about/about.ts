import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular'
import { ModalController, ViewController } from 'ionic-angular';
import { ManagePage } from '../manage/manage';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public modalCtrl: ModalController) {

  }

 presentActionSheet(theItem) {
   const actionSheet = this.actionSheetCtrl.create({
     title: 'Action',
     buttons: [
       {
         text: 'Edit',
         handler: () => {
            let cur_id = theItem.id;
            this.gotoManage(cur_id);
         }
       },
       {
         text: 'Delete',
         role: 'destructive',
         handler: () => {
            let index = this.expensesList.indexOf(theItem);
            this.expensesList.splice(index,1);
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

 gotoManage(id) {
    let modal = this.modalCtrl.create(ManagePage, {'id': id});
    modal.present();
 }

  expensesList = [
      {id: 1, name: 'Animals', datetime: '12th Sept', frequency: 'Once', body: Math.floor((Math.random() * 10) + 1) },
      {id: 2, name: 'Body Parts', datetime: '12th Sept', frequency: 'Monthly', body: Math.floor((Math.random() * 10) + 1) },
      {id: 3, name: 'Colors & Shapes', datetime: '12th Sept', frequency: 'Once', body: Math.floor((Math.random() * 10) + 1) },
      {id: 4, name: 'Apparels', datetime: '12th Sept', frequency: 'Daily', body: Math.floor((Math.random() * 10) + 1) },
      {id: 5, name: 'Family', datetime: '12th Sept', frequency: 'Once', body: Math.floor((Math.random() * 10) + 1) },
      {id: 6, name: 'Vegitables & Fruits', datetime: '12th Sept', frequency: 'Weekly', body: Math.floor((Math.random() * 10) + 1) }

  ];

}

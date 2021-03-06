import { Component } from '@angular/core';
import { ModalController, Platform, NavController, Events } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { SettingPage } from '../setting/setting';
import { ImageService } from '../../service/image';
import { DateService } from '../../service/date';
import { FirebaseService } from '../../service/firebasedb';

import { NumberPage } from '../number/number';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    display_currency: string;
    tot_budget: number;
    day_budget: number;
    budgetTmp: number;
    tripEnd;
    tripStart;
    noOfDays: number;
    duration: any;
    tot_expenses: number;
    campaign_ended;
    greetMsg: string;
    expensesList: any[];
    timezone;
    newphotoFlag: boolean;
    tot_remaining: number;
    day_remaining: number;
    day_expenses: number;
    day_color: string = 'primary';
    day_color_label: string = 'primary';
    tot_color: string = 'primary';
    tot_color_label: string = 'primary';
    tot_bar;
    day_bar;
    reserved_amount: number;
    reserveList: any[];
    seemore_reserved: boolean;
    baaThumbnail: string;
    seemore_ok: number;

    constructor(public splashScreen: SplashScreen, public dateLib: DateService, public firebaseStorage: FirebaseService, public imgLib: ImageService, public navCtrl: NavController, public modalCtrl: ModalController, public events: Events,  public platform: Platform) {
            
        this.expensesList = [];
        this.timezone = new Date().getTimezoneOffset() / 60;
        this.display_currency = '$';
        this.tot_expenses = 0;
        this.day_budget = 0;
        this.tot_budget = 0;
        this.tot_remaining = 0;
        this.day_remaining = 0;
        this.day_expenses = 0;
        this.seemore_reserved = false;
        this.seemore_ok = 0;

        if(!this.baaThumbnail) this.baaThumbnail = "assets/imgs/thumbnail-" + this.getRandomInt(1,8) + ".png";

        events.subscribe('reload:home', (k, v) => {
            if (k == "expensesList"){
                console.log("calculate_budget subscribe reload:home");
                this.calculate_budget(v);
                this.expensesList = v;
                this.baaThumbnail = "assets/imgs/thumbnail-" + this.getRandomInt(1,8) + ".png";
            }
            else if(k == "tot_budget"){
                this.tot_budget = v;
                console.log("calcDbBudget subscribe reload:home");
                this.calcDbBudget();
            }
            else if(k == "duration"){
                console.log("decodeDuration subscribe");
                this.decodeDuration(v);    
                this.check_ended();
            }
        });

        events.subscribe('reload:expenses', (v) => {
            console.log("calculate_budget subscribe reload:expenses");            
            this.calculate_budget(v);
        });

        events.subscribe('enter:home', () => {
            this.seemore_ok = 0;
            this.processReserved(this.expensesList);
        });        

        events.subscribe('update:currency', (c) => {
            this.display_currency = c;
        });

        events.subscribe('newphotoFlag', (v) => {
            this.newphotoFlag = v;
        });        

        events.subscribe('dismiss:home', (data) => {
            if (data.firsttime) {
                this.gotoSetting(data.value);
            }
            else if (!data.claim) {
                this.gotoManage(data.value);
            }
        });            

        this.updateData();        

        this.campaign_ended = 0;
        this.getGreetMsg();
    }

    updateData(){
        this.firebaseStorage.getAll((err, snap) => {
            let db = snap.val();

            // Update budget
            let budget = db.budget;

            if (budget && this.tot_budget != budget) {
                this.tot_budget = budget;
            }

            // Update newphotoFlag
            let newphotoFlag = db.newphotoFlag;

            if (newphotoFlag && this.newphotoFlag != newphotoFlag) {
                this.newphotoFlag = newphotoFlag;
            }

            // Update currency
            let currency = db.currency;
            if (currency && this.display_currency != currency) {
                this.display_currency = currency;
            }

            // Update noOfDays
            let noOfDays = db.noOfDays;

            if (noOfDays && this.noOfDays != noOfDays && !this.campaign_ended) {
                this.noOfDays = noOfDays;
            }

            //Update duration
            let duration = db.duration;

            if (duration) {
                console.log("decodeDuration firebase");
                this.decodeDuration(duration);
            }
            else {
                let now = new Date();
                this.tripStart = this.dateLib.dateToString(now);
                this.tripEnd = this.dateLib.addDay(now, 6);
                this.tripEnd = this.dateLib.dateToString(this.tripEnd);
            }

            // Update expensesList
            let expensesList = db.expensesList;
            if (expensesList) this.expensesList = expensesList;

            this.check_ended();
            this.calculate_budget(expensesList);
            this.splashScreen.hide();
        });
    }

    trip_ended(){
        if (this.day_budget > 0)
            this.greetMsg = 'Trip has ended, and money was well spent!';
        else
            this.greetMsg = 'Hope this trip don\'t break your bank account. :(';

        this.noOfDays = 0;
    }

    check_ended(){
        if(new Date() > new Date(this.tripEnd)){
            this.campaign_ended = 1;
            this.trip_ended();
        }
        else{
            this.campaign_ended = 0;
            this.getGreetMsg();   
        }           
    }

    openSettingModal(){
        let modal = this.modalCtrl.create(SettingPage, {'budget': this.tot_budget, 'currency': this.display_currency});
        modal.onDidDismiss(data => {
            this.updateData();
        });

        modal.present();
    }
    
    dayDiff(tripStart, tripEnd){
        // setHours to fix after 12am but noOfDays not changing bug
        // End trip we assume trip is ending by 12pm.
        tripStart.setHours(0, 0, 0, 0);
        tripEnd.setHours(12, 0, 0, 0);

        let timeDiff = Math.abs(tripEnd - tripStart);
        let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

        return diffDays;
    }

    getGreetMsg(){
        if(this.tot_budget)
            this.greetMsg = 'Good day, spend your wealth with good health!';
        else
            this.greetMsg = 'Look like you haven\'t setup your trip schedule yet, that\'s not good!';

        if(this.day_color == "danger" && this.tot_budget) this.greetMsg = 'Oh no, your budget is running low!';
    }
    
    calcDbBudget(){
        // minus expenses
        this.firebaseStorage.get('expensesList', (err, snap) => {
            let v = snap.val();
            this.calculate_budget(v);
        });
    }

    get_nday(): number{
        let noOfDays: number = 1;

        if (this.noOfDays){
            console.log("db noOfDays", this.noOfDays);
            noOfDays = this.noOfDays;
        }
        else{
            console.log("calc noOfDays");
            
            let startDate = new Date();
            let endDate = new Date(this.tripEnd);

            if (new Date(this.tripStart) > startDate) {
                startDate = new Date(this.tripStart);
            }

            console.log("startdate", startDate);
            console.log("endtrip", this.tripEnd);
            console.log("enddate converted", endDate);

            noOfDays = Number(this.dayDiff(startDate, endDate));
            console.log("get_nday", noOfDays);            
        }

        if (this.campaign_ended) noOfDays = 1;        

        return noOfDays;
    }

    calculate_budget(expensesList){
        let v = expensesList;

        let noOfDays: number = this.get_nday();
        this.budgetTmp = this.tot_budget;
        this.tot_expenses = 0;
        this.day_expenses = 0;

        this.tot_bar = document.getElementById('tot_bar');
        this.day_bar = document.getElementById('day_bar');

        if(v){
            for (let i=0; i < v.length; i++){
                if (v[i].fromReserved == 0 && v[i].freq == 0 && v[i].freq_start.slice(0, 10).replace('T', ' ') == this.dateLib.dateToString(new Date()).slice(0, 10).replace('T', ' ') && v[i].freq_end.slice(0, 10).replace('T', ' ') == this.dateLib.dateToString(new Date()).slice(0, 10).replace('T',' ')){
                    // Do not account day expenses into daily budget calculation
                    // Unless it's a over spent, then we deduct overspent amount from daily budget
                    this.day_expenses += Number(v[i].amount);
                    continue;
                }
                this.tot_expenses -= Number(v[i].amount) * Number(this.calcFrequency(v[i].freq, v[i].freq_amt, v[i].freq_start, v[i].freq_end));
            }
            this.tot_expenses = Math.abs(this.tot_expenses);
            this.budgetTmp -= this.tot_expenses;

            // parse Number because to toFixed will turn output in String
            this.day_budget = Number((this.budgetTmp / noOfDays).toFixed(2));

            // If we over spent the day budget, then lessen day budget.
            if(this.day_budget < this.day_expenses){
                let overspent = this.day_expenses - this.day_budget;
                this.day_budget -= Number(overspent/noOfDays);
                this.day_budget = Number(this.day_budget.toFixed(2));
            }

            this.noOfDays = noOfDays;
            if (this.campaign_ended) this.noOfDays = 0;
            this.firebaseStorage.set('noOfDays', this.noOfDays);
            
        }
        else if(this.tot_budget) {
            this.noOfDays = Number(noOfDays.toFixed(0));
            this.firebaseStorage.set('noOfDays', this.noOfDays);
            this.day_budget = Number((this.budgetTmp / noOfDays).toFixed(2));
        }
        else{
            this.noOfDays = 0;
        }

        // Exclude day_expenses from day_budget calculation
        // But include it back to tot_expenses after
        // Since we don't want to affect day_budget every time we spent money

        this.tot_expenses += this.day_expenses;

        this.events.publish('expenses:total_expenses',this.tot_expenses);

        this.firebaseStorage.set('day_budget', this.day_budget);
        
        this.tot_remaining = this.tot_budget - this.tot_expenses;
        this.tot_remaining = Number(this.tot_remaining.toFixed(2));
        
        this.day_remaining = this.day_budget - this.day_expenses;
        this.day_remaining = Number(this.day_remaining.toFixed(2));

        if(this.day_remaining / this.day_budget <= 0.15 || this.day_remaining <= 0){
            this.day_color = "danger";
            this.day_color_label = "danger";
            if(this.day_bar) this.day_bar.style.backgroundColor='#f53d3d';
        } 
        else{
            this.day_color = "secondary";
            this.day_color_label = "light";
            if(this.day_bar) this.day_bar.style.backgroundColor='#02d1a4';
        }

        if(this.tot_remaining / this.tot_budget <= 0.15){
            this.tot_color = "danger";
            this.tot_color_label = "danger";
            if(this.tot_bar) this.tot_bar.style.backgroundColor='#f53d3d';

        } 
        else{
            this.tot_color = "secondary";
            this.tot_color_label = "light";
            if(this.tot_bar) this.tot_bar.style.backgroundColor='#02d1a4';
        }

        let tot_perc = 0;
        if (this.tot_remaining > 0) tot_perc = this.tot_remaining/this.tot_budget*100;

        let day_perc = 0;
        if (this.day_remaining > 0) day_perc = this.day_remaining/this.day_budget*100;

        if(this.tot_bar) this.tot_bar.style.width = (tot_perc) + '%';
        if(this.day_bar) this.day_bar.style.width = (day_perc) + '%';

        this.getGreetMsg();
        this.getReservedAmount(v);

    }

    decodeDuration(v){
        this.duration = v.split(" ~ ");
        this.tripStart = this.duration[0];
        this.tripEnd = this.duration[1];
    }

    quickAdd(claim){
        let title = 'Add Expenses';
        let placeholder = '0.00';
        let value = '';

        if (claim){
            title = "Use " + this.getThumbnailName(claim.name, claim.thumbnail) + " Fund";
            placeholder = claim.amount;
            value = claim.amount;
        }

        let message = "How much are you spending?";
        let option = {
            'title': title,
            'placeholder': placeholder,
            'value': value,
            'message': message,
            'claim': claim,
            'firsttime': false,
            'from': 'home'
        }

        this.runNumberModal(option);

    }

    firstTimeSetting(){
        let title = 'Budget Setup';
        let placeholder = '0.00';
        let value = '';

        let message = "How much budget have you prepared for the trip?";
        let option = {
            'title': title,
            'placeholder': placeholder,
            'value': value,
            'message': message,
            'claim': 0,
            'firsttime': true,
            'from':'home'
        }

        this.runNumberModal(option);
    }

    getReservedAmount(expensesList){
        if(!expensesList){
            this.firebaseStorage.get('expensesList', (err, snap) => {
                let v = snap.val();
                this.processReserved(v);
                this.expensesList = v;
            });
        }
        else{
            this.expensesList = expensesList;
            this.processReserved(expensesList);
        }
    }

    processReserved(expensesList){
        this.reserved_amount = 0;
        this.reserveList = [];

        if(!expensesList) return;

        for (let i = 0, len = expensesList.length; i < len; i++) {
            // if is reserved
            if (expensesList[i].freq == 1){
                this.reserved_amount += Number(expensesList[i].amount);
                this.reserveList.push(expensesList[i]);
            }
        }

        let resv_length = this.reserveList.length;
        this.reserveList = this.reserveList.sort(function(a, b) {  return b.id - a.id; });

        if(!this.seemore_ok){
            this.reserveList = this.reserveList.slice(0, 6);
            if (resv_length > 6){
                this.seemore_reserved = true;
            }            
        }
        else{
            this.seemore_reserved = false;
        }
    }

    gotoManage(init_price: number){
        this.events.publish('gotoManage', {'selected_id': -1, 'camOn': this.newphotoFlag, 'init_price': init_price, 'segment': "onetime"});
        //this.navCtrl.parent.select(1);
    }

    gotoImage(){
        this.events.publish('gotoManage', {'selected_id': -1, 'camOn': true});
        //this.navCtrl.parent.select(1);
    }

    gotoSetting(init_budget: number){
        let modal = this.modalCtrl.create(SettingPage, { 'init_budget': init_budget }, { showBackdrop: false, enableBackdropDismiss: true });
        modal.present();
    }

    calcFrequency(freq_type, freq_amount, start, end){
        if (freq_type == 0 || freq_type == 1) return 1;
        if (freq_type == 2) return this.dayDiff(new Date(start), new Date(end)) / freq_amount;
    }

    claimExpenses(expenses, price: number){
        let index = this.findIndex(expenses.id);

        // Validate
        if (price > expenses.amount){
            alert('You cannot claim more than your reserved fund, my good sir!');
            return;
        }
        else if (price < 0){
            alert('I cannot process negative number, baaaaa...');
            return;
        }

        // Remove amount from claim
        expenses.amount = expenses.amount - price;
        this.expensesList[index] = expenses;

        let image = 0;
        if (typeof expenses.image != 'undefined') image = expenses.image;

        let thumbnail = 0;
        if (typeof expenses.thumbnail != 'undefined') thumbnail = expenses.thumbnail;

        let x = new Date();
        let today = this.dateLib.dateToString(x).replace('T',' ');

        // Add new expenses
        let newExpenses = {
            'id': Math.round((new Date()).getTime() / 1000),
            'name': expenses.name,
            'amount': Number(price),
            'freq': 0,
            'freq_start': today,
            'freq_end': today,
            'datetime': today,
            'image': image,
            'thumbnail': thumbnail,
            'todays': true,
            'fromReserved': 1
        };
        this.expensesList.push(newExpenses);

        // Delete claim if depleted
        if (expenses.amount <= 0){
            let index = this.expensesList.indexOf(expenses);
            this.expensesList.splice(index,1);
        }

        this.events.publish('reload:home', 'expensesList', this.expensesList);
        this.events.publish('change_segment', newExpenses.freq);
        this.firebaseStorage.set('expensesList', this.expensesList);
        this.events.publish('reload:expenses', this.expensesList);
    }

    findIndex(find_id: number){
        if(!this.expensesList) return;
        for (let i = 0, len = this.expensesList.length; i < len; i++) {
            if (this.expensesList[i].id == find_id){
                return i;
            }
        }
        return -1;
    }  

    getRandomInt(min: number, max: number): number {
        let n = Math.floor(Math.random() * (max - min + 1)) + min;

        if (n == 5) {
            // rare thumbnail
            n = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        else if (n == 8){
            // Extra rare
            n = Math.floor(Math.random() * (max - min + 1)) + min;
            if(n == 8){
                n = Math.floor(Math.random() * (max - min + 1)) + min;
            }
        }

        return n;
    }

    getDefaultThumbnail(name: string, type: number){
        return this.imgLib.getDefaultThumbnail(name, type);
    }

    getThumbnailName(name: string, src: string): string{
        let list = this.imgLib.generateImageList(name);
        
        for (let i = 0; i < list.length; i++){
            if(list[i].src == src){
                return list[i].name;
            }
        }
        return 'Photo';
    }

    seemore(){
        this.seemore_ok = 1;
        this.processReserved(this.expensesList);        
    }

    runNumberModal(option) {
        let modal = this.modalCtrl.create(NumberPage, option, { enableBackdropDismiss: false});
        
        modal.present().then(() => {
            const firstInput: any = document.querySelector('input');
            firstInput.focus();
        });

        modal.onDidDismiss(data => {
            if(data.claim) {
                // If claim direct add one
                this.claimExpenses(data.claim, data.value);
            }   
        });
    }
}

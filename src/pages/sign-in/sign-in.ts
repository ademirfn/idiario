import { NgForm } from '@angular/forms';
import { Component, ChangeDetectorRef } from '@angular/core';

import { LoadingController, NavController } from 'ionic-angular';
import { AppIndexPage } from "../app-index/app-index";

import { AuthService } from '../../services/auth';
import { ConnectionService } from '../../services/connection';
import { UnitiesService } from '../../services/unities';
import { CustomersService } from '../../services/customers';
import { ApiService } from './../../services/api';
import { UtilsService } from './../../services/utils';
import { NpsService } from './../../services/nps';

import { User } from '../../data/user.interface';
import { MessagesService } from '../../services/messages';

@Component({
  selector: 'page-sign-in',
  templateUrl: 'sign-in.html'
})
export class SignIn {
  cities = [
    // { name: 'customer.name', value: 'customer.url', supportUrl: 'customer.support_url' },
    { name: 'Treinamento', value: 'https://treinamento.idiario.net.br', supportUrl: '' }

  ];
  private anyError: Boolean = false;
  private errorMessage: String = "";
  selectedCity;
  isOnline: Boolean = false;
  supportUrl: string = "";
  placeholder: String = "Municípios";

  constructor(
    private auth: AuthService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private connection: ConnectionService,
    private unitiesService: UnitiesService,
    private customersService: CustomersService,
    private api: ApiService,
    private utilsService: UtilsService,
    private messages: MessagesService,
    private cdr: ChangeDetectorRef,
    private npsService: NpsService
  ) { }

  ionViewWillEnter() {
    this.isOnline = this.connection.isOnline;
    this.changeInputMunicipios(this.isOnline);
    this.connection.eventOnline.subscribe((online) => this.changeInputMunicipios(online));
  }

  changeInputMunicipios(online) {
    this.isOnline = online;
    if (!this.isOnline) {
      this.selectedCity = undefined;
      this.messages.showToast('Sem conexão!', 1000, 'top');
    } else {
      this.getCustomers();
    }
  }

  updateSupportUrl() {
    this.api.setServerUrl(this.selectedCity.value);
    const defaultSupport = "https://portabilis.freshdesk.com/";
    this.supportUrl = this.selectedCity ? this.selectedCity.supportUrl || defaultSupport : "";
  }

  getCustomers() {
    this.customersService.getCustomers().subscribe(data => {
      this.cities = data;
      this.cdr.detectChanges();
    });
  }

  loginForm(form: NgForm) {

    const credential = form.value.credential;
    const password = form.value.password;
    const loading = this.loadingCtrl.create({
      content: 'Carregando...'
    });

    loading.present();

    this.auth.signIn(credential, password).subscribe(
      (user: User) => {
        this.auth.setCurrentUser(user);
        this.npsService.startNps(user);
        this.navCtrl.push(AppIndexPage, { 'user': user });
      },
      (error) => {
        this.anyError = true;
        this.errorMessage = "Não foi possível efetuar login.";
        loading.dismiss();
      },
      () => {
        loading.dismiss();
      })
  }

  greetingText() {
    let split_afternoon = 12;
    let split_evening = 17;
    let currentHour = this.utilsService.getCurrentDate().getHours();

    let greeting = "bom dia";

    if (currentHour >= split_afternoon && currentHour <= split_evening) {
      greeting = 'boa tarde';
    } else if (currentHour >= split_evening) {
      greeting = 'boa noite';
    }

    return `Olá, ${greeting}!`;
  }

  openSupportUrl() {
    this.utilsService.openUrl(this.supportUrl);
  }
}

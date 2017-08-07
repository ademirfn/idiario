import { UtilsService } from './../../services/utils';
import { TeachingPlanDetailsPage } from './../teaching-plan-details/teaching-plan-details';
import { Storage } from '@ionic/storage';
import { AuthService } from './../../services/auth';
import { TeachingPlansService } from './../../services/teaching_plans';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-teaching-plan-index',
  templateUrl: 'teaching-plan-index.html',
})
export class TeachingPlanIndexPage {
  shownGroup = null;

  unities = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private auth: AuthService,
              private teachingPlansService: TeachingPlansService,
              private storage: Storage,
              private utilsService: UtilsService) {
  }

  ionViewDidLoad() {
    this.updateTeachingPlans();
  }

  doRefresh(refresher) {
    this.auth.currentUser().then((user) => {
      this.teachingPlansService.getTeachingPlans(
        user.teacher_id
      ).subscribe(
        (teachingPlans:any) => {
          this.storage.set('teachingPlans', teachingPlans);
        },
        (error) => {
          this.utilsService.showRefreshPageError();
          refresher.cancel();
        },
        () => {
          refresher.complete();
          this.updateTeachingPlans();
        }
      );
    });
  }

  updateTeachingPlans() {
    this.storage.get('teachingPlans').then((teachingPlans) => {
      if (!teachingPlans) return;
      this.unities = [];
      teachingPlans.unities.forEach(unity => {
        let teachingPlans = [];
        unity.plans.forEach(plan => {
          teachingPlans.push({ id: plan.id,
                               description: plan.description + ' - ' + plan.grade_name });
        });
        this.unities.push({ name: unity.unity_name, teachingPlans: teachingPlans});
      });
    });
  }

  toggleGroup(group) {
    if (this.isGroupShown(group)) {
        this.shownGroup = null;
    } else {
        this.shownGroup = group;
    }
  };

  isGroupShown(group) {
      return this.shownGroup === group;
  };

  openDetail(teachingPlanId) {
    this.navCtrl.push(TeachingPlanDetailsPage, { "teachingPlanId": teachingPlanId });
  }
}
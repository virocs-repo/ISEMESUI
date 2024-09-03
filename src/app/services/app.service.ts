import { Injectable } from '@angular/core';
import { MasterData } from './app.interface';
import { NotificationService } from '@progress/kendo-angular-notification';


interface FeatureField {
  featureFieldName: string
  active: boolean,
}
interface Feature {
  featureName: string;
  active: boolean,
  featureField: FeatureField[]
}
interface MainMenuItem {
  navigationUrl: string
  feature: Array<Feature>
}
interface UserPreferences {
  mainMenuItem: Array<MainMenuItem>
}
interface SharedInfo {
  isEditMode: boolean,
  isViewMode: boolean,
  dataItem: any

}

@Injectable({
  providedIn: 'root'
})
export class AppService {
  isDrawerExpanded: boolean = false;
  userPreferences: UserPreferences | null = null;
  activeNavigationUrls: string[] = []
  feature: Array<Feature> = []
  token = 'Bearer token';
  masterData: MasterData = {
    customerType: [],
    receiptLocation: [],
    goodsType: [],
    deliveryMode: [],
    customer: [],
  }
  sharedData: {
    receiving: SharedInfo
  } = {
      receiving: {
        isEditMode: false,
        isViewMode: false,
        dataItem: {}
      }
    }

  constructor(private notificationService: NotificationService) {
    const up = localStorage.getItem('UserPreferences');
    if (up) {
      this.userPreferences = JSON.parse(up);
      this.initPreferences()
    }
  }

  openDrawer() {
    this.isDrawerExpanded = true;
  }
  closeDrawer() {
    this.isDrawerExpanded = false;
  }
  savePreferences(up: UserPreferences) {
    localStorage.setItem('UserPreferences', JSON.stringify(up))
    this.userPreferences = up;
    this.initPreferences()
  }
  private initPreferences() {
    const item = this.userPreferences?.mainMenuItem[0];
    console.warn(item);
    if (item) {
      this.activeNavigationUrls.push(item.navigationUrl)
      this.feature = item.feature;
    }
  }
  successMessage(content: string) {
    this.notificationService.show({
      content,
      cssClass: "button-notification",
      animation: { type: "slide", duration: 400 },
      position: { horizontal: "center", vertical: "bottom" },
      type: { style: "success", icon: true },
      closable: true,
    });
  }
  errorMessage(content: string) {
    this.notificationService.show({
      content,
      cssClass: "button-notification",
      animation: { type: "slide", duration: 400 },
      position: { horizontal: "center", vertical: "bottom" },
      type: { style: "error", icon: true },
      closable: true
    });
  }
}

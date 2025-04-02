import { EventEmitter, Injectable } from '@angular/core';
import { AppFeature, AppFeatureField, AppMenu, HardwareType, MasterData, ShipmentCategory, ShipmentType, UserData } from './app.interface';
import { NotificationService } from '@progress/kendo-angular-notification';
import * as moment from 'moment';
import { DeviceDetectorService } from 'ngx-device-detector';


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
  loginId: number;
  userName:string;
  facility:string;
  roleName:string;
}

interface UserPreferences {
  roles: {
    appMenus: Array<AppMenu>
    appFeatures: Array<AppFeature>
    appFeatureFields: Array<AppFeatureField>
    mainMenuItem: Array<MainMenuItem>
  },
  token: string
  userType: string
  username: string
}
interface SharedInfo {
  isEditMode: boolean,
  isViewMode: boolean,
  dataItem: any,
  eventEmitter: EventEmitter<any>
}

@Injectable({
  providedIn: 'root'
})
export class AppService {
  isLoading = false
  isDrawerExpanded: boolean = false;
  userPreferences: UserPreferences | null = null;
  accessToken = '';
  activeNavigationUrls: string[] = []
  feature: Array<Feature> = []
  loginId: number = 0;
  userName:string =''
  facility:string =''
  roleName:string =''

  masterData: MasterData = {
    customerType: [],
    receiptLocation: [],
    goodsType: [],
    deliveryMode: [],
    customer: [], // remove this in next version
    deviceFamily: [],
    receiptStatus:[],
    serviceCategory:[],
    coo:[],
    trayVendor:[],
    trayPart:[],
    lotOwners:[],
    entityMap: {
      Customer: [],
      Vendor: [],
      Employee: []
    },
    addresses: [],
    country: [],
    courierDetails: [],
    lotCategory: [],
    deviceType: [],
  }
  sharedData: {
    receiving: SharedInfo
    shipping: SharedInfo
    combolot: SharedInfo
    Invmove: SharedInfo
    Inttransfer:SharedInfo
    anotherShipping:SharedInfo
    addshipping:SharedInfo
    addTicket:SharedInfo
    customerReceiverForm:SharedInfo

  } = {
      receiving: { isEditMode: false, isViewMode: false, dataItem: {}, eventEmitter: new EventEmitter() },
      shipping: { isEditMode: false, isViewMode: false, dataItem: {}, eventEmitter: new EventEmitter() },
      combolot: { isEditMode: false, isViewMode: false, dataItem: {}, eventEmitter: new EventEmitter() },
      Invmove: { isEditMode: false, isViewMode: false, dataItem: {}, eventEmitter: new EventEmitter() },
      Inttransfer: { isEditMode: false, isViewMode: false, dataItem: {}, eventEmitter: new EventEmitter() },
      addshipping: { isEditMode: false, isViewMode: false, dataItem: {}, eventEmitter: new EventEmitter() },
      anotherShipping : {isEditMode:false, isViewMode:false, dataItem: {}, eventEmitter: new EventEmitter() },
      addTicket: {isEditMode:false, isViewMode:false, dataItem: {}, eventEmitter: new EventEmitter()},
      customerReceiverForm: {isEditMode:false, isViewMode:false, dataItem:{}, eventEmitter: new EventEmitter()}
    }
  hardwareTypes: HardwareType[] = []
  userData: UserData = { email: '', name: '', firstName: '' }
  shipmentCategories: Array<ShipmentCategory> = Array();
  shipmentTypes: Array<ShipmentType> = Array();
  eventEmitter: EventEmitter<{ action: 'updates' | 'refreshMasterData' | 'refreshVendors'; data: any }> = new EventEmitter();
  refreshVendors = false;

  constructor(private notificationService: NotificationService, public deviceDetectorService:DeviceDetectorService) {
    const up = localStorage.getItem('UserPreferences');
    if (up) {
      this.userPreferences = JSON.parse(up);
      this.initPreferences()
    }
    this.loadUserInfo();
  }
  private loadUserInfo() {
    const ud = localStorage.getItem('user');
    if (ud) {
      this.userData = JSON.parse(ud);
    }
  }
  saveUserInfo(userData: UserData) {
    localStorage.setItem('user', JSON.stringify(userData));
    this.userData = userData;
  }
  extractFirstName(name: string): string {
    const trimmedName = name.trim();
    // const nameParts = trimmedName.split(/\s+/);
    const nameParts = trimmedName.split(/[^a-zA-Z]+/);

    if (nameParts.length > 0) {
      return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    } else {
      return "";
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
    const roles = this.userPreferences?.roles;
    // common logic, no need to map it on every component
 /*    if (roles) {
      roles.appMenus.forEach(am => {
        am.appFeatures = roles.appFeatures.filter(af => am.appMenuID == af.appMenuId);
        am.appFeatures.forEach(af => {
          af.appFeatureFields = roles.appFeatureFields.filter(aff => aff.appFeatureID == af.appFeatureId)
        })
      })
    } */
    console.log(this.userPreferences);
    if (this.userPreferences?.token) {
      this.accessToken = this.userPreferences.token;
    }
    if (this.userPreferences?.roles.mainMenuItem) {
      const item = this.userPreferences?.roles.mainMenuItem[0];
      if (item) {
        this.activeNavigationUrls.push(item.navigationUrl)
        this.feature = item.feature || [];
        this.loginId = item.loginId;
        this.userName = item.userName;
        this.facility = item.facility;
        this.roleName = item.roleName;
      }
    } else {
      console.error("Main Menu Item is missing!")
    }
  }
  successMessage(content: string) {
    this.notificationService.show({
      content,
      cssClass: "button-notification custom-notification",
      animation: { type: "slide", duration: 400 },
      position: { horizontal: "right", vertical: "top" },
      type: { style: "success", icon: true },
      closable: false
    });
  }
  errorMessage(content: string) {
    this.notificationService.show({
      content,
      cssClass: "button-notification custom-notification",
      animation: { type: "slide", duration: 400 },
      position: { horizontal: "right", vertical: "top" },
      type: { style: "error", icon: true },
      closable: false
    });
  }
  infoMessage(content: string) {
    this.notificationService.show({
      content,
      cssClass: "button-notification custom-notification",
      animation: { type: "slide", duration: 400 },
      position: { horizontal: "right", vertical: "top" },
      type: { style: "info", icon: true },
      closable: false
    });
  }
  /**
 * Returns the current date and time in the format: YYYY-MM-DD HH:MM:SS.SSS
 * @returns {string} Formatted date and time string
 */
  formattedDateTime(inputDate: string) {
    const date = new Date(inputDate);
    const isoString = date.toISOString();
    const formattedDate = isoString.replace('T', ' ').replace('Z', '');
    return formattedDate;
  }
  formattedDateTime2(inputDate: Date): string {
    const date = moment(inputDate);
    return date.format('YYYY-MM-DD HH:mm:ss.SSS');
  }
  formatJson(obj: any): string {
    const formattedObj: { [key: string]: any } = {};

    // Recursively traverse the object
    function traverse(obj: any) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newKey = splitCamelCase(key);
          if (typeof obj[key] === 'object') {
            formattedObj[newKey] = traverse(obj[key]);
          } else {
            formattedObj[newKey] = obj[key];
          }
        }
      }
      return formattedObj;
    }

    // Split camelCase string into separate words
    // Split camelCase string into separate words and capitalize first letter
    function splitCamelCase(str: string): string {
      return str
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase());
    }

    const formattedJson = traverse(obj);

    // Format output as text with design
    let output = '';
    for (const key in formattedJson) {
      if (formattedJson.hasOwnProperty(key)) {
        output += `<div><b>${key}</b>: ${formattedJson[key]}</div>`;
      }
    }

    return output;
  }
  printSection(elementId: string) {
    const element = document.getElementById(elementId)
    if (element) {
      document.body.classList.add('print-mode');
      element.classList.add('printable-area');
      const dialogElement: HTMLElement | null = document.querySelector('[role="dialog"]');
      if (dialogElement) {
        dialogElement.style.width = '100%'
      }
      window.print();
      document.body.classList.remove('print-mode');
      element.classList.remove('printable-area');
    } else {
      console.error("Element not found");
    }
  }
}

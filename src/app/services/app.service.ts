import { EventEmitter, Injectable } from '@angular/core';
import { HardwareType, MasterData, ShipmentCategory, ShipmentType, UserData } from './app.interface';
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
  loginId: number;
}
interface UserPreferences {
  roles: {
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
  isDrawerExpanded: boolean = false;
  userPreferences: UserPreferences | null = null;
  accessToken = '';
  activeNavigationUrls: string[] = []
  feature: Array<Feature> = []
  loginId: number = 0;

  masterData: MasterData = {
    customerType: [],
    receiptLocation: [],
    goodsType: [],
    deliveryMode: [],
    customer: [], // remove this in next version
    entityMap: {
      Customer: [],
      Vendor: [],
      Employee: []
    },
    addresses: []
  }
  sharedData: {
    receiving: SharedInfo
    shipping: SharedInfo
  } = {
      receiving: { isEditMode: false, isViewMode: false, dataItem: {}, eventEmitter: new EventEmitter() },
      shipping: { isEditMode: false, isViewMode: false, dataItem: {}, eventEmitter: new EventEmitter() }
    }
  hardwareTypes: HardwareType[] = []
  userData: UserData = { email: '', name: '', firstName: '' }
  shipmentCategories: Array<ShipmentCategory> = Array();
  shipmentTypes: Array<ShipmentType> = Array();

  constructor(private notificationService: NotificationService) {
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
    console.log(this.userPreferences);
    if (this.userPreferences?.token) {
      this.accessToken = this.userPreferences.token;
    }
    if (this.userPreferences?.roles.mainMenuItem) {
      const item = this.userPreferences?.roles.mainMenuItem[0];
      if (item) {
        this.activeNavigationUrls.push(item.navigationUrl)
        this.feature = item.feature || [];
        this.loginId = item.loginId
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
  m = {
    "CustomerType": [
      {
        "CustomerTypeID": 1,
        "CustomerTypeName": "Customer"
      },
      {
        "CustomerTypeID": 2,
        "CustomerTypeName": "Vendor"
      }
    ],
    "ReceiptLocation": [
      {
        "ReceivingFacilityID": 1,
        "ReceivingFacilityName": "Fremont CA",
        receiptLocationID: 1,
        receiptLocationName: "Fremont CA"
      },
      {
        receiptLocationID: 3,
        receiptLocationName: "Sanjose CA",
        "ReceivingFacilityID": 3,
        "ReceivingFacilityName": "Sanjose CA"
      }
    ],
    "GoodsType": [
      {
        "GoodsTypeID": 2,
        "GoodsTypeName": "Device"
      },
      {
        "GoodsTypeID": 1,
        "GoodsTypeName": "Hardware"
      },
      {
        "GoodsTypeID": 3,
        "GoodsTypeName": "Miscellaneous Goods"
      }
    ],
    "DeliveryMode": [
      {
        "DeliveryModeID": 1,
        "DeliveryModeName": "Courier"
      },
      {
        "DeliveryModeID": 3,
        "DeliveryModeName": "Drop Off"
      },
      {
        "DeliveryModeID": 2,
        "DeliveryModeName": "Pick Up"
      }
    ],
    "CourierDetails": [
      {
        "CourierDetailID": 7,
        "CourierName": "Amazon Logistics"
      },
      {
        "CourierDetailID": 11,
        "CourierName": "BlueDart"
      },
      {
        "CourierDetailID": 19,
        "CourierName": "Coyote Logistics"
      },
      {
        "CourierDetailID": 18,
        "CourierName": "Deliv"
      },
      {
        "CourierDetailID": 4,
        "CourierName": "DHL"
      }
    ],
    "Country": [
      {
        "CountryID": 89,
        "CountryName": "Afghanistan"
      },
      {
        "CountryID": 137,
        "CountryName": "Albania"
      },
      {
        "CountryID": 35,
        "CountryName": "Algeria"
      },
      {
        "CountryID": 138,
        "CountryName": "Andorra"
      },
      {
        "CountryID": 36,
        "CountryName": "Angola"
      }
    ]
  }

}

import { closedCaptionsIcon, crosstabIcon, editToolsIcon, exportIcon, eyeIcon, moreVerticalIcon, pencilIcon, xIcon } from "@progress/kendo-svg-icons";

export interface CustomerType {
  customerTypeID: number;
  customerTypeName: string;
}
export interface ReceiptLocation {
  receiptLocationID: number;
  receiptLocationName: string;
}
export interface GoodsType {
  goodsTypeID: number;
  goodsTypeName: string;
}
export interface DeliveryMode {
  deliveryModeID: number;
  deliveryModeName: string;
}
export interface Customer {
  customerID: number;
  customerName: string;
  email: string;
  phone: string;
}
export interface MasterData {
  customerType: CustomerType[]
  receiptLocation: ReceiptLocation[]
  goodsType: GoodsType[]
  deliveryMode: DeliveryMode[]
  customer: Customer[]
}
export interface Receipt {
  receiptID: number;
  customerTypeID: number;
  customerType: string;
  customerID: number;
  customerVendor: string;
  behalfID: number;
  receivedOnBehalf: string;
  receiptLocationID: number;
  receiptLocation: string;
  deliveryModeID: number;
  deliveryMode: string;
  contactPhone: string;
  expectedDateTime: string; // Assuming ISO 8601 format
  contactPerson: string;
  email: string;
  addressID: number;
  address: string;
  comments: string;
  noOfCartons: number;
  isHold: boolean;
  holdComments: string | null;
  isExpected: boolean;
  mailStatus: string;
  receivingStutus: string; // Corrected typo from "receivingStatus"
  receivingStatus: string; // Corrected typo from "receivingStatus"
}
export interface HardwareItem {
  hardwareID: number;
  receiptID: number;
  inventoryID: number;
  hardwareType: string;
  customerID: number;
  customer: string;
  serialNumber: string;
  expectedQty: number;
  createdOn: string; // Assuming ISO 8601 format (e.g., "2024-08-28T03:20:22.767")
  modifiedOn: string; // Assuming ISO 8601 format
  active: boolean;
}
export const INIT_HARDWARE_ITEM: HardwareItem = {
  hardwareID: 0,
  receiptID: 0,
  inventoryID: 0,
  hardwareType: '',
  customerID: 0,
  customer: '',
  serialNumber: '',
  expectedQty: 0,
  createdOn: '',
  modifiedOn: '',
  active: false
}
export interface DeviceItem {
  deviceID: number;
  inventoryID: number;
  receiptID: number;
  iseLotNum: string;
  customerLotNum: string;
  expectedQty: number;
  expedite: boolean;
  partNum: string;
  labelCount: number;
  coo: string; // Assuming "Country of Origin"
  dateCode: number;
  isHold: boolean;
  holdComments: string | null;
  createdOn: string; // Assuming ISO 8601 format
  modifiedOn: string; // Assuming ISO 8601 format
  active: boolean;
}
export const INIT_DEVICE_ITEM: DeviceItem = {
  deviceID: 0,
  inventoryID: 0,
  receiptID: 0,
  iseLotNum: '',
  customerLotNum: '',
  expectedQty: 0,
  expedite: false,
  partNum: '',
  labelCount: 0,
  coo: '',
  dateCode: 0,
  isHold: false,
  holdComments: null,
  createdOn: new Date().toISOString(), // Set to current time
  modifiedOn: new Date().toISOString(), // Set to current time
  active: true,
};
export interface JSON_Object {
  [key: string]: any
}

export const ICON = {
  moreVerticalIcon,
  xIcon,
  pencilIcon,
  eyeIcon,
  exportIcon
}

export const MESSAGES = {
  DataSaved: "Data Saved!",
  DataSaveError: 'Error while saving data, try again!'
}
export interface UserData {
  name: string;
  firstName: string;
  email: string
}

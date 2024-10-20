import { cartIcon, clipboardTextIcon, closedCaptionsIcon, crosstabIcon, editToolsIcon, exportIcon, eyeIcon, eyeSlashIcon, gearIcon, jsIcon, kpiStatusHoldIcon, logoutIcon, menuIcon, moreVerticalIcon, pencilIcon, printIcon, selectBoxIcon, userIcon, windowRestoreIcon, xIcon } from "@progress/kendo-svg-icons";

export interface CustomerType {
  customerTypeID: number;
  customerTypeName: string;
}
export interface ReceiptLocation {
  receivingFacilityID: number;
  receivingFacilityName: string;
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
  CustomerID: number;
  CustomerName?: string;
  VendorID?: number;
  VendorName?: string;
  email: string;
  phone: string;
}

export interface Vendor {
  VendorID: number;
  VendorName: string;
}
export type EntityType = 'Customer' | 'Vendor' | 'Employee';
export interface EntityMap {
  Customer: Customer[]
  Vendor: Vendor[],
  Employee: Employee[]
}
export interface Country {
  countryID: number
  countryName: string
}
export interface CourierDetails {
  courierDetailID: number
  courierName: string
}
export interface MasterData {
  customerType: CustomerType[]
  receiptLocation: ReceiptLocation[]
  goodsType: GoodsType[]
  deliveryMode: DeliveryMode[]
  customer: Customer[]  // remove this in next version
  entityMap: EntityMap;
  addresses: Address[];
  country: Country[];
  courierDetails: CourierDetails[];
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
  signatureDate: string;
}
export interface HardwareItem {
  hardwareID: number;
  receiptID: number;
  inventoryID: number;
  hardwareType: string;
  customerID: number;
  serialNumber: string;
  expectedQty: number;
  createdOn: string; // Assuming ISO 8601 format (e.g., "2024-08-28T03:20:22.767")
  modifiedOn: string; // Assuming ISO 8601 format
  active: boolean;

  customerName: string;
  hardwareTypeID: number;

  recordStatus?: "I" | "U";
}

export interface MiscellaneousGoods {
  miscellaneousGoodsID: number | null;
  receiptID: number;
  inventoryID: number;
  customerVendorID: number;
  customerVendor: string;
  serialNumber: string;
  additionalInfo: string;
  createdOn: Date | string;
  modifiedOn: Date | string;
  active: boolean;
  recordStatus?: "I" | "U";
}
export const INIT_HARDWARE_ITEM: HardwareItem = {
  hardwareID: 0,
  receiptID: 0,
  inventoryID: 0,
  hardwareType: '',
  hardwareTypeID: 0,
  customerID: 0,
  customerName: '',
  serialNumber: '',
  expectedQty: 0,
  createdOn: '',
  modifiedOn: '',
  active: true,
  recordStatus: 'I'
}
export const INIT_MISCELLANEOUS_GOODS: MiscellaneousGoods = {
  miscellaneousGoodsID: null,
  receiptID: 0,
  inventoryID: 0,
  customerVendorID: 0,
  customerVendor: '',
  serialNumber: '',
  additionalInfo: '',
  createdOn: '',
  modifiedOn: '',
  active: true,
  recordStatus: 'I'
}
export interface DeviceItem {
  deviceID: number;
  receiptID: number;
  iseLotNumber: string;
  customerLotNumber: string;
  expedite: boolean;
  customerCount: number;
  labelCount: number;
  coo: string; // Assuming "Country of Origin"
  dateCode: number;
  isHold: boolean;
  holdComments: string | null;
  createdOn: string; // Assuming ISO 8601 format
  modifiedOn: string; // Assuming ISO 8601 format
  active: boolean;
  recordStatus?: "I" | "U";
  lotOwner: string
  iqa: boolean
}
export const INIT_DEVICE_ITEM: DeviceItem = {
  deviceID: 0,
  receiptID: 0,
  iseLotNumber: '',
  customerLotNumber: '',
  expedite: false,
  customerCount: 0,
  labelCount: 0,
  coo: '',
  dateCode: 0,
  isHold: false,
  holdComments: null,
  createdOn: new Date().toISOString(), // Set to current time
  modifiedOn: new Date().toISOString(), // Set to current time
  active: true,
  lotOwner: '',
  iqa: true,
  recordStatus: 'I'
};
export interface JSON_Object {
  [key: string]: any
}

export const ICON = {
  moreVerticalIcon,
  xIcon,
  pencilIcon,
  eyeIcon,
  exportIcon,
  eyeSlashIcon,
  menuIcon,
  selectBoxIcon,
  cartIcon,
  windowRestoreIcon,
  jsIcon,
  clipboardTextIcon,
  userIcon,
  gearIcon,
  logoutIcon,
  printIcon,
  kpiStatusHoldIcon
}

export const MESSAGES = {
  DataSaved: "Data Saved!",
  DataSaveError: 'Error while saving data, try again!',
  NoChanges: 'No changes, nothing to update or insert'
}
export interface UserData {
  name: string;
  firstName: string;
  email: string
}

export interface ShipmentCategory {
  shipmentCategoryID: number
  shipmentCategoryName: string
}
export interface ShipmentType {
  shipmentTypeID: number
  shipmentTypeName: string
}
export interface ShipmentDetails {
  inventoryID: number;
  shipmentLineItemID: number;
  customerLotNum: string;
  iseLotNum: string;
  goodsType: string;
  partNum: string;
  currentQty: number;
  shipmentQty: number;
  shipmentTypeID: number;
  shipmentType: string;
  address: string;
}
export interface CustomerOrderDetail {
  CustomerOrderDetailID: number | null;
  InventoryID: number;
  ShippedQty: number;
  RecordStatus: string;
}

export interface CustomerOrder {
  CustomerOrderID: number | null;
  CustomerId: number;
  CustomerOrderType:string;
  OQA: boolean | false;
  Bake: boolean | false;
  PandL: boolean | false;
  CompanyName: string;
  ContactPerson: string;
  ContactPhone: string;
  Address1: string;
  Address2: string | null;
  City: string;
  State: string;
  Zip: string;
  Country: string;
  OrderStatus: string | null;
  RecordStatus: string;
  Active: boolean;
  CustomerOrderDetails: CustomerOrderDetail[];
}

export interface OrderRequest {
  CustomerOrder: CustomerOrder[];
}

export interface Address {
  addressId: number;
  addressType: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  shipTo: string;
  aeType: number;
  createdOn: Date | string;
  modifiedOn: Date | string;
  active: boolean;
  fullAddress?: string; // custom property to show on UI
}

export interface Employee {
  EmployeeID: number
  EmployeeName: string
}
export interface PostReceipt {
  ReceiptID: number | null;
  VendorID: number | null;
  VendorName: string | null;
  CustomerTypeID: number;
  CustomerVendorID: number;
  BehalfID: number;
  ReceivingFacilityID: number;
  DeliveryModeID: number;
  CourierDetailID: number | null;
  CountryFromID: number | null;
  ContactPerson: string;
  ContactPhone: string;
  Email: string;
  ExpectedDateTime: Date | string;
  AddressID: number;
  MailComments: string | null;
  PMComments: string | null;
  NoOfCartons: number;
  IsHold: boolean;
  HoldComments: string | null;
  IsExpected: boolean;
  IsInterim: boolean;
  IsFTZ: boolean;
  MailStatus: string | null;
  ReceivingStatus: string | null;
  SignaturePersonType: string;
  SignaturePersonID: number;
  Signature: string;
  SignatureDate: Date | string;
  RecordStatus: string;
  Active: boolean;
  LoginId: number;
  EmployeeDetail: Employee[];
  TrackingNumber: string | null;
}
export const INIT_POST_RECEIPT: PostReceipt = {
  ReceiptID: null,
  VendorID: null,
  VendorName: null,
  CustomerTypeID: 1,
  CustomerVendorID: 31,
  BehalfID: 33,
  ReceivingFacilityID: 1,
  DeliveryModeID: 3,
  CourierDetailID: null,
  CountryFromID: null,
  ContactPerson: "Amith S",
  ContactPhone: "215-634-123",
  Email: "Amith_s@xyz.com",
  ExpectedDateTime: "2024-08-27 09:28:39.187",
  AddressID: 1,
  MailComments: null,
  PMComments: null,
  NoOfCartons: 2,
  IsHold: false,
  HoldComments: null,
  IsExpected: false,
  IsInterim: false,
  IsFTZ: false,
  MailStatus: null,
  ReceivingStatus: null,
  SignaturePersonType: "Vendor",
  SignaturePersonID: 1,
  Signature: "Amithsvc",
  SignatureDate: "2024-08-27 09:28:39.187",
  RecordStatus: "I",
  Active: true,
  LoginId: 1,
  EmployeeDetail: [],
  TrackingNumber: null
}
export interface PostHardware {
  HardwareID: number;
  ReceiptID: number;
  CustomerID: number;
  HardwareTypeID: number;
  ExpectedQty: number;
  RecordStatus: "I" | "U";
  Active: boolean;
  LoginId: number;
}
export const INIT_POST_HARDWARE = {
  HardwareID: 5,
  ReceiptID: 4,
  CustomerID: 6,
  HardwareTypeID: 10,
  ExpectedQty: 1,
  RecordStatus: "I",
  Active: true,
  LoginId: 1
}
export interface PostDevice {
  DeviceID: number | null;
  ReceiptID: number;
  CustomerLotNumber: string;
  CustomerCount: number;
  Expedite: boolean;
  IQA: boolean;
  LotID: number | null;
  LotOwnerID: number | null;
  LabelCount: number;
  DateCode: number;
  COO: string;
  IsHold: boolean;
  HoldComments: string | null;
  RecordStatus: "I" | "U";
  Active: boolean;
  LoginId: number;
}

export const INIT_POST_DEVICE: PostDevice = {
  DeviceID: null,
  ReceiptID: 4,
  CustomerLotNumber: "CL008",
  CustomerCount: 50,
  Expedite: false,
  IQA: true,
  LotID: 14054,
  LotOwnerID: 1,
  LabelCount: 50,
  DateCode: 202304,
  COO: "CA",
  IsHold: true,
  HoldComments: "Quality check",
  RecordStatus: "I",
  Active: true,
  LoginId: 1
}
export interface HardwareType {
  hardwareTypeID: number
  hardwareType: string
}
export interface SignatureTypes {
  customerTypeID: number;
  customerTypeName: string
}
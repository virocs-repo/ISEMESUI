import { cartIcon, clipboardTextIcon, closedCaptionsIcon, crosstabIcon, editToolsIcon, exportIcon, eyeIcon, eyeSlashIcon, gearIcon, jsIcon, kpiStatusHoldIcon, logoutIcon, menuIcon, moreVerticalIcon, pencilIcon, printIcon, selectBoxIcon, trashIcon, userIcon, windowRestoreIcon, xIcon } from "@progress/kendo-svg-icons";

export interface CustomerType {
  customerTypeID: number;
  customerTypeName: 'Customer' | 'Vendor';
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
  deliveryModeName: "Courier" | "Customer Drop-Off" | "Pickup"
}
export interface Customer {
  CustomerID: number;
  CustomerName: string;
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
  lotCategory: LotCategory[];
  deviceType: DeviceType[];
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
  signaturebase64Data: string;
  signatureDate: string;
  active: boolean
}
export interface HardwareItem {
  hardwareID: number;
  receiptID: number;
  inventoryID: number;
  hardwareType: string;
  customerHardwareID: number | null;
  serialNumber: string;
  expectedQty: number;
  createdOn: string; // Assuming ISO 8601 format (e.g., "2024-08-28T03:20:22.767")
  modifiedOn: string; // Assuming ISO 8601 format
  active: boolean;

  customerName: string;
  hardwareTypeID: number;

  recordStatus: "I" | "U";
  customerSelected: Customer | undefined
  hardwareTypeSelected: HardwareType | undefined
}

export const INIT_HARDWARE_ITEM: HardwareItem = {
  hardwareID: 0,
  receiptID: 0,
  inventoryID: 0,
  hardwareType: '',
  hardwareTypeID: 0,
  customerHardwareID: null,
  customerName: '',
  serialNumber: '',
  expectedQty: 0,
  createdOn: '',
  modifiedOn: '',
  active: true,
  recordStatus: 'I',
  customerSelected: undefined,
  hardwareTypeSelected: undefined
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
  lotIdentifier: string;
  customerCount: number;
  labelCount: number | null;
  coo: string | null; // Assuming "Country of Origin"
  dateCode: string | null;
  isHold: boolean;
  holdComments: string | null;
  createdOn: string; // Assuming ISO 8601 format
  modifiedOn: string; // Assuming ISO 8601 format
  active: boolean;
  recordStatus?: "I" | "U";
  lotOwner: string
  lotOwnerID: number
  iqa: boolean
  deviceTypeID: number
  employeeSelected: Employee | undefined
  countrySelected: Country | undefined,
  deviceTypeSelected: DeviceType | undefined
  lotCategoryID: number,
  lotIdentifierSelected: any | undefined
}
export const INIT_DEVICE_ITEM: DeviceItem = {
  deviceID: 0,
  receiptID: 0,
  iseLotNumber: '',
  customerLotNumber: '',
  expedite: false,
  lotIdentifier: '',
  customerCount: 0,
  labelCount: null,
  coo: '',
  dateCode: '',
  isHold: false,
  holdComments: '',
  createdOn: new Date().toISOString(), // Set to current time
  modifiedOn: new Date().toISOString(), // Set to current time
  active: true,
  lotOwner: '',
  lotOwnerID: 0,
  iqa: false,
  recordStatus: 'I',
  deviceTypeID: 0,
  employeeSelected: undefined,
  countrySelected: undefined,
  deviceTypeSelected: undefined,
  lotCategoryID: 0,
  lotIdentifierSelected: undefined
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
  kpiStatusHoldIcon,
  trashIcon
}

export const MESSAGES = {
  DataSaved: "Data Saved!",
  DataSaveError: 'Error while saving data, try again!',
  NoChanges: 'No changes, nothing to update or insert',
  AllFieldsRequired: 'All the fields are required'
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
  shipmentTypeSelected?: ShipmentType
  selected?: boolean
}
export interface Shipment {
  shipmentId: number;
  customerID: number;
  customer: null; // or you can define a Customer interface if needed
  shipmentNum: string;
  location: string;
  shipmentCategoryID: number;
  currentLocationID: number;
  currentLocation: string;
  shipmentLocation: string;
  senderInfo: string;
  customerInfo: string;
  shippmentInfo: string;
  isShipped: boolean;
  modifiedOn: string; // or Date if you want to enforce date format
  customerTypeSelected: CustomerType | undefined;
  holdComments: string;
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
  CustomerOrderType: string;
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
  CustomerVendorID: number | null;
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
  Signaturebase64Data: string;
  SignatureDate: Date | string;
  RecordStatus: "I" | "U";
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
  Signature: "",
  Signaturebase64Data: "",
  SignatureDate: "2024-08-27 09:28:39.187",
  RecordStatus: "I",
  Active: true,
  LoginId: 1,
  EmployeeDetail: [],
  TrackingNumber: null
}
export interface PostHardware {
  HardwareID: number | null;
  ReceiptID: number | null;
  CustomerHardwareID: number | null;
  HardwareTypeID: number | null;
  ExpectedQty: number;
  RecordStatus: "I" | "U";
  Active: boolean;
  LoginId: number;
}
export const INIT_POST_HARDWARE: PostHardware = {
  HardwareID: null,
  ReceiptID: null,
  CustomerHardwareID: null,
  HardwareTypeID: null,
  ExpectedQty: 0,
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
  LotIdentifier: string | null;
  LotOwnerID: number | null;
  LabelCount: number | null;
  DateCode: string;
  COO: number | null;
  IsHold: boolean;
  HoldComments: string | null;
  RecordStatus: "I" | "U";
  Active: boolean;
  LoginId: number;
  DeviceTypeID: number
  LotCategoryID: number
}

export const INIT_POST_DEVICE: PostDevice = {
  DeviceID: null,
  ReceiptID: 4,
  CustomerLotNumber: "CL008",
  CustomerCount: 50,
  Expedite: false,
  IQA: false,
  LotIdentifier: "14054",
  LotOwnerID: 1,
  LabelCount: null,
  DateCode: '',
  COO: null,
  IsHold: true,
  HoldComments: "Quality check",
  RecordStatus: "I",
  Active: true,
  LoginId: 1,
  DeviceTypeID: 1,
  LotCategoryID: 1
}
export interface HardwareType {
  hardwareTypeID: number
  hardwareType: string
}
export interface SignatureTypes {
  customerTypeID: number;
  customerTypeName: string
}
export interface PostMiscGoods {
  MiscellaneousGoodsID: number | null
  ReceiptID: number,
  AdditionalInfo: string,
  RecordStatus: "I" | "U"
  Active: boolean
  LoginId: number
}
export interface LotCategory {
  lotCategoryID: number,
  lotCategoryName: string
}
export interface DeviceType {
  deviceTypeID: number,
  deviceTypeName: string
}
export interface ShipmentDetails2 {
  ShipmentLineItemID: number | null,
  InventoryID: number
}
export interface PostShipment {
  ShipmentID: number | null;
  CustomerID: number;
  ShipmentNum: string;
  ShipmentCategoryID: number;
  ShipmentLocation: string;
  CurrentLocationID: number;
  SenderInfo: string;
  CustomerInfo: string;
  ShippmentInfo?: string;
  IsShipped: boolean;
  ShipmentDetails: Array<ShipmentDetails2>;
  RecordStatus: 'U' | "I";
  Active: boolean;
  LoginId: number;
}
export interface CombineLot {
  receiptID: number; // Represents the receipt ID
  customerVendorID: number; // Customer/Vendor ID
  customer: string; // Type of goods (e.g., Device)
  behalfID: number; // Behalf ID
  goodsType: string; // Type of goods (e.g., Device)
  inventoryID: number; // Inventory ID
  iseLotNum: string; // ISE Lot Number
  customerLotNum: string; // Customer Lot Number
  expectedQty: number; // Expected Quantity
  expedite: boolean; // Whether the item is expedited
  partNum: string; // Part Number
  labelCount: number; // Label Count
  coo: string | null; // Country of Origin (nullable)
  dateCode: string | null; // Date Code (nullable)
  isHold: boolean; // Whether the item is on hold
  active: boolean; // Whether the item is active
  comboLotID: number; // Combo Lot ID
  viewFlag: number; // View Flag (could be an enum or status indicator)
}

export interface CombineLotPayload {
  comboLotID?: number | null; // Optional, can be null for new records
  comboName: string;
  str_InventoryId: string;
  primary_InventoryId: number;
  userID: number;
  active: boolean;
  comments?: string; // Optional
}
export interface KeyValueData {
  Id: number;
  Name: string;
}

// Roles
export interface AppMenu {
  appMenuID: number;
  menuTitle: 'Receiving Menu' | "Hold Menu" | "Shipping Menu";
  navigationUrl: string;
  description: string;
  appFeatureID: number;
  parentID: number;
  appMenuIndex: number;
  sequenceNumber: number;
  active: boolean;
  // custom
  appFeatures: AppFeature[];
}
export interface AppFeature {
  appMenuId: number;
  appFeatureId: number;
  featureID: number;
  featureName: "Receiving Add" | "Receiving Edit" | "Receiving View" | "Receiving Void" |
  "Hold Edit" | "Hold View" |
  "Shipping Add" | "Shipping Edit" | "Shipping View" | "Shipping Void"
  active: boolean;
  // custom
  appFeatureFields: AppFeatureField[]
}
export interface AppFeatureField {
  appFeatureID: number;
  featureFieldId: number;
  featureName: string | null;
  featureFieldName: string;
  active: boolean;
  isReadOnly: boolean;
  isWriteOnly: boolean;
}
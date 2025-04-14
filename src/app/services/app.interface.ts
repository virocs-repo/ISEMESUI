import { MenuItem } from "@progress/kendo-angular-menu";

import { cartIcon, clipboardTextIcon, closedCaptionsIcon, crosstabIcon, editToolsIcon, exportIcon, eyeIcon, eyeSlashIcon, gearIcon, jsIcon, kpiStatusHoldIcon, logoutIcon, menuIcon, moreVerticalIcon, pencilIcon, printIcon, selectBoxIcon, trashIcon, userIcon, windowRestoreIcon, xIcon, saveIcon, mapMarkerIcon } from "@progress/kendo-svg-icons";

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
export interface DeviceFamily {
  deviceFamilyId: number;
  deviceFamilyName: string;
}
export interface ReceiptStatus {
  masterListItemId: number;
  itemText: string;
}
export interface ServiceCategory {
  serviceCategoryId: number;
  serviceCategoryName: string;
}
export interface Coo {
  serviceCategoryId: number;
  serviceCategoryName: string;
}
export interface LotOwners {
  employeeID: number;
  employeeName: string;
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
export interface TrayVendor {
  trayVendorId: number
  vendorName: string
}
export interface TrayPart {
  trayPartId: number
  trayNumber: string
}
export interface Others {
  id: number
  categoryName: string
}
export interface PackageCategory {
  id: number
  categoryName: string
}
export interface Hardware{
  Id: number
  CategoryName: string
}
export interface Quotes{
  quoteId: number
  quote: string
}
export interface PurchaseOrder{
  purchaseOrderId: number
  customerPoNumber: string
}
export interface Category{
  serviceCategoryId: number
  serviceCategoryName: string
}
export interface MasterData {
  customerType: CustomerType[]
  receiptLocation: ReceiptLocation[]
  goodsType: GoodsType[]
  deliveryMode: DeliveryMode[]
  customer: Customer[]  // remove this in next version
  deviceFamily : DeviceFamily[]
  receiptStatus : ReceiptStatus[]
  lotOwners: LotOwners[]
  serviceCategory : ServiceCategory[]
  coo : Coo[]
  trayVendor : TrayVendor[]
  trayPart : TrayPart[]
  entityMap: EntityMap;
  PackageCategory: PackageCategory[];
  Others:Others[],
  hardware: Hardware[];
  Quotes: Quotes[];
  PurchaseOrder: PurchaseOrder[];
  Category: Category[];
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
  expectedQty: number | '';
  createdOn: string; // Assuming ISO 8601 format (e.g., "2024-08-28T03:20:22.767")
  modifiedOn: string; // Assuming ISO 8601 format
  active: boolean;

  customerName: string;
  hardwareTypeID: number;

  recordStatus: "I" | "U";
  isReceived?: boolean
  // custom
  customerSelected: Customer | undefined
  hardwareTypeSelected: HardwareType | undefined
  error: boolean
  rowActionMenu: MenuItem[]
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
  expectedQty: '',
  createdOn: '',
  modifiedOn: '',
  active: true,
  recordStatus: 'I',

  customerSelected: undefined,
  hardwareTypeSelected: undefined,
  error: false,
  rowActionMenu:[]
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
  isReceived?: boolean
  error?: boolean
  rowActionMenu: MenuItem[]
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
  recordStatus: 'I',
  rowActionMenu:[]
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
  deviceType: string
  employeeSelected: Employee | undefined
  countrySelected: Country | undefined,
  deviceTypeSelected: DeviceType | undefined
  lotCategoryID: number,
  lotIdentifierSelected: any | undefined
  // custom
  error?: boolean
  isReceived?: boolean
  rowActionMenu: MenuItem[]
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
  deviceType:'',
  employeeSelected: undefined,
  countrySelected: undefined,
  deviceTypeSelected: undefined,
  lotCategoryID: 0,
  lotIdentifierSelected: undefined,

  rowActionMenu: []
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
  trashIcon,
  saveIcon,
  mapMarkerIcon
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

  additionalInfo: null;
  toCity: string;
  toCountry: string;
  toName: string;
  toPhone: string;
  toState: string;
  toStreet1: string;
  toZip: string;
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
  deliveryInfoId:number;
  clientAccountNumber :string;
  Parcels :ParcelRequest[];
}
export interface CustomerOrderDetail {
  CustomerOrderDetailID: number | null;
  InventoryID: number;
  ShippedQty: number;
  RecordStatus: string;
}

export interface CustomerAddress {
  ShippingMethodId:number;
  IsForwarder: boolean;
  ContactPerson: string;
  Phone: string;
  ShipAlertEmail: string;
  ExpectedTime: string|null;
  Comments: string; 
  SpecialInstructionforShipping: string;
  PackingSlipComments: string;
  CIComments: string;
  AddressId:number;  
  Email:string;
  Country:string;
  CompanyName:string;
  Address1:string;
  Address2:string;
  Address3:string;
  Zip:string;
  StateProvince:string;
  City:string;
  Extension:string;
  ShipDate:string|null;
  CountryOfOrigin:string;
  CIFromId:number;
  UnitValue:number| undefined;
  TotalValue:number| undefined;
  Units:number| undefined;
  ECCN:string;
  ScheduleBNumber:number| undefined;
  LicenseType:string;
  CommidityDescription:string;
  UltimateConsignee:string;
  DestinationId:number;
  CourierId:number;
  ServiceType:string;
  PackageType:string;
  BillTransportationTo:string;
  BillTransportationAcct:string;
  CustomerReference:string;
  NoOfPackages:string;
  Weight:number|null;
  PackageDimentions:string;
  IsResidential:boolean;
  AccountNumber:string;
  ReferenceNumber1:string;
  ReferenceNumber2:string;
  OtherAccountNumber:number | null;
  TaxId:string;
  Attention:string;
  InvoiceNumber:string;
  BillDutyTaxFeesTo:string;
  BillDutyTaxFeesAcct:string;
  CommodityDescription:string;
  ScheduleBUnits1:number|null;
  PurchaseNumber:string;
  ShipmentReference:string;
  CustomsTermsOfTradeId:number;
  Qty:number|null;
  CommodityOrigin:string;
  BillToCountry:string;
  BillToContactPerson:string;
  BillToCompanyName:string;
  BillToAddress1:string;
  BillToAddress2:string;
  BillToAddress3:string;
  BillToPhone:string;
  BillToStateProvince:string;
  BillToCity:string;
  BillToZip:string;
  BillToExtension:string;
  CustomerBillTOAddressId:number | null;
  BillCheck:boolean;
  RejectLocationId:number;
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
  IsHoldShip:boolean;
  CustomerOrderDetails: CustomerOrderDetail[];
  CustomerAddress :CustomerAddress[];
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
  EmployeeEmail:string
}
export interface PostReceipt {
  ReceiptID: number | null;
  VendorID: number | null;
  VendorName: string | null;
  CustomerTypeID: number;
  CustomerVendorID: number | null;
  BehalfID: number|null;
  ReceivingFacilityID: number;
  DeliveryModeID: number;
  CourierDetailID: number | null;
  CountryFromID: number | null;
  ContactPerson: string;
  ContactPhone: string;
  Email: string | null;
  ExpectedDateTime: Date | string;
  AddressID: number | null;
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
  SignaturePersonID: number | null;
  Signature: string;
  Signaturebase64Data: string;
  SignatureDate: Date | string;
  RecordStatus: "I" | "U";
  Active: boolean;
  LoginId: number;
  EmployeeDetail: Employee[];
  TrackingNumber: string | null;
  SignaturePerson : string | null;
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
  AddressID: null,
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
  TrackingNumber: null,
  SignaturePerson : null
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
  IsReceived:boolean
}
export const INIT_POST_HARDWARE: PostHardware = {
  HardwareID: null,
  ReceiptID: null,
  CustomerHardwareID: null,
  HardwareTypeID: null,
  ExpectedQty: 0,
  RecordStatus: "I",
  Active: true,
  LoginId: 1,
  IsReceived: false
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
  IsReceived:boolean
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
  LotCategoryID: 1,
  IsReceived:false
}
// interim
export interface InterimLot {
  inventoryID: number
  iseLotNumber: string
}
export interface InterimItem extends DeviceItem {
  interimLotSelected: InterimLot | undefined
  receivedQTY: number
  goodQty: number
  rejectedQty: number
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
  IsReceived:boolean
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
// export interface KeyValueData {
//   Id: number;
//   Name: string;
// }

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
export interface KeyValueData {
  id: number;
  name: string;
}

export interface AnotherShippingLineitem {
  lineItemId: number;
  description: string;
  quantity: number;
  value: string;
  lotNumber: string;
  inventoryID: number;
  status: number;
  lotNumberSelected: string;
  recordStatus: string,
}

export const INIT_OTHERSHIPPING_ITEM: AnotherShippingLineitem = {
  lineItemId: 0,
  description: "",
  quantity: 0,
  value: "",
  lotNumber: "",
  inventoryID: 0,
  status: 1,
  lotNumberSelected: "",
  recordStatus: 'I',
}

export interface AnotherShipDetails {
  anotherShipmentID: number
  requestorID: number
  email: string
  serviceTypeID: number // add new
  accountNo: number// add new
  recipientName: string
  phoneNo: string
  customerTypeID: number //modify to IsCustomerOrVendor
  customerVendorID: number
  behalfID: number //What is this?
  address1: string
  address2: string //What is this?
  city: string
  state: string
  zip: string
  country: string
  instructions: string
  status: string //What is this?
  recordStatus: string //What is this?
  shippingStatusID: number //What is this?
  approverID: number
  approvedBy: number
  userID: number
  approvedON: Date // do we need this from UI or can be taken as getdate in the SQL?
  anotherShipLineItems: AnotherShippingLineitem[]
  CustomerAddress :CustomerAddress[];
}
export const INIT_ANOTHERSHIPDETAILS: AnotherShipDetails = {
  anotherShipmentID: 0,
  requestorID: 0,
  email: "",
  serviceTypeID: 0,
  accountNo: 0,
  recipientName: "",
  phoneNo: "",
  customerTypeID: 0,
  customerVendorID: 0,
  behalfID: 0,
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  instructions: "",
  status: "",
  recordStatus: "",
  shippingStatusID: 0,
  approverID: 0,
  approvedBy: 0,
  userID: 0,
  approvedON: new Date(),
  anotherShipLineItems: [],
  CustomerAddress :[]
}

export interface AnotherShip {
  anotherShipmentID: number
  customerID: number
  customerType: string
  customer: string
  shipmentNum: string
  shipmentLocation: string
  shipmentMethod: string
  shipmentCategory: string
  currentLocation: string
  status: string
  deliveryInfoId:number
}
export interface ReceiptAttachment {
  attachmentId: number,
  objectID: number,
  attachmentName: string,
  path: string,
  active: boolean,
  loginId: number
}
export interface ReceiptAttachment {
  attachmentId: number,
  objectID: number,
  attachmentName: string,
  path: string,
  active: boolean,
  loginId: number
}
export interface InterimDevice {
  InventoryID:number
  InterimReceiptID:number
  UserID:number
  ReceivedQTY:number|null
  GoodQty:number|null
  RejectedQty:number|null
  InterimStatusID:number
  RecordStatus: "I" | "U"
  IsReceived:boolean
  IsHold:boolean
  Active:boolean
}
export interface OperaterAttachments{
  AttachmentId : number
  TRVStepId : number
  TransactionId : number
  AttachedFile : string
  AttachmentTypeId : number
  AttachmentType : string
  AttachedById :number
  AttachedBy : string
  UpdatedBy : string
  AttachedOn : Date
  UpdatedOn : Date
  Active : boolean
}
export interface ShippingAttachment {
  attachmentId: number,
  objectID: number,
  attachmentName: string,
  path: string,
  active: boolean,
  loginId: number,
  createdBY:string,
  createdON:Date
}
// Define the interface for each package
export interface Package {
  packageId: string,
  packageNo: number,
  ciPackageDimentions: string,
  ciWeight: number,
  active: boolean
}
export interface PackageUpdate {
  PackageId: string,
  PackageNo: number,
  CIPackageDimentions: string,
  CIWeight: number,
  Active: boolean
}
// Define the interface for the overall upsert request
export interface UpsertShipPackageDimensionReq {
  ShipmentID: string,
  LoginID: string,
  Packages: PackageUpdate[]
}

export interface ParcelRequest {
  length: number;
  width: number;
  height: number;
  distanceUnit: string; // Default "in"
  weight: number;
  massUnit: string; // Default "lb"
  pno:number;
}

export interface TicketType {
  ticketTypeID:number
  ticketTypeName:string
  multiSelect:boolean
}

export interface TicketLot
{
  inventoryID:number
  lotNum:string
}

export interface TicketAttachment
{
  AttachmentPath:string
}

export interface ScanLot
{
  InventoryID:number
  LotNum:string
}
export interface TicketDetail
{
  ticketID:number|null
  ticketTypeID:number
  requestorID:number
  requestDetails:string
  dueDate:Date 
  userID:number
  active:number
  statusID:number
  comments:TicketComments[]
  lotDetails:TicketLotDetail[]
}

export interface AddEditTicket
{
  TicketID:number|null
  TicketTypeID:number
  TicketType:string
  RequestorID:number
  RequestDetails:string
  LotString:string
  TicketStatus:string
  DueDate:string
  UserID:number
  Active:number
  StatusID:number
  RecordStatus:string
  ReviewerComment:string
  RequestorComment:string
  CommentID:number|null
  ReviewerAttachments:TicketAttachment[]
  ScanLots:ScanLot[]
}
export interface TicketComments
{
  commentId:number
  reviewerComments:string
  requestorComments:string
  createdOn:Date | string
  createdBy:string
  isEditable:boolean
}
export interface TicketLotDetail
{
  inventoryID:number
  iseLot:string
  customerLot:string
  deviceType:string
  qty:number
  icrLocation:string
  customerName:string
  scanLotNum:string
}

export const INIT_TICKET : AddEditTicket = 
{
  TicketID:null,
  TicketTypeID:0,
  TicketType:'',
  RequestorID:0,
  RequestDetails:'',
  LotString:'',
  TicketStatus:'',
  DueDate:'',
  UserID:0,
  Active:0,
  StatusID:0,
  RecordStatus:'',
  ReviewerComment:'',
  RequestorComment:'',
  CommentID:null,
  ReviewerAttachments:[],
  ScanLots:[]
}
export interface CommentsRow
{
  commentId:number
  reviewerComments:string
  requestorComments:string
}
export interface TicketAttachment {
  fileName:string
  active:boolean
}
export interface CommentsAttachment {
  commentID:number
  fileName:string
  active:boolean
}
export interface MailInfoRequest {
  MailDetails: MailRoomDetails[];
}
export interface MailInfoRequest {
  MailDetails: MailRoomDetails[]; 
}

export interface MailRoomDetails {
  CustomerTypeId: number|undefined;
  CustomerVendorName: string|undefined;
  BehalfId: number |undefined;
  AWBMailCode: string;
  ScanLocation: string;
  LocationId: number|undefined;
  RecipientId: number|undefined;
  SendorId: number|undefined;
  PartialDelivery: boolean|undefined;
  IsDamage: boolean|undefined;
  IsHold: boolean|undefined;
  DeliveryMethodId: number|undefined;
  ContactPerson: string;
  Email: string;
  CourierId: number|undefined;
  SendFromCountryId: number|undefined;
  TrackingNumber: string;
  ExpectedDateTime: Date; 
  AddressId: number|undefined;
  MailComments: string;
  NoofPackages: number|null;
  PackageCategory: string|undefined;
  POId: number;
  Signaturebase64Data:string;
  OtherDetails: {
    OtherId?: number | null;
    TypeId: number;
    Details: string;
    Qty: number;
  }[];
  
}

// export interface OtherDetails {
//   otherId?: number | null;
//   typeId: number;
//   details: string;
//   qty: number;
// }
export interface ReceiptJson {
    ReceiptDetails: ReceiptDetails;
  LotDetails: LotDetails;
  TrayDetails: TrayDetails;
  HardwareDetails: HardwareDetails;
  OtherDetails: OtherDetails;
}

export interface ReceiptDetails {
  IsInterim: boolean;
  CustomerTypeID: number | null;
  CustomerVendorID: number | null;
  BehalfID: number | null;
  RecipientId: number | null;
  SendorId: number | null;
  ReceivingFacilityID: number | null;
  DeliveryMethodID: number | null;
  ContactPerson: string;
  Email: string | null;
  CourierID: number | null;
  CountryFromID: number | null;
  TrackingNumber: string | null;
  ExpectedDateTime: string | null;
  AddressID: number | null;
  ContactPhone: string | null;
  ReceivingInstructions: string | null;
  Notes: string | null;
  NoofPackages: number;
  PackageCategory: string | null;
  Quotes: string | null;
  POId: number | null;
  LotCategoryId: number | null;
}

export interface LotDetails {
  DeviceId: number | null;
  ISELotNumber: string | null;
  CustomerLotNumber: string | null;
  CustomerCount: number | null;
  DeviceTypeID: number | null;
  DateCode: string | null;
  COO: number | null;
  Expedite: number | null;
  IQA: number | null;
  LotOwnerID: number | null;
  LotCategoryId: number | null;
}

export interface TrayDetails {
  Id: number | null;
  TrayVendorId: number | null;
  TrayPartId: number | null;
  Qty: number | null;
}

export interface HardwareDetails {
  Id: string | null;
  HardwareTypeId: number | null;
  ProjectDevice: string | null;
  HardwareId: string | null;
}

export interface OtherDetails {
  Id: number | null;
  Type: string | null;
  Details: string | null;
  Qty: number | null;
}


export const INIT_RECEIPT: ReceiptJson = {
  
    ReceiptDetails: {
      IsInterim: false,
      CustomerTypeID: null,
      CustomerVendorID: null,
      BehalfID: null,
      RecipientId: null,
      SendorId: null,
      ReceivingFacilityID: null,
      DeliveryMethodID: null,
      ContactPerson: '',
      Email: '',
      CourierID: null,
      CountryFromID: null,
      TrackingNumber: '',
      ExpectedDateTime: '',
      AddressID: null,
      ContactPhone: '',
      ReceivingInstructions: '',
      Notes: '',
      NoofPackages: 0,
      PackageCategory: '',
      Quotes: '',
      POId: null,
      LotCategoryId: null,
      },
      LotDetails: {
        DeviceId: null,
        ISELotNumber: '',
        CustomerLotNumber: '',
        CustomerCount: null,
        DeviceTypeID: null,
        DateCode: '',
        COO: null,
        Expedite: null,
        IQA: null,
        LotOwnerID: null,
        LotCategoryId: null
      },
      TrayDetails: {
        Id: null,
        TrayVendorId: null,
        TrayPartId: null,
        Qty: null
      },
      HardwareDetails: {
        Id: null,
        HardwareTypeId: null,
        ProjectDevice: '',
        HardwareId: ''
      },
      OtherDetails: {
        Id: null,
        Type: null,
        Details: '',
        Qty: null
      }
};

export interface MailAttachment {
  attachmentId: number,
  objectID: number,
  section: string,
  attachmentName: string,
  path: string,
  active: boolean,
  createdBY:string,
  createdON:Date
}
export interface MailAttachmentDto {
  attachmentId: number,
  attachmentName: string,
  path: string,
  active: boolean,
}
import { cartIcon, clipboardTextIcon, closedCaptionsIcon, crosstabIcon, editToolsIcon, exportIcon, eyeIcon, eyeSlashIcon, gearIcon, jsIcon, kpiStatusHoldIcon, logoutIcon, menuIcon, moreVerticalIcon, pencilIcon, printIcon, selectBoxIcon, userIcon, windowRestoreIcon, xIcon } from "@progress/kendo-svg-icons";

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
export interface MasterData {
  customerType: CustomerType[]
  receiptLocation: ReceiptLocation[]
  goodsType: GoodsType[]
  deliveryMode: DeliveryMode[]
  customer: Customer[]  // remove this in next version
  entityMap: EntityMap;
  addresses: Address[]
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
  miscellaneousGoodsID: number;
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
  active: false,
  recordStatus: 'I'
}
export const INIT_MISCELLANEOUS_GOODS: MiscellaneousGoods = {
  miscellaneousGoodsID: 0,
  receiptID: 0,
  inventoryID: 0,
  customerVendorID: 0,
  customerVendor: '',
  serialNumber: '',
  additionalInfo: '',
  createdOn: '',
  modifiedOn: '',
  active: false,
  recordStatus: 'I'
}
export interface DeviceItem {
  deviceID: number;
  receiptID: number;
  iseLotNumber: string;
  customerLotNumber: string;
  expedite: boolean;
  customerCount: string;
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
  iqa: string
}
export const INIT_DEVICE_ITEM: DeviceItem = {
  deviceID: 0,
  receiptID: 0,
  iseLotNumber: '',
  customerLotNumber: '',
  expedite: false,
  customerCount: '',
  labelCount: 0,
  coo: '',
  dateCode: 0,
  isHold: false,
  holdComments: null,
  createdOn: new Date().toISOString(), // Set to current time
  modifiedOn: new Date().toISOString(), // Set to current time
  active: true,
  lotOwner: '',
  iqa: '',
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
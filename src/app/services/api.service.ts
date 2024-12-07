import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CustomerOrder, OrderRequest } from 'src/app/services/app.interface';
import { Observable } from 'rxjs';
const API = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) { }

  login(body: any) {
    return this.httpClient.post(`${API}v1/ise/inventory/login`, body);
  }
  getMasterData() {
    return this.httpClient.get(`${API}v1/ise/inventory/masterdata`);
  }
  getReceiptdata(fromDate?: Date | null, toDate?: Date | null) {
    let params = new HttpParams();
    if (fromDate) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate) {
      params = params.set('toDate', this.formatDate(toDate));
    }
    return this.httpClient.get(`${API}v1/ise/inventory/receiptdata`, { params });
  }
  getDeviceData(receiptId: string) {
    return this.httpClient.get(`${API}v1/ise/inventory/devicedata?receiptId=${receiptId}`);
  }
  getHardwaredata(receiptId: string) {
    return this.httpClient.get(`${API}v1/ise/inventory/hardwaredata?receiptId=${receiptId}`);
  }
  getMiscellaneousGoods(receiptId: string) {
    return this.httpClient.get(`${API}v1/ise/inventory/miscellaneousGoods?receiptId=${receiptId}`);
  }
  getReceiptEmployees(receiptId: string) {
    return this.httpClient.get(`${API}v1/ise/inventory/receiptEmployee?receiptId=${receiptId}`);
  }
  getHardwareTypes() {
    return this.httpClient.get(`${API}v1/ise/inventory/hardwareType`);
  }
  postProcessReceipt(body: unknown) {
    return this.httpClient.post(`${API}v1/ise/inventory/processReceipt`, body);
  }
  postProcessDevice(body: unknown) {
    return this.httpClient.post(`${API}v1/ise/inventory/processDevice`, body);
  }
  postProcessHardware(body: unknown) {
    return this.httpClient.post(`${API}v1/ise/inventory/processHardware`, body);
  }
  postProcessMiscellaneous(body: unknown) {
    return this.httpClient.post(`${API}v1/ise/inventory/processMiscellaneousGoods`, body);
  }
  postProcessShipment(body: unknown) {
    return this.httpClient.post(`${API}v1/ise/shipment/processShipment`, body);
  }
  voidReceipt(receiptID: number, isActive: boolean) {
    return this.httpClient.post(`${API}v1/ise/inventory/voidReceipt?receiptID=${receiptID}`, {});
  }

  // Receipt
  getDevicesByCustomer(customerId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/deviceTypeByCustomer?customerId=${customerId}`);
  }
  getEntitiesName(entityType: string) {
    return this.httpClient.get(`${API}v1/ise/inventory/entity/${entityType}`);
  }
  getAddresses() {
    return this.httpClient.get(`${API}v1/ise/inventory/address`);
  }
  generateLineItem() {
    return this.httpClient.get(`${API}v1/ise/inventory/lineItem`);
  }

  // Shipping
  getShippingData(fromDate?: Date | null, toDate?: Date | null) {
    let params = new HttpParams();
    if (fromDate) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate) {
      params = params.set('toDate', this.formatDate(toDate));
    }
    return this.httpClient.get(`${API}v1/ise/shipment/shipmentdata`, { params });
  }
  getShipmentCategories() {
    return this.httpClient.get(`${API}v1/ise/shipment/shipmentcategory`);
  }
  getShipmentTypes() {
    return this.httpClient.get(`${API}v1/ise/shipment/shipmenttypes`);
  }
  getShipmentDetails(customerID: number) {
    return this.httpClient.get(`${API}v1/ise/shipment/shipment-details?customerID=${customerID}`);
  }
  getInventoryLocations() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryMove/getInventoryLocation`);
  }
  getShipmentInventories(customerID: number) {
    return this.httpClient.get(`${API}v1/ise/shipment/shipmentInventory?customerID=${customerID}`);
  }
  getShipmentLineItems(shipmentID: number) {
    return this.httpClient.get(`${API}v1/ise/shipment/shipmentLineItem?shipmentID=${shipmentID}`);
  }
  // Customer Orders
  getInventory(customerId: number | null, goodsType: string, lotNumber: string, customerordType: string) {
    const params = new URLSearchParams();

    // Add each parameter only if it has a value
    if (goodsType) {
      params.append("goodsType", goodsType);
    }
    if (lotNumber) {
      params.append("lotNumber", lotNumber);
    }
    if (customerordType) {
      params.append("customerOrderType", customerordType);
    }
    if (customerId !== null && customerId !== undefined) {
      params.append("customerId", customerId.toString());
    }

    const url = `${API}v1/ise/inventory/customerorder/inventory?${params.toString()}`;
    return this.httpClient.get(url);
  }

  processCustomerOrder(payload: OrderRequest) {
    const body = {
      LoginId: 1,
      InputJSON: JSON.stringify(payload)
    };
    return this.httpClient.post(`${API}v1/ise/inventory/customerorder/addcustomerorder`, body);

  }

  getallCustomerOrder() {
    //v1/ise/inventory/customer/getallorder
    return this.httpClient.get(`${API}v1/ise/inventory/customerorder/all`);

  }

  // Customer Orders
  viewEditCustomerOrder(customerOrderID: string, editdata: boolean) {
    const url = `${API}v1/ise/inventory/customerorder/vieweditorder?customerOrderID=${customerOrderID}&editdata=${editdata}`;
    return this.httpClient.get(url);
  }
  //api/v1/ise/inventory/inventorydata/getdetails
  getinventorydata(customerVendorID?: number, fromDate?: Date, toDate?: Date) {

    let params = new HttpParams();


    if (customerVendorID != null) {
      params = params.set('customerVendorID', customerVendorID.toString());
    }
    if (fromDate != null) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate != null) {
      params = params.set('toDate', this.formatDate(toDate));
    }

    // API call with only the non-null params
    return this.httpClient.get(`${API}v1/ise/inventory/inventorydata/getdetails`, { params });
  }
  getallinventorydata() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventorydata/getdetails`);
  }
  getallLotsdata() {
    return this.httpClient.get(`${API}v1/ise/inventory/customerorder/invlotnums`);
  }

  getallinventoryreportdata(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${API}v1/ise/inventory/report/getallreport`);
  }
  getinventoryreportdata(customerTypeID?: number, customerVendorID?: number, goodsType?: string, lotNumber?: string, fromDate?: Date, toDate?: Date): Observable<any[]> {

    let params = new HttpParams();

    if (customerTypeID != null) {
      params = params.set('customerTypeID', customerTypeID.toString());
    }
    if (customerVendorID != null) {
      params = params.set('customerVendorID', customerVendorID.toString());
    }
    if (goodsType != null) {
      params = params.set('goodsType', goodsType);
    }
    if (lotNumber != null) {
      params = params.set('lotNumber', lotNumber);
    }
    if (fromDate != null) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate != null) {
      params = params.set('toDate', this.formatDate(toDate));
    }

    return this.httpClient.get<any[]>(`${API}v1/ise/inventory/report/getallreport`, { params });
  }
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  //Inventory Move
  getAllInventoryMoveStatus() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryMove/getallInventoryMoveStatus`);
  }

  GetInventoryLocation() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryMove/getInventoryLocation`);
  }

  getInventoryMove(lotNumber: string, location: number, employeeIds: number[]) {
    const employeeIdsParam = employeeIds.map(String).join(','); // Convert number[] to string[] and join with commas
    const url = `${API}v1/ise/inventory/inventoryMove/getInventoryMoveStatus?lotNumber=${lotNumber}&location=${location}&employeeIds=${employeeIdsParam}`;
    return this.httpClient.get(url);
  }

  upsertInventoryMoveStatus(data: any, options: { responseType: 'text' }): Observable<any> {
    return this.httpClient.post(`${API}v1/ise/inventory/inventoryMove/UpsertInventoryMoveStatus`, data, { responseType: options.responseType });
  }

  //CombinedLots
  SearchCombinationLots() {
    return this.httpClient.get(`${API}v1/ise/inventory/combinedlot/search`);
  }
  SearchCombinationLotswithDates(fromDate?: Date, toDate?: Date) {
    let params = new HttpParams();

    if (fromDate != null) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate != null) {
      params = params.set('toDate', this.formatDate(toDate));
    }
    return this.httpClient.get(`${API}v1/ise/inventory/combinedlot/search`, { params });
  }
  SearchComblotsWithCust_Lot(customerId?: number | null, lotNumber?: string) {
    let params = new HttpParams();
    if (customerId != null) {
      params = params.set('customerId', customerId);
    }
    if (lotNumber) {
      params.append("lotNumber", lotNumber);
    }
    return this.httpClient.get(`${API}v1/ise/inventory/combinedlot/customer`, { params });
  }
  postCombineLots(payload: any): Observable<any> {

    return this.httpClient.post(`${API}v1/ise/inventory/combinedlot/upinsertcombolot`, payload);
  }

  getViewEditComblotsWithId(comboLotId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${API}v1/ise/inventory/combinedlot/vieweditcombolots?comboLotId=${comboLotId}`);
  }


  //Inventory Hold
  getHoldCodes(inventoryId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${API}v1/ise/inventory/inventoryHold/getHold?inventoryId=${inventoryId}`);
  }
  getAllHolds(inventoryId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getAllHolds?inventoryId=${inventoryId}`);
  }
  upsertInventoryHold(request: any, options: { responseType: 'text' }): Observable<any> {
    return this.httpClient.post(`${API}v1/ise/inventory/inventoryHold/UpsertHold`, request, options);
  }
  getHoldDetails(inventoryId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getHoldDetails?inventoryId=${inventoryId}`);
  }

  getOtherShippingData(customerId: number | null, employeeId: number | null, statusId: number | null, fromDate: Date | null, toDate: Date | null) {
    const url = `${API}v1/ise/otherinventory/getOtherInventoryShipments?customerId=${customerId}&employeeId=${employeeId}&statusId=${statusId}&fromDate=${fromDate?.toDateString()}&toDate=${toDate?.toDateString()}`;
    return this.httpClient.get(url);
  }
  getOtherInventoryStatuses() {
    debugger;
    const url = `${API}v1/ise/otherinventory/getOtherInventoryStatus`;
    return this.httpClient.get(url);
  }
  getOtherInventoryShipment(otherInventoryId: number) {
    debugger;
    const url = `${API}v1/ise/otherinventory/getOtherInventoryShipment?otherInventoryId=${otherInventoryId}`;
    return this.httpClient.get(url);
  }
}

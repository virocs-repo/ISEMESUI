import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
  getReceiptdataForReceiptStatus(receiptStatus?: string | null){
    let params = new HttpParams();
    if (receiptStatus) {
      params = params.set('receiptStatus', receiptStatus);
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
  createShipment(body: unknown) {
    return this.httpClient.post(`${API}v1/ise/shipment/create-shipment`, body);
  }
  voidReceipt(receiptID: number, isActive: boolean) {
    return this.httpClient.post(`${API}v1/ise/inventory/voidReceipt?receiptID=${receiptID}`, {});
  }

  // Receipt
  getDevicesByCustomer(customerId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/deviceTypeByCustomer?customerId=${customerId}`);
  }
  getDevicesByCustomerall() {
    return this.httpClient.get(`${API}v1/ise/inventory/deviceTypeByCustomer`);
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

  uploadFile(file: File, inputFilename: string, receiptNumber: string, loginId: number) {
    const formData = new FormData();
    formData.append('file', file);
    // formData.append('inputfilename', inputFilename);
    // formData.append('reciptnumber', receiptNumber);
    const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data', 'Accept': '*/*' });
    return this.httpClient.post(`${API}v1/ise/inventory/upload?loginId=${loginId}&receiptId=${receiptNumber}`, formData);
  }
  downloadFile(fileName: string) {
    return this.httpClient.get(`${API}v1/ise/inventory/download/${fileName}`);
  }
  listFiles(receiptId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/receipt-attachments?receiptId=${receiptId}`);
  }
  deleteFile(body: any) {
    return this.httpClient.delete(`${API}v1/ise/inventory/delete-attachment`, { body });
  }
  postInterim(body: any) {
    return this.httpClient.post(`${API}v1/ise/inventory/processInterimDevice`, body);
  }
  listInterimLots() {
    return this.httpClient.get(`${API}v1/ise/inventory/getInterimLots`);
  }
  listInterimDevices(receiptId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/getInterimDeviceData?interimReceiptID=${receiptId}`);
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
  /*  getallLotsdata() {
     return this.httpClient.get(`${API}v1/ise/inventory/customerorder/invlotnums`);
   } */
  getallLotsdata(customerId?: number) {
    let params = new HttpParams();
    if (customerId) {
      params = params.set('customerId', customerId.toString());
    }

    return this.httpClient.get(`${API}v1/ise/inventory/customerorder/invlotnums`, { params });
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
  //Inventory CheckInCheckOut
  getAllInventoryCheckinCheckoutStatus() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryCheckinCheckout/getallInventoryCheckinCheckoutStatus`);
  }

  GetInventoryCheckinCheckoutLocation() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryCheckinCheckout/getInventoryCheckinCheckoutLocation`);
  }

  getInventoryCheckinCheckout(lotNumber: string) {
    const url = `${API}v1/ise/inventory/inventoryCheckinCheckout/getInventoryCheckinCheckoutStatus?lotNumber=${lotNumber}`;
    return this.httpClient.get(url);
  }

  upsertInventoryCheckinCheckoutStatus(data: any, options: { responseType: 'text' }): Observable<any> {
    return this.httpClient.post(`${API}v1/ise/inventory/inventoryCheckinCheckout/UpsertInventoryCheckinCheckoutStatus`, data, { responseType: options.responseType });
  }

  getInventoryCheckinCheckoutLocations() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryCheckinCheckout/getInventoryCheckinCheckoutLocation`);
  }
  getLotStatus(lotNumber: string) {
    const url = `${API}v1/ise/inventory/inventoryCheckinCheckout/getCheckinCheckoutStatus?lotNumber=${lotNumber}`;
    return this.httpClient.get(url);
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
      params = params.set('lotNumber', lotNumber);
    }
    return this.httpClient.get(`${API}v1/ise/inventory/combinedlot/customer`, { params });
  }
  postCombineLots(payload: any): Observable<any> {

    return this.httpClient.post(`${API}v1/ise/inventory/combinedlot/upinsertcombolot`, payload);
  }

  getViewEditComblotsWithId(comboLotId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${API}v1/ise/inventory/combinedlot/vieweditcombolots?comboLotId=${comboLotId}`);
  }
  //invnmove
  SearchInventoryMove() {
    return this.httpClient.get(`${API}v1/ise/inventory/move/search`);
  }

  SearchInventoryMovewithDates(fromDate?: Date, toDate?: Date) {
    let params = new HttpParams();

    if (fromDate != null) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate != null) {
      params = params.set('toDate', this.formatDate(toDate));
    }
    return this.httpClient.get(`${API}v1/ise/inventory/move/search`, { params });
  }

  SearchInventoryMovewith_Lot(lotNumber?: string) {
    let params = new HttpParams();
    if (lotNumber) {
      params = params.set('lotNumber', lotNumber);
    }
    return this.httpClient.get(`${API}v1/ise/inventory/move/lotinfo`, { params });
  }
  SearchInventoryMovewith_Facilty(facilityId: any) {
    let params = new HttpParams();
    if (facilityId) {
      params = params.set('facilityId', facilityId);
    }
    return this.httpClient.get(`${API}v1/ise/inventory/move/facility`, { params });
  }

  postInventoryMovewith_Facilty(invId: number, area_FacilityId: number | null, receivingFacilityID: number) {
    let url = `${API}v1/ise/inventory/move?inventoryId=${invId}&facilityId=${receivingFacilityID}`;
    
    if (area_FacilityId !== null && area_FacilityId !== undefined) {
      url += `&areaFacilityId=${area_FacilityId}`;
    }
  
    return this.httpClient.post(url, null);
  }
  


  //Inventory Hold
  getAllSearchHold() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getAllSearchHold`);
  }
  getHoldType(inventoryId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${API}v1/ise/inventory/inventoryHold/getHoldType?inventoryId=${inventoryId}`);
  }
  getHoldCodes(inventoryId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${API}v1/ise/inventory/inventoryHold/getHold?inventoryId=${inventoryId}`);
  }
  getAllHolds(inventoryId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getAllHolds?inventoryId=${inventoryId}`);
  }
  upsertInventoryHold(request: any, options: { responseType: 'text' }): Observable<any> {
    return this.httpClient.post(`${API}v1/ise/inventory/inventoryHold/UpsertHold`, request, options);
  }
  getHoldDetails(inventoryXHoldId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getHoldDetails?inventoryXHoldId=${inventoryXHoldId}`);
  }
  getHoldComments() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getHoldComments`);
  }
  getCustomerDetails(inventoryID: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getCustomerDetails?inventoryID=${inventoryID}`);
  }


  getOtherShippingData(customerId: number | null, employeeId: number | null, statusId: number | null, fromDate: Date | null, toDate: Date | null) {
    const url = `${API}v1/ise/otherinventory/getOtherInventoryShipments?customerId=${customerId}&employeeId=${employeeId}&statusId=${statusId}&fromDate=${fromDate?.toDateString()}&toDate=${toDate?.toDateString()}`;
    return this.httpClient.get(url);
  }

  getOtherInventoryStatuses() {
    const url = `${API}v1/ise/otherinventory/getOtherInventoryStatus`;
    return this.httpClient.get(url);
  }

  getOtherInventoryShipment(anotherShippingId: number) {
    const url = `${API}v1/ise/otherinventory/getOtherInventoryShipment?anotherShippingId=${anotherShippingId}`;
    return this.httpClient.get(url);
  }

  getServiceTypes() {
    const url = `${API}v1/ise/otherinventory/getServiceTypes`;
    return this.httpClient.get(url);
  }

  upsertAntherShipment(inputJson: string) {
    const url = `${API}v1/ise/otherinventory/upsertAntherInventoryShipment?anotherShipJson=${inputJson}`;
    return this.httpClient.get(url);
  }

  voidAnotherShipping(anotherShippingID: number) {
    const url = `${API}v1/ise/otherinventory/voidAnotherShipping?anotherShippingID=${anotherShippingID}`;
    return this.httpClient.get(url);
  }

  getOtherInventoryLots(customerTypeId: number, customerVendorId: number) {
    const url = `${API}v1/ise/otherinventory/getAnotherInventoryLots?customerTypeId=${customerTypeId}&customerVendorId=${customerVendorId}`;
    return this.httpClient.get(url);
  }

  //customer order with dates

  getallCustomerOrderwithDates(fromDate?: Date, toDate?: Date) {
    //v1/ise/inventory/customer/getallorder

    let params = new HttpParams();

    if (fromDate != null) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate != null) {
      params = params.set('toDate', this.formatDate(toDate));
    }
    return this.httpClient.get(`${API}v1/ise/inventory/customerorder/all`, { params });

  }

  //IntransferRecieve
  SearchIntransferRecieve() {
    return this.httpClient.get(`${API}v1/ise/inventory/inttransfer/search`);
  }

  SearchIntransferRecievewithDates(fromDate?: Date, toDate?: Date) {
    let params = new HttpParams();

    if (fromDate != null) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate != null) {
      params = params.set('toDate', this.formatDate(toDate));
    }
    return this.httpClient.get(`${API}v1/ise/inventory/inttransfer/search`, { params });
  }
  getIntransferRecieveStatus(statusString?: string | null){
    let params = new HttpParams();
    if (statusString) {
      params = params.set('statusString', statusString);
    }  
    return this.httpClient.get(`${API}v1/ise/inventory/inttransfer/search`, { params });
  }
  getIntransferRecieveFacility(facilityId?: number | null ){
    let params = new HttpParams();
    if (facilityId) {
      params = params.set('facilityId', facilityId);
    }  
    return this.httpClient.get(`${API}v1/ise/inventory/inttransfer/search`, { params });
  }

  getallIntransferRecieveLotsdata(customerId?: number) {
    let params = new HttpParams();
    if (customerId) {
      params = params.set('customerVendorID', customerId.toString());
      params = params.set('customerTypeID', '1');
    }

    return this.httpClient.get(`${API}v1/ise/inventory/inttransfer/GetcustTransferLots`, { params });
  }

  saveInternalTransferReceipt(data: any): Observable<any> {
    return this.httpClient.post(`${API}v1/ise/inventory/inttransfer/UpsertIntTransReceipt`, data);
  }


  // addshippinginvcentory
  getAddShippingInventory(customerId: number | null, deviceId: number | null, locationId: number | null, receivedFromId: number | null, lotNumber: string | null, shipCategoryID: number | null) {
    const params = new URLSearchParams();

    // Add each parameter only if it has a value

    if (customerId !== null && customerId !== undefined) {
      params.append("customerId", customerId.toString());
    }

    if (deviceId !== null && deviceId !== undefined) {
      params.append("deviceId", deviceId.toString());
    }
    if (locationId !== null && locationId !== undefined) {
      params.append("locationId", locationId.toString());
    }
    if (receivedFromId !== null && receivedFromId !== undefined) {
      params.append("receivedFromId", receivedFromId.toString());
    }
    if (lotNumber !== null && lotNumber !== undefined) {
      params.append("lotNumber", lotNumber);
    }
    if (shipCategoryID !== null && shipCategoryID !== undefined) {
      params.append("shipmentCategoryID", shipCategoryID.toString());
    }
    const url = `${API}v1/ise/inventory/inventorydata/GetShipmentInventory?${params.toString()}`;
    return this.httpClient.get(url);
  }

  saveAddShipmentRecord(data: any): Observable<any> {
    return this.httpClient.post(`${API}v1/ise/inventory/inventorydata/add-ship-record`, data);
  }

  getShipmentdeliveryInfo(deliveryInfoId: number) {
    const url = `${API}v1/ise/inventory/inventorydata/GetShipdeliveryInfo?deliveryInfoId=${deliveryInfoId}`;
    return this.httpClient.get(url);
  }

  getInvUserByRole(filterKey:string, isActive:number, condition:string|null) {
    return this.httpClient.get(`${API}v1/ise/inventory/getInvUserByRole?filterKey=${filterKey}&isActive=${isActive}&condition=${condition}`);
  }
  getDeviceDetailsById(invId:number){
    return this.httpClient.get(`${API}v1/ise/inventory/getdetailsByInventoryID?inventoryID=${invId}`)
  }
  canUndoReceive(inventoryId:number){
    return this.httpClient.get(`${API}v1/ise/inventory/canUndoReceiveLot?inventoryId=${inventoryId}`)
  }
  checkingIsReceiptEditable(receiptId:number, loginId: number){
    return this.httpClient.get(`${API}v1/ise/inventory/isReceiptEditable?receiptId=${receiptId}&loginId=${loginId}`)
  }
}

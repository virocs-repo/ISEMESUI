import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CustomerOrder, OrderRequest,MailInfoRequest } from 'src/app/services/app.interface';
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
  getSearchMailRoomReceiptData(
    mailID?: string | null, customer?: number | null, deviceFamily?: number | null, device?: number | null,
    deliveryMethodID?: number | null, statusID?: string | null, trackingNo?: string | null,
    locationID?: number | null, fromDate?: Date | null, toDate?: Date | null, iseLot?: string | null,
    customerLotsstr?: string | null, receivingInfoID?: string | null, receiptID?: number | null,
    receiptStatus?: string | null, facilityIDStr?: string | null
  ) {
    let params = new HttpParams();
  
    if (mailID) params = params.set('mailID', mailID);
    if (customer !== null && customer !== undefined) params = params.set('customer', customer.toString());
    if (deviceFamily !== null && deviceFamily !== undefined) params = params.set('deviceFamily', deviceFamily.toString());
    if (device !== null && device !== undefined) params = params.set('device', device.toString());
    if (deliveryMethodID !== null && deliveryMethodID !== undefined) params = params.set('deliveryMethodID', deliveryMethodID.toString());
    if (statusID) params = params.set('statusID', statusID);
    if (trackingNo) params = params.set('trackingNo', trackingNo);
    if (locationID !== null && locationID !== undefined) params = params.set('locationID', locationID.toString());
    if (fromDate) params = params.set('fromDate', this.formatDate(fromDate));
    if (toDate) params = params.set('toDate', this.formatDate(toDate));
    if (iseLot) params = params.set('iseLot', iseLot);
    if (customerLotsstr) params = params.set('customerLotsstr', customerLotsstr);
    if (receivingInfoID) params = params.set('receivingInfoID', receivingInfoID);
    if (receiptID !== null && receiptID !== undefined) params = params.set('receiptID', receiptID.toString());
    if (receiptStatus) params = params.set('receiptStatus', receiptStatus);
    if (facilityIDStr) params = params.set('facilityIDStr', facilityIDStr);
  
    return this.httpClient.get(`${API}v1/ise/inventory/getSearchMailRoomReceiptData`, { params });
  }
  
  getReceiptdatas(facilityIDStr?: string | null, receiptStatus?: string | null, fromDate?: Date | null, toDate?: Date | null) {
    let params = new HttpParams();

    if (facilityIDStr) {
        params = params.set('facilityIDStr', facilityIDStr);
    }
    if (receiptStatus) {
        params = params.set('receiptStatus', receiptStatus);
    }
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
  createShipment(body: unknown) {
    return this.httpClient.post(`${API}v1/ise/shipment/create-shipment`, body);
  }
  voidReceipt(receiptID: number, isActive: boolean) {
    return this.httpClient.post(`${API}v1/ise/inventory/voidReceipt?receiptID=${receiptID}`, {});
  }
  //Receiver Form (Internal)

  getReceiverFormInternal(receivingInfoNum?: string | null,customerId?: number,deviceFamilyId?: number,device?: string | null,customerLotsStr?: string | null,statusId?: string| null,isExpected?: boolean, isElot?: string | null,serviceCategoryId?: number,locationId?: string | null,mail?: string | null, fromDate?: Date | null, toDate?: Date | null) {
    let params = new HttpParams();

    if (receivingInfoNum) {
      params = params.set('receivingInfoId', receivingInfoNum);
    }
    if (customerId) {
        params = params.set('customerId', customerId);
    }
    if (deviceFamilyId) {
        params = params.set('deviceFamilyId', deviceFamilyId);
    }
    if (device) {
      params = params.set('deviceId', device);
    }
    if (customerLotsStr) {
        params = params.set('customerLotsStr', customerLotsStr);
    }
    if (statusId) {
        params = params.set('statusId', statusId);
    }
    if (isExpected) {
        params = params.set('isExpected', isExpected);
    }
    if (isElot) {
      params = params.set('isElot', isElot);
    }
    if (serviceCategoryId) {
        params = params.set('serviceCategoryId', serviceCategoryId);
    }
    if (locationId) {
        params = params.set('locationId', locationId);
    }
    if (mail) {
        params = params.set('mail', mail);
    }
    if (fromDate) {
        params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate) {
        params = params.set('toDate', this.formatDate(toDate));
    }
    return this.httpClient.get(`${API}v1/ise/inventory/GetReceiverFormInternal`, { params });
  }
  DeviceFamilies(customerId: number){
    return this.httpClient.get(`${API}v1/ise/inventory/getDeviceFamilies?customerId=${customerId}`);
  }

  ReceiverStatus(){
    return this.httpClient.get(`${API}v1/ise/inventory/getInventoryReceiptStatuses`);
  }

  ServiceCategory(listName: string){
    return this.httpClient.get(`${API}v1/ise/inventory/getInventoryReceiptServiceCategory?listName=${listName}`);
  }

  LotOwners(){
    return this.httpClient.get(`${API}v1/ise/inventory/getInventoryReceiptLotOwners`);
  }
  TrayVendor(customerId: number){
    return this.httpClient.get(`${API}v1/ise/inventory/getInventoryReceiptTrayVendor?customerId=${customerId}`);
  }
  TrayPart(customerId: number,vendorId: number){
    return this.httpClient.get(`${API}v1/ise/inventory/getInventoryReceiptTraysByVendorId?customerId=${customerId}&vendorId=${vendorId}`);
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
  getPackageCategoryList(categoryName: string) {
    return this.httpClient.get(`${API}v1/ise/inventory/GetPackageCategoryList`, {
        params: { categoryName }
    });
}

  getAddresses() {
    return this.httpClient.get(`${API}v1/ise/inventory/address`);
  }
  generateLineItem() {
    return this.httpClient.get(`${API}v1/ise/inventory/lineItem`);
  }
  uploadFiles(file: File, inputFilename: string, inventoryId: string, loginId: number) {
    const formData = new FormData();
    formData.append('file', file);
    // formData.append('inputfilename', inputFilename);
    // formData.append('reciptnumber', receiptNumber);
    const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data', 'Accept': '*/*' });
    return this.httpClient.post(`${API}v1/ise/inventory/upload?loginId=${loginId}&receiptId=${inventoryId}`, formData);
  }
  uploadFile(file: File, inputFilename: string, receiptNumber: string, loginId: number) {
    const formData = new FormData();
    formData.append('file', file);
    // formData.append('inputfilename', inputFilename);
    // formData.append('reciptnumber', receiptNumber);
    const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data', 'Accept': '*/*' });
    return this.httpClient.post(`${API}v1/ise/inventory/upload?loginId=${loginId}&receiptId=${receiptNumber}`, formData);
  }
  uploadFileById(file: File, inputFilename: string, Id: string, loginId: number,categoryname: string) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data', 'Accept': '*/*' });
    return this.httpClient.post(`${API}v1/ise/inventory/uploadById?loginId=${loginId}&id=${Id}&categoryName=${categoryname}`, formData);
  }
  uploadFileByIds(file: File, inputFilename: string, Id: number, loginId: number,categoryname: string) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders({ 'Content-Type': 'multipart/form-data', 'Accept': '*/*' });
    return this.httpClient.post(`${API}v1/ise/inventory/uploadById?loginId=${loginId}&id=${Id}&categoryName=${categoryname}`, formData);
  }
  downloadFile(fileName: string) {
    return this.httpClient.get(`${API}v1/ise/inventory/download/${fileName}`);
  }
  listFiles(receiptId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/receipt-attachments?receiptId=${receiptId}`);
  }
  listFilesById(id: number,categoryname: string) {
    return this.httpClient.get(`${API}v1/ise/inventory/get-attachmentslist?id=${id}&categoryName=${categoryname}`);
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
  getAllInventoryCheckinCheckoutStatusWithDates(fromDate?: Date, toDate?: Date) {
    let params = new HttpParams();

    if (fromDate != null) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate != null) {
      params = params.set('toDate', this.formatDate(toDate));
    }
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryCheckinCheckout/getallInventoryCheckinCheckoutStatus`, { params });
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
  getAllSearchHoldBasedOnDate(fromDate?: Date | null, toDate?: Date | null)
  {
    let params = new HttpParams();
    if (fromDate != null) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate != null) {
      params = params.set('toDate', this.formatDate(toDate));
    }
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getAllSearchHold`, { params });
  }
  getHoldType(inventoryId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${API}v1/ise/inventory/inventoryHold/getHoldType?inventoryId=${inventoryId}`);
  }
  getHoldCodes(inventoryId: number,holdTypeId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${API}v1/ise/inventory/inventoryHold/getHold?inventoryId=${inventoryId}&holdTypeId=${holdTypeId}`);
  }
  getAllHolds(inventoryId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getAllHolds?inventoryId=${inventoryId}`);
  }
  upsertInventoryHold(request: any,options: { responseType: 'text' },files?: File[]): Observable<any> {
    const formData = new FormData();
    if(files)
    {
      files.forEach(file => formData.append('files', file));
    }
    formData.append('input', JSON.stringify(request));
    return this.httpClient.post(`${API}v1/ise/inventory/inventoryHold/UpsertHold`, formData, options);
  }
  getHoldDetails(inventoryXHoldId: number) {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getHoldDetails?inventoryXHoldId=${inventoryXHoldId}`);
  }
  getHoldComments() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryHold/getHoldComments`);
  }
  getOperaterAttachments(TFSHoldId:number){
    return this.httpClient.get<any[]>(`${API}v1/ise/inventory/inventoryHold/getOperaterAttachments?TFSHoldId=${TFSHoldId}`);
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
    const body = {
      LoginId: 1,
      InputJSON: inputJson
    };
    return this.httpClient.post(`${API}v1/ise/otherinventory/upsertAntherInventoryShipment`, body,{headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })});
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
  SearchIntTransferRecieving(fromDate?: Date | null, toDate?: Date | null, statusString?: string | null, facilityId?: string | null)
  {
    
    let params = new HttpParams();
    if (fromDate != null) {
      params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate != null) {
      params = params.set('toDate', this.formatDate(toDate));
    }
    if (statusString != null){
      params = params.set('statusString', statusString);
    }
    if (facilityId != null){
      params = params.set('facilityId', facilityId);
    }
    return this.httpClient.get(`${API}v1/ise/inventory/inttransfer/Search`, { params });
  }
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
  fetchpackageDimensions()
  {
    return this.httpClient.get(`${API}v1/ise/inventory/inventorydata/GetPackageDimension`)
  }
  fetchpackageByShipmentId(shipmentNumber:number)
  {
    return this.httpClient.get(`${API}v1/ise/inventory/inventorydata/PackageShipmentdataById?shipmentId=${shipmentNumber}`)
  }


  saveShipmentpackagesRecord(data: any): Observable<any> {
    return this.httpClient.post(`${API}v1/ise/inventory/inventorydata/UpsertShipPackDim`, data);
  }

  searchTickets(fromDate: Date | null, toDate: Date | null) {
    const url = `${API}v1/ise/inventory/ticket/searchTickets?fromDate=${fromDate?.toDateString()}&toDate=${toDate?.toDateString()}`;
    return this.httpClient.get(url);
  }

  getTicketTypes() {
    const url = `${API}v1/ise/inventory/ticket/getTicketType`;
    return this.httpClient.get(url);
  }
  getTicketLots() {
    const url = `${API}v1/ise/inventory/ticket/getTicketLots`;
    return this.httpClient.get(url);
  }
  getTicketLotLineItems(lotNumbers:string) {
    const url = `${API}v1/ise/inventory/ticket/getTicketLineItemLots?lotNumbers=${lotNumbers}`;
    return this.httpClient.get(url);
  }
 upsertTicket(files: File[], inputJson: string, ticketAttachments: string, attachmentType:string, tktId: number|null) {
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]); // 'files' is the key name for the file field
  }
  
  formData.append('upsertJson', inputJson);
  if (ticketAttachments !== '') {
    formData.append('ticketAttachments', ticketAttachments);
  }
  if (attachmentType !== '') {
    formData.append('attachmentType', attachmentType);
  }
  if (tktId !== null) {
    formData.append('tktId', tktId.toString());
  }

  const headers = new HttpHeaders({ 'Accept': '*/*' });
  return this.httpClient.post(`${API}v1/ise/inventory/ticket/upsertTicket`, formData, { headers });
}
  getMasterListItems(listName:string, serviceId:number|null) {
    let url = `${API}v1/ise/inventory/customerorder/getMasterListItems?listName=${listName}`;
  if (serviceId !== null) {
    url += `&serviceId=${serviceId}`;
  }
    return this.httpClient.get(url);
  }
  getListItems(listName:string, parentId:number|null) {
    let url = `${API}v1/ise/inventory/customerorder/getListItems?listName=${listName}`;
  if (parentId !== null) {
    url += `&parentId=${parentId}`;
  }
    return this.httpClient.get(url);
  }
getShippingAddressData(
  customerId: number| null,
  isBilling: boolean,
  vendorId: number | null,
  courierId: number | null,
  isDomestic: boolean
): Observable<any[]> {
  let url = `${API}v1/ise/inventory/customerorder/getShippingAddresses?customerId=${customerId}&isBilling=${isBilling}&isDomestic=${isDomestic}`;
  
  if (vendorId !== null) {
    url += `&vendorId=${vendorId}`;
  }
  if (courierId !== null) {
    url += `&courierId=${courierId}`;
  }

  return this.httpClient.get<any[]>(url);
}
  getTicketDetail(ticketId:number) {
    const url = `${API}v1/ise/inventory/ticket/getTicketDetail?ticketId=${ticketId}`;
    return this.httpClient.get(url);
  }
  
  voidTicket(ticketID: number) {
    const url = `${API}v1/ise/inventory/ticket/voidTicket?ticketID=${ticketID}`;
    return this.httpClient.get(url);
  }
  getContactPersonDetails(customerId:number, shippingContactId:number|null) {
    let url = `${API}v1/ise/inventory/customerorder/getContactPersonDetails?customerId=${customerId}`;
  if (shippingContactId !== null) {
    url += `&parentId=${shippingContactId}`;
  }
    return this.httpClient.get(url);
  }


  getReceiverFormCustomer(receivingInfoId?: number,customerId?: number,deviceFamilyId?: number,deviceId?: number,customerLotsStr?: string | null,statusId?: number,isExpected?: boolean, isElot?: string | null,serviceCategoryId?: number,locationId?: number,mail?: string | null, fromDate?: Date | null, toDate?: Date | null,receiptStatus?: string | null,facilityIdStr?: string | null) {
    let params = new HttpParams();

    if (receivingInfoId) {
      params = params.set('receivingInfoId', receivingInfoId);
    }
    if (customerId) {
        params = params.set('customerId', customerId);
    }
    if (deviceFamilyId) {
        params = params.set('deviceFamilyId', deviceFamilyId);
    }
    if (deviceId) {
      params = params.set('deviceId', deviceId);
    }
    if (customerLotsStr) {
        params = params.set('customerLotsStr', customerLotsStr);
    }
    if (statusId) {
        params = params.set('statusId', statusId);
    }
    if (isExpected) {
        params = params.set('isExpected', isExpected);
    }
    if (isElot) {
      params = params.set('isElot', isElot);
    }
    if (serviceCategoryId) {
        params = params.set('serviceCategoryId', serviceCategoryId);
    }
    if (locationId) {
        params = params.set('facilityIDStr', locationId);
    }
    if (mail) {
        params = params.set('mail', mail);
    }
    if (fromDate) {
        params = params.set('fromDate', this.formatDate(fromDate));
    }
    if (toDate) {
        params = params.set('toDate', this.formatDate(toDate));
    }
    if (receiptStatus) {
      params = params.set('receiptStatus', receiptStatus);
    }
    if (facilityIdStr) {
        params = params.set('facilityIdStr', facilityIdStr);
    }
    return this.httpClient.get(`${API}v1/ise/inventory/searchCustomerReceiverForm`, { params });
  }
  getStatusList() {
    let url = `${API}v1/ise/inventory/getInventoryReceiptStatuses`;
    return this.httpClient.get(url);
  }
  getDeviceFamiliesList(customerId: number): Observable<any[]> {
    let url = `${API}v1/ise/inventory/getDeviceFamilies?customerId=${customerId}`;
    return this.httpClient.get<any[]>(url);
  }
  getDeviceList(customerId: number, deviceFamilyId: number): Observable<any[]> {
    let url = `${API}v1/ise/inventory/getDevices?customerId=${customerId}&deviceFamilyId=${deviceFamilyId}`;
    return this.httpClient.get<any[]>(url);
  }
  getISEPOList(customerId: number|undefined, divisionId: number | null, isFreezed: boolean | null) {
    let url = `${API}v1/ise/inventory/GetPurchaseOrders?customerId=${customerId}`;
    
    if (divisionId !== null) {
      url += `&divisionId=${divisionId}`;
    }
    
    if (isFreezed !== null) {
      url += `&isFreezed=${isFreezed}`;
    }
  
    return this.httpClient.get<any[]>(url);
  }
  saveMailRoomInfo(payload: MailInfoRequest, loginId: number) {
    const body = {
      MailId:null,
      LoginId: loginId,
      MailJson: JSON.stringify(payload)
    };
    return this.httpClient.post(`${API}v1/ise/inventory/savemailroominfo`, body);

  }
}
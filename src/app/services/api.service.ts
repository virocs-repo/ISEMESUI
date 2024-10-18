import { HttpClient } from '@angular/common/http';
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
  getReceiptdata() {
    return this.httpClient.get(`${API}v1/ise/inventory/receiptdata`);
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

  // Receipt
  getEntitiesName(entityType: string) {
    return this.httpClient.get(`${API}v1/ise/inventory/entity/${entityType}`);
  }
  getAddresses() {
    return this.httpClient.get(`${API}v1/ise/inventory/address`);
  }

  // Shipping
  getShippingData() {
    return this.httpClient.get(`${API}v1/ise/shipment/shipmentdata`);
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
  // Customer Orders
  getInventory(customerId: number, goodsType: string, lotNumber: string) {
    const url = `${API}v1/ise/inventory/customerorder/inventory?customerId=${customerId}&goodsType=${goodsType}&lotNumber=${lotNumber}`;
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

  //Inventory Move
  getAllInventoryMoveStatus() {
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryMove/getallInventoryMoveStatus`);
  }

  getInventoryMove(lotNumber: string, location: string, employeeIds: number[]) {
    const employeeIdsParam = employeeIds.map(String).join(','); // Convert number[] to string[] and join with commas
    const url = `${API}v1/ise/inventory/inventoryMove/getInventoryMoveStatus?lotNumber=${lotNumber}&location=${location}&employeeIds=${employeeIdsParam}`;
    return this.httpClient.get(url);
}

  upsertInventoryMoveStatus(data: any, options: { responseType: 'text' }): Observable<any> {
    return this.httpClient.post(`${API}v1/ise/inventory/inventoryMove/UpsertInventoryMoveStatus`, data, { responseType: options.responseType });
  }  
}

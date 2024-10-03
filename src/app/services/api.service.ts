import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OrderRequest } from '../components/add-customer-request/customerorder';

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
  postProcessReceipt(body: unknown) {
    return this.httpClient.post(`${API}v1/ise/inventory/processReceipt`, body);
  }
  postProcessDevice(body: unknown) {
    return this.httpClient.post(`${API}v1/ise/inventory/processDevice`, body);
  }
  postProcessHardware(body: unknown) {
    return this.httpClient.post(`${API}v1/ise/inventory/processHardware`, body);
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
    const url = `${API}v1/ise/inventory/customer/inventory?customerId=${customerId}&goodsType=${goodsType}&lotNumber=${lotNumber}`;
    return this.httpClient.get(url);
  }

  processCustomerOrder(payload: OrderRequest)  {
    const body = {
      LoginId: 1,
      InputJSON: JSON.stringify(payload)
    };
    return this.httpClient.post(`${API}v1/ise/inventory/customer/addcustomerorder`, body);
  
  }

  getallCustomerOrder()  {
    //v1/ise/inventory/customer/getallorder
    return this.httpClient.get(`${API}v1/ise/inventory/customer/getallorder`);
  
  }

  //Inventory Move
  getAllInventoryMoveStatus(){
    return this.httpClient.get(`${API}v1/ise/inventory/inventoryMove/getallInventoryMoveStatus`);
  }

  getInventoryMove(lotNumber: string, location: string, receivedFrom: string) {
    const url = `${API}v1/ise/inventory/inventoryMove/getInventoryMoveStatus?lotNumber=${lotNumber}&location=${location}&receivedFrom=${receivedFrom}`;
    return this.httpClient.get(url);
  }
}

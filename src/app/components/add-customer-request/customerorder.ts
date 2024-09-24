/* export interface CustomerOrderDetail {
    CustomerOrderDetailID: number | null;
    InventoryID: number;
    ShippedQty: number;
    RecordStatus: string;
  }
  
  export interface CustomerOrder {
    CustomerOrderID: number | null;
    CustomerId: number;
    OQA: boolean;
    Bake: boolean;
    PandL: boolean;
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
   */
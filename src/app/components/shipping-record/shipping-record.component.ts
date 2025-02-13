import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { GridDataResult, SelectableSettings } from '@progress/kendo-angular-grid';
import { FileSelectComponent } from '@progress/kendo-angular-upload';
import { ApiService } from 'src/app/services/api.service';
import { Customer, ICON, MESSAGES, Package, PackageUpdate, PostShipment, ReceiptLocation, Shipment, ShipmentCategory, ShipmentDetails, ShipmentDetails2, ShippingAttachment, UpsertShipPackageDimensionReq } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-shipping-record',
  templateUrl: './shipping-record.component.html',
  styleUrls: ['./shipping-record.component.scss']
})
export class ShippingRecordComponent implements OnDestroy {
  shipmentNumber: string = ''
  shipmentLocation: string = ''
  readonly customers: Customer[] = this.appService.masterData.entityMap.Customer;
  customerSelected: Customer | undefined;
readonly ICON = ICON;
  readonly receiptLocation: ReceiptLocation[] = this.appService.masterData.receiptLocation
  receiptLocationSelected: ReceiptLocation | undefined;
  senderInformation: string = ''
  shipmentComments: string = ''
  shipmentCategories: ShipmentCategory[] = []
  shipmentCategorySelected: ShipmentCategory | undefined;
  isShipped = false;
  AttachementVerified=false;
  SliDetailsVerified =false;
  customerInformation = '';
 // The number of rows the user wants to create
 numberOfPackages: number=0;
shipId :number =0;
 // Array holding the grid's package data
 packages: Package[] = [];
 packagesupdate: PackageUpdate[] = [];
 // List for package dimensions that will populate the dropdown
 packageDimensionsList: string[] = [];
  gridDataResult: GridDataResult = { data: [], total: 0 };
  customerID: number = 0;
  shipDeliveryDetailInfo :any =[];

  address = {
    Country: '',
    ReceiversName: '',
    CompanyName: '',
    Address1: '',
    Address2: '',
    Address3: '',
    Telephone: '',
    State: '',
    City: '',
    PostCode: '',
    Ext: '',
    Comments:'',
    SpecialInstructions:'',
    PackingComments:'',
    InvoiceComments:'',
    contactPerson:'',
    BillToCountry: '',
    BillToAddress1: '',
    BillToAddress2: '',
    BillToAddress3: '',
    BillToTelephone: '',
    BillToState: '',
    BillToCity: '',
    BillToPostCode: '',
    BillToExt:'',
    BillToReceiversName:'',
    BillToCompanyName:'',
    TrackingId:''


  };
  shippingDetailsData = {
    ShippingMethod: '',
    Email: '',
    ShipAlertEmail: '',
    ContactPerson: '',
    Destination: '',
    CourierName: '',
    CIFrom: '',
    ServiceType: '',
    BillTransportTo: '',
    BillTransportAcct: '',
    CustomerReference: '',
    InvoiceNumber: '',
    BillDutiesTaxes: '',
    DutiesTaxes: '',
    ECCN: '',
    COO: '',
    Quantity: '',
    UnitValue: '',
    TotalValue: '',
    CIAdditionalInfo: '',
    ShipAlertEmailCourier: '',
    Weight:'',
    Width:'',
    Length:'',
    Attention:'',
    PackageType:'',
    Residential:'',
    NoOfPackages:'',
    PackageDimension:'',
    CIFromId:'',
    AccountNumber:'',
    Height:'',
    TaxId:'',
    HoldShip:'',
    Phone:'',
    ScheduleB:'',
    LicenseException:'',
    LicenseType:'',
    Units:'',
    PurchaseNo:'',
    DescriptionOfGood:'',
    Product:'',
    CommodityOrgin:'',
    ShipmentReference:'',
    CustomTermTrade:'',
    ShipDate:'',
    UltimateConsignee:'',
    CommodityDescription:'',
    Dateexportation:'',
    TransportationRef:'',
    shipVia:'',
    ShipAlertInfo:''
    
  };

 

  isDisabled: any = {
    shipBtn: false,
    clearBtn: false
  }
  isEditMode = false;
  @Output() onClose = new EventEmitter<void>();
  constructor(public appService: AppService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.shipmentCategories = this.appService.shipmentCategories;

    if (this.appService.sharedData.shipping.isViewMode || this.appService.sharedData.shipping.isEditMode) {
      this.isEditMode = true;
      const dataItem: Shipment = this.appService.sharedData.shipping.dataItem;
      console.log({ dataItem })
      this.shipmentNumber = dataItem.shipmentNum;
      this.shipmentCategorySelected = this.shipmentCategories.find(c => c.shipmentCategoryID == dataItem.shipmentCategoryID)
      this.shipmentLocation = dataItem.shipmentLocation
      this.customerInformation = dataItem.customerInfo;
      this.senderInformation = dataItem.senderInfo
      this.shipmentComments = dataItem.shippmentInfo
      this.isShipped = dataItem.isShipped
      this.shipId=dataItem.shipmentId
      this.customerSelected = this.customers.find(c => c.CustomerID == dataItem.customerID);
      // this.shipmentCategorySelected = this.shipmentCategories.find(c => c.shipmentCategoryID == dataItem.shipmentTypeID);

      this.receiptLocationSelected = this.receiptLocation.find(c => c.receivingFacilityID == dataItem.currentLocationID);
      this.customerID = dataItem.customerID;
      this.fetchShipmentLineItems(dataItem.shipmentId);

     
      this.fetchShipDeliveryData(dataItem.deliveryInfoId);

    }
    else
    {
      
        this.customerSelected = this.customers.find(c => c.CustomerID ==this.appService.sharedData.addshipping.dataItem.customerID);
        this.customerID = this.appService.sharedData.addshipping.dataItem.customerID;
        
    
      
    }
    if (this.appService.sharedData.shipping.isViewMode) {
      this.isDisabled.shipBtn = true;
      this.isDisabled.clearBtn = true;
    }

    this.listFiles();
    this.fetchpackageDimensions();
    this.fetchpackageByShipmentId(this.shipId);
  }
  ngOnDestroy(): void {
    this.appService.sharedData.shipping.isEditMode = false
    this.appService.sharedData.shipping.isViewMode = false
  }
  onShippingMethodChange(method: string) {
    this.shippingDetailsData.ShippingMethod = method;
  }
  private fetchShipmentLineItems(shipmentID: number) {
    this.apiService.getShipmentLineItems(shipmentID).subscribe({
      next: (shipmentDetails: ShipmentDetails[] | any) => {
        this.rebuildTable(shipmentDetails);
      }
    })
  }
  shipmentDetails: ShipmentDetails[] = []
  private fetchShipDeliveryData(deliveryInfoId: number) {
   
    this.apiService.getShipmentdeliveryInfo(deliveryInfoId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.shipDeliveryDetailInfo=res[0];
        this.address.Address1=res[0].address1;
        this.address.BillToAddress1=res[0].billToaddress1;
        this.address.CompanyName=res[0].companyName;
        this.address.Address2=res[0].address2;
        this.address.Address3=res[0].address3;
        this.address.Country=res[0].country;
        this.address.PostCode=res[0].postCode;
        this.address.State=res[0].stateProvince;
        this.address.City=res[0].city;
        this.address.Telephone=res[0].phone;
        this.address.Ext=res[0].ext;
        this.address.BillToAddress2=res[0].billToaddress2;
        this.address.BillToAddress3=res[0].billToaddress3;
        this.address.BillToCountry=res[0].billTocountry;
        this.address.BillToPostCode=res[0].billTopostCode;
        this.address.BillToState=res[0].billTostateProvince;
        this.address.BillToCity=res[0].billTocity;
        this.address.BillToTelephone=res[0].billTophone;
        this.address.BillToExt=res[0].billToext;
        this.address.Comments=res[0].shippingComments;
        this.address.SpecialInstructions=res[0].specialInstructionforShipping;
        this.address.PackingComments=res[0].commentsforPackingSlip;
        this.address.InvoiceComments=res[0].commentsforCommericalInvoice;
        this.address.ReceiversName=res[0].contactPerson;
        
        this.shippingDetailsData.ShippingMethod=res[0].shippingMethod;
        this.shippingDetailsData.ContactPerson=res[0].contactPerson;
        this.shippingDetailsData.Destination=res[0].destination;
        this.shippingDetailsData.CourierName=res[0].courier;
        this.shippingDetailsData.CustomerReference=res[0].customerReference;
        this.shippingDetailsData.InvoiceNumber=res[0].invoiceNumber;
        this.shippingDetailsData.BillDutiesTaxes=res[0].billDutyTaxFeesTo;
        this.shippingDetailsData.BillTransportTo=res[0].billTransportationTo;
        //this.shippingDetailsData.CIFrom=res[0].ciFrom;
        
        this.shippingDetailsData.CIFrom = res[0].ciFrom?.trim() ? res[0].ciFrom : 'NA';


        this.shippingDetailsData.DutiesTaxes=res[0].billDutyTaxFeesAcct;
        this.shippingDetailsData.ECCN=res[0].eccn;
        this.shippingDetailsData.COO=res[0].countryOfOrigin;
        this.shippingDetailsData.Quantity=res[0].qty;
        this.shippingDetailsData.UnitValue=res[0].unitValue;
        this.shippingDetailsData.TotalValue=res[0].totalValue;
        this.shippingDetailsData.CIAdditionalInfo=res[0].commodityDescription;
        this.shippingDetailsData.ShipAlertEmail=res[0].shipAlertEmail;
        this.shippingDetailsData.PackageDimension=res[0].packageDimentions;
        this.shippingDetailsData.AccountNumber=res[0].accountNumber;
        this.shippingDetailsData.ServiceType=res[0].serviceType;
        this.shippingDetailsData.Weight=res[0].weight;
        this.shippingDetailsData.Width=res[0].referenceNumber1;
        this.shippingDetailsData.Length=res[0].referenceNumber2;
        this.shippingDetailsData.Height=res[0].otherAccountNumber;

        this.shippingDetailsData.TaxId=res[0].taxId;
        this.shippingDetailsData.Email=res[0].email;
        this.shippingDetailsData.Attention=res[0].attention;
        this.shippingDetailsData.PackageType=res[0].packageType;
        this.shippingDetailsData.Residential=res[0].residential;
        this.shippingDetailsData.NoOfPackages=res[0].noOfPackages;
        this.shippingDetailsData.BillTransportAcct=res[0].billTransportationAcct;
        this.shippingDetailsData.TaxId=res[0].taxId;
        this.shippingDetailsData.Units=res[0].units;
        this.shippingDetailsData.LicenseType=res[0].licenseType;
        this.shippingDetailsData.InvoiceNumber=res[0].invoiceNumber;
        this.shippingDetailsData.PurchaseNo=res[0].purchaseNumber;
        this.shippingDetailsData.ShipDate=res[0].shipDate;
        this.shippingDetailsData.ScheduleB=res[0].scheduleBNumber;
        this.shippingDetailsData.CommodityDescription=res[0].commodityDescription;
        this.shippingDetailsData.UltimateConsignee=res[0].ultimateConsignee;
        this.onShippingMethodChange(res[0].shippingMethod);
        

      },
      error: (err) => {
      }
    });

  }
  private rebuildTable(shipmentDetails: ShipmentDetails[] | any) {
    
    if (shipmentDetails) {
      shipmentDetails.forEach((a: ShipmentDetails) => {
        a.selected = a.shipmentLineItemID ? true : false;
        a.shipmentTypeSelected = this.appService.shipmentTypes.find(s => s.shipmentTypeID == a.shipmentTypeID)
      })
      this.gridDataResult.data = shipmentDetails;
      this.gridDataResult.total = shipmentDetails.length;
      this.shipmentDetails = shipmentDetails;
      this.gridSelectedKeys = this.shipmentDetails
      .filter(v => v.shipmentLineItemID >0) // Check for not null
      .map(d => d.inventoryID);
    
      console.log({ shipmentDetails });
    }
  }
  onChangeCustomer() {
    if (this.customerSelected) {
      this.apiService.getShipmentInventories(this.customerSelected.CustomerID).subscribe({
        next: (v: any) => {
          this.rebuildTable(v);
        }
      });
    }
  }
  selectableSettings: SelectableSettings = {
    enabled: true,
    checkboxOnly: true,
    mode: 'multiple'
  }
  columnMenuSettings: any = {
    lock: false,
    stick: false,
    setColumnPosition: { expanded: true },
    autoSizeColumn: true,
    autoSizeAllColumns: true,
  }
  autoFillTestValues() {
    this.customerSelected = this.customers[0]
    this.shipmentNumber = '123'
    this.shipmentCategorySelected = this.shipmentCategories[0]
    this.shipmentLocation = 'shipmentLocation'
    this.receiptLocationSelected = this.receiptLocation[0]
    this.senderInformation = 'senderInformation'
    this.customerInformation = 'customerInformation'
  }
  gridSelectedKeys: number[] = [];
  shipItem() {

    if(this.shippingDetailsData.ShippingMethod === 'Forwarder')
    {
      if(!this.SliDetailsVerified)
      {
        this.appService.errorMessage('Please have the SLI Details verified ');
        return;
      }

    }
    else if(!this.AttachementVerified)
      {
        this.appService.errorMessage('Please have the attachments verified ');
        return;
      }
   
   
    if (!this.gridSelectedKeys) {
      this.appService.errorMessage('Please select atleast one record');
      return;
    }
   // if (this.gridSelectedKeys && this.gridSelectedKeys.length != 1) {
     // this.appService.errorMessage("Please select only one record");
      //return;
    //}
    const sd = this.shipmentDetails.find(s => s.inventoryID == this.gridSelectedKeys[0])
    if (!sd) {
      return;
    }
    const dataItem: Shipment = this.appService.sharedData.shipping.dataItem;
    // dataItem.clientAccountNumber="345345345"
    dataItem.clientAccountNumber=this.shippingDetailsData.AccountNumber;
   
    const body = { ...sd, ...dataItem }
    this.appService.isLoading = true;
    this.apiService.createShipment(body).subscribe({
      next: (res: any) => {
        this.appService.isLoading = false;
        this.appService.successMessage(MESSAGES.DataSaved);
        this.onClose.emit();
      },
      error: (e) => {
        this.appService.isLoading = false;
        const eo = e.error[0];
        let m = 'Something went wrong! Please try again';
        if (eo && eo.text) {
          m = eo.text;
        } else if (e.error.title) {
          m = e.error.title;
        }
        this.appService.errorMessage(m)
      }
    });
  }
  saveShipment() {
    if (!this.customerSelected) {
      this.appService.errorMessage('Please select customer');
      return;
    }
    const requiredFields = [
      this.shipmentNumber, this.shipmentCategorySelected, this.shipmentLocation,
      this.receiptLocationSelected, this.senderInformation, this.customerInformation,
      this.shipmentComments
    ]
    const isValid = !requiredFields.some(v => !v);
    if (!isValid) {
      this.appService.errorMessage(MESSAGES.AllFieldsRequired);
      return;
    }
    const Shipment: PostShipment[] = []
    const s: PostShipment = {
      ShipmentID: null,
      CustomerID: this.customerSelected?.CustomerID || 1,
      ShipmentNum: this.shipmentNumber,
      ShipmentCategoryID: this.shipmentCategorySelected?.shipmentCategoryID || 1,
      ShipmentLocation: this.shipmentLocation,
      CurrentLocationID: this.receiptLocationSelected?.receivingFacilityID || 1,
      SenderInfo: this.senderInformation,
      CustomerInfo: this.customerInformation,
      ShippmentInfo: this.shipmentComments.trim(),
      ShipmentDetails: this.getSelectedShipmentDetails(),
      IsShipped: this.isShipped,
      RecordStatus: "I",
      Active: true,
      LoginId: this.appService.loginId,
    }
    if (this.isEditMode) {
      const dataItem: Shipment = this.appService.sharedData.shipping.dataItem;
      s.ShipmentID = dataItem.shipmentId
      s.RecordStatus = "U";
      console.log({ dataItem })
    }

    this.apiService.postProcessShipment(s).subscribe({
      next: (v: any) => {
        this.appService.successMessage(MESSAGES.DataSaved);
        this.onClose.emit();
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
      }
    });
  }
  private getSelectedShipmentDetails(): Array<ShipmentDetails2> {
    let selectedShipmentDetails: Array<ShipmentDetails2> = [];
    this.shipmentDetails.forEach(d => {
      if (this.gridSelectedKeys.includes(d.inventoryID)) {
        selectedShipmentDetails.push({ ShipmentLineItemID: d.shipmentLineItemID, InventoryID: d.inventoryID })
      }
    })
    return selectedShipmentDetails;
  }
  clearForm() {
    this.customerSelected = undefined;
    this.shipmentNumber = '';
    this.senderInformation = ''
    this.shipmentComments = ''
    this.shipmentCategorySelected = undefined
    this.isShipped = false;
    this.receiptLocationSelected = undefined;
    this.shipmentLocation = '';
    this.customerInformation = ''
  }

  onUpload(event: any): void {
    // Send selected files to API
    const formData = new FormData();
    event.files.forEach((file: any) => {
      formData.append('files', file.rawFile);
    });
    // Call API
  }

shippingAttachments: ShippingAttachment[] = [];
 readonly downloadFileApi = environment.apiUrl + 'v1/ise/inventory/download/'
   uploadFilesById(upFiles: FileSelectComponent) {
      const dataItem = this.appService.sharedData.shipping.dataItem;
      
     
      if (!dataItem.shipmentId) {
        // this is for new form
        return;
      }
      const files = upFiles.fileList.files;
      if (files && files.length) {
        const file = files[0][0].rawFile;
        if (!file) {
          this.appService.errorMessage('Error while selecting file');
          return;
        }
  
        const inputFilename = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
        const shipmentNumber = dataItem.shipmentId; // You can generate or get this value dynamically
  
        this.apiService.uploadFileById(file, inputFilename, shipmentNumber, this.appService.loginId,'ShipAlert').subscribe({
          next: (v: any) => {
            this.appService.successMessage('Success: File uploaded!');
            upFiles.clearFiles();
            this.listFiles();
          },
          error: (v: any) => {
            this.appService.errorMessage('Error while uploading file')
          }
        });
      } else {
        this.appService.errorMessage('Please select file to upload')
      }
    }


    private listFiles() {
      const dataItem = this.appService.sharedData.shipping.dataItem;
      if (!dataItem.shipmentId) {
        // this is for new form
        return;
      }
      this.apiService.listFilesById(dataItem.shipmentId,'ShipAlert').subscribe({
        next: (v: any) => {
          this.shippingAttachments = v;
        }
      })
    }

    downloadFile(d: ShippingAttachment) {
        this.apiService.downloadFile(d.path).subscribe();
      }
      deleteFile(d: ShippingAttachment) {
        d.active = false;
        this.apiService.deleteFile(d).subscribe({
          next: (v: any) => {
            this.appService.successMessage('Success: File deleted!')
            this.listFiles();
          },
          error: (v: any) => {
            this.appService.errorMessage('Error: Unable to delete file')
          }
        })
      }

      // Called when the user enters a number and clicks the "Create Rows" button.
  onCreateRows(): void {
    // Clear any previous data
    // this.packages = [];

    // // Create as many package rows as entered
    // for (let i = 0; i < this.numberOfPackages; i++) {
    //   this.packages.push({
    //     PackageId: '', // default empty, can be modified later
    //     PackageNo: i + 1,
    //     CIPackageDimentions: this.packageDimensionsList.length > 0 ? this.packageDimensionsList[0] : '',
    //     CIWeight: 0,  // default weight; user can edit
    //     Active: true  // default active state
    //   });
    // }

    const newPackageNo = this.packages.length > 0 
      ? Math.max(...this.packages.map(p => p.packageNo)) + 1 
      : 1;
      
    // Push a new row with default values
    this.packages.push({
      packageNo: newPackageNo,
      packageId:'',
      ciPackageDimentions: this.packageDimensionsList.length > 0 
                              ? this.packageDimensionsList[0] 
                              : '',
      ciWeight: 0,
      active: true
    });
  }

  onSave(): void {
    this.packagesupdate=[];
if(this.packages.length<=0)
{
  this.appService.errorMessage('please add atleast one package by clicking Add Rows.');

  return;
}
  

    const dataItem: Shipment = this.appService.sharedData.shipping.dataItem;
   for (let i = 0; i < this.packages.length; i++) {
       this.packagesupdate.push({
         PackageId: String(this.packages[i].packageId), // default empty, can be modified later
         PackageNo: this.packages[i].packageNo,
         CIPackageDimentions:this.packages[i].ciPackageDimentions,
         CIWeight:this.packages[i].ciWeight,
        Active: this.packages[i].active
       });
     }

    const payload: UpsertShipPackageDimensionReq = {
      ShipmentID: String(dataItem.shipmentId),
      LoginID: String(this.appService.loginId),
      Packages: this.packagesupdate
    };
    debugger;
    this.apiService.saveShipmentpackagesRecord(payload).subscribe({
      next: (response: any) => {
        this.appService.successMessage('saved successfully!');

        this.fetchpackageByShipmentId(this.shipId);
      },
      error: (error: any) => {
        this.appService.errorMessage('Failed to create shipment record.');
        console.error('API error:', error);
      },
    });
  }

  private fetchpackageDimensions() {
   
    this.apiService.fetchpackageDimensions().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.packageDimensionsList = res.map(item => item.ciPackageDimentions);
        }
      },
      error: (err) => {
      }
    });

  }

  private fetchpackageByShipmentId(shipmentNumber:number) {
   
    this.apiService.fetchpackageByShipmentId(shipmentNumber).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          this.packages = [];
          this.packagesupdate=[];
          this.packages = res;
        } else {
          this.packages = []; // No API data: allow manual entry.
        }
      },
      error: (err) => {
      }
    });

  }
}

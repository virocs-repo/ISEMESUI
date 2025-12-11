
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ContextMenuSelectEvent, MenuItem } from '@progress/kendo-angular-menu';
import { PDFExportComponent } from '@progress/kendo-angular-pdf-export';
import { FileRestrictions, FileSelectComponent } from '@progress/kendo-angular-upload';
import { map, Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import {Customer, ICON, MESSAGES, Vendor, TicketType, TicketLot, AddEditTicket, INIT_TICKET, TicketLotDetail, TicketComments, ScanLot, TicketDetail, CommentsAttachment, TicketAttachment } from 'src/app/services/app.interface';
import { AppService } from 'src/app/services/app.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { CellClickEvent } from '@progress/kendo-angular-grid';

enum ActionType {
  Remove = 'Remove',
  Edit = 'Edit Data',
  Void = 'Void Data'
}

@Component({
  selector: 'app-add-ticket',
  templateUrl: './add-ticket.component.html',
  styleUrls: ['./add-ticket.component.scss'],
  standalone: false
})
export class AddTicketComponent implements OnInit, OnDestroy {
  readonly ICON = ICON;
  @Output() onClose = new EventEmitter<void>();

  isDisabled: any = {
    clearAddTicket: false,
    addTicket: false,
    reviewButtons: false,
  }
  
  readonly subscription = new Subscription()
  readonly filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  lotNumbers: any[] = [];

  ticketTypes:TicketType[] = [];
  ticketTypeSelected : TicketType|undefined;
  dueDate: Date|null = null;  // Variable to store the selected 'from' date
  format: string = 'yyyy-MM-dd HH:mm:ss'; // Date format for kendo-datetimepicker
  requestDetail:string = "";
  ticketLots:TicketLot[] = [];
  scanLot:string = "";
  reviewerComments:string = "";
  statusID:number = 0;
  lotDetailGrid: TicketLotDetail[] = []
  commentsGrid: TicketComments[] =[]
  ticketDetail:TicketDetail|null = null;
  isViewOrEdit:boolean = false;
  vDataItem:any;
  showHideRequestSaveButtons:boolean = false;
  showHideAcceptRequestButton:boolean = false;
  showHideNeedClarificationtButton:boolean = false;
  showHideAcceptRequestSaveButtons:boolean = false;
  showHideSubmitClarificationtButton:boolean = false;
  lotsSelected:TicketLot[]=[];
  commentsRow:any;
  reviewerCommentId:number|null = null;
  isDisableRequestDetail:boolean = false;
  selectedFiles:any;
  attachmentLabelName:string = 'Ticket Attachments';
  attachmentType:string ='';
  ticketAttachments:TicketAttachment[] = []
  filteredTicketAttachments:TicketAttachment[] = []
  commentsAttachments:CommentsAttachment[] = []
  filteredCommentsAttachments:CommentsAttachment[] = []
  readonly downloadFileApi = environment.apiUrl + 'v1/ise/ticketing/ticket/download/'

  constructor(public appService: AppService, private apiService: ApiService) { 
    this.getTicketTypes();
    this.getTicketLots();
  }

  ngOnInit(): void {
    this.init();
    this.subscription.add(this.appService.sharedData.addTicket.eventEmitter.subscribe((v) => {
      switch (v) {
        case 'canCloseDialog?':
          let closeDialog = false;
          closeDialog = this.areThereAnyChanges();
          if (closeDialog) {
            closeDialog = confirm('Do you want to Discard changes?')
          } else {
            closeDialog = true
          }
          if (closeDialog) {
            this.appService.sharedData.addTicket.eventEmitter.emit('closeDialog');
          }
          break;
        default:
          break;
      }
    }))
    
  }
  ngOnDestroy(): void {
    this.appService.sharedData.addTicket.isEditMode = false
    this.appService.sharedData.addTicket.isViewMode = false;
    this.subscription.unsubscribe();
  }

  private init() {

  this.vDataItem = this.appService.sharedData.addTicket.dataItem;
  if (this.appService.sharedData.addTicket.isViewMode || this.appService.sharedData.addTicket.isEditMode) {
    this.isViewOrEdit = true;

    if(this.appService.sharedData.addTicket.isEditMode){
      if(this.vDataItem.ticketStatusID == 4){
        this.showHideAcceptRequestButton = false;
        this.showHideAcceptRequestSaveButtons = true;
      }
   }

    this.getTicketDetail(this.vDataItem.ticketID);
    if (this.appService.sharedData.addTicket.isViewMode) {
      this.disabledAllBtns()
    }
  }
  else {
    this.isViewOrEdit = false;
  }

  this.showHideButtons();
}

showHideButtons(){

  this.attachmentType = this.appService.roleName == 'Reviewer' ? 'Reviewer' : 'Ticket'

  if(this.isViewOrEdit == false)  {
    this.showHideAcceptRequestButton = false;
    this.showHideNeedClarificationtButton = false;
    this.showHideRequestSaveButtons = true;
    return;
  }

  if(this.appService.roleName == 'Reviewer') {
    this.attachmentLabelName = 'Reviewer Attachments';
    this.isDisableRequestDetail = true;
    if(this.vDataItem.ticketStatusID == 1 || this.vDataItem.ticketStatusID == 3 || this.vDataItem.ticketStatusID == 4 || this.vDataItem.ticketStatusID == 5){
      this.showHideAcceptRequestButton = false;
      this.showHideNeedClarificationtButton = false;
    }
    else if(this.vDataItem.ticketStatusID == 2){
      this.showHideAcceptRequestButton = true;
      this.showHideNeedClarificationtButton = true;
    }
    
    this.showHideRequestSaveButtons = false;
  }
  else {
    this.attachmentLabelName = 'Ticket Attachments';
    this.isDisableRequestDetail = false;
    this.showHideAcceptRequestButton = false;
    this.showHideNeedClarificationtButton = false;
    if(this.appService.sharedData.addTicket.isEditMode){
      this.showHideRequestSaveButtons = true;
    }
  }
}

  public gridStyle = {
    backgroundColor: 'green'
  };
  
  selectableSettings: any = {
    checkboxOnly: true,
    mode: 'single',
  }
  columnMenuSettings: any = {
    lock: false,
    stick: false,
    setColumnPosition: { expanded: true },
    autoSizeColumn: true,
    autoSizeAllColumns: true,
  }
  
  disabledAllBtns() {
    Object.keys(this.isDisabled).forEach((k: any) => {
      this.isDisabled[k] = true;
    });
  }
  
  valueNormalizerCustomer = (text: Observable<string>) => text.pipe(map((content: string) => {
    const customer: Customer = { CustomerID: 9999, CustomerName: content };
    return customer;
  }));
  valueNormalizerVendor = (text: Observable<string>) => text.pipe(map((content: string) => {
    const vendor: Vendor = { VendorID: 9999, VendorName: content };
    return vendor
  }));
 
  onClearForm() {
    // this.tracking = ''
    // this.courierSelected = undefined
    // this.countrySelected = undefined
    // this.expectedDateTime = new Date();
    // this.deliveryComments = ''

    // this.addressSelected = undefined

    // this.signatureEmployeeSelected = undefined
    // this.signatureName = ''

    // this.address = ''
  }
  private areThereAnyChanges() {
    return false;

    if (this.appService.sharedData.receiving.isViewMode || this.appService.sharedData.receiving.isEditMode) {
      return false
    } else {
      // new form
      const valuesToCheck = [
        // this.tracking,
        // this.courierSelected,
        // this.countrySelected,
        // this.deliveryComments,

        // this.addressSelected,
        
        // this.signatureEmployeeSelected,
        // this.signatureName,

        // this.address,
      ]
      const hasTruthyValue = valuesToCheck.some(v => v);
      return hasTruthyValue
    }
  }
  //Ticket code starts here
  getTicketTypes(): void {
   
    this.apiService.getTicketTypes().subscribe({
      next: (v: any) => {
        this.ticketTypes = v; 
        this.ticketTypeSelected = this.ticketTypes.find((c) => c.ticketTypeID === this.ticketDetail?.ticketTypeID);
      },
      error: (v: any) => { }
    });
  }
  getTicketLots(): void {
   
    this.apiService.getTicketLots().subscribe({
      next: (v: any) => {
        
        this.ticketLots = v; 
        this.setLotSelectedItems();
      },
      error: (v: any) => { }
    });
  }

  setLotSelectedItems(){
    
    this.lotsSelected = [];
    var lot:TicketLot;
    this.lotDetailGrid.forEach((d) => {
      lot = { inventoryID: d.inventoryID, lotNum: d.iseLot }
      this.lotsSelected.push(lot )
    }) 
  }

  closeDialog() {

  }
  upsertTicket(){

    const ticket : AddEditTicket = {
      ...INIT_TICKET
    }

    if(this.ticketTypeSelected?.ticketTypeID == undefined || this.ticketTypeSelected?.ticketTypeID == 0){
      this.appService.errorMessage('Please select Request Type.');
      return;
    }
    if(this.lotsSelected.length == 0){
      this.appService.errorMessage('Please select ISE Lot #.');
      return;
    }
    if(this.dueDate == null){
      this.appService.errorMessage('Please select due date.');
      return;
    }
    if(this.statusID == 3){
      if(this.reviewerComments == ''){
        this.appService.errorMessage('Please provide comments for clarification needed.');
        return;
      }
    }

    
    var files:any[] = [];
    if (this.selectedFiles && this.selectedFiles.length) {
      if (this.selectedFiles.length < 1) {
        this.appService.errorMessage('Error while selecting file');
        return;
      }

      this.selectedFiles.forEach((file:any) => {
        files.push(file.rawFile);
      })
    }

    if(this.vDataItem.ticketID) {
      ticket.TicketID = this.vDataItem.ticketID;;
      ticket.RequestorID = this.vDataItem.requestorID;
      ticket.RecordStatus = 'U';
    }
    else{
      ticket.RequestorID = this.appService.loginId;
      ticket.TicketID = null;
      ticket.RecordStatus = 'I';
    }

    ticket.TicketTypeID = this.ticketTypeSelected?.ticketTypeID;
    ticket.RequestDetails = this.requestDetail;
    ticket.LotString = this.lotsSelected.map(item => item.inventoryID).join(',');
    ticket.DueDate = moment(this.dueDate).format('YYYY-MM-DD HH:mm:ss');
    ticket.UserID = this.appService.loginId;
    ticket.Active = 1;
    
    ticket.ReviewerAttachments = [];
    
    ticket.StatusID = this.statusID;
    if((this.statusID == 1 || this.statusID == 2) && this.commentsRow != undefined){
      ticket.ReviewerComment = this.commentsRow.reviewerComments;
      ticket.RequestorComment = this.commentsRow.requestorComments;
      ticket.CommentID = this.commentsRow.commentId
    }
    else if(this.statusID == 3 || this.statusID == 4 || this.statusID == 5){
      ticket.ReviewerComment = this.reviewerComments;
      ticket.CommentID = this.reviewerCommentId;
    }
    
    var objScanLot:ScanLot;
    if(this.statusID == 4 || this.statusID == 5) {
      this.lotDetailGrid.forEach((d) => {
        objScanLot = {InventoryID: d.inventoryID, LotNum:d.scanLotNum }
        ticket.ScanLots.push(objScanLot);
      })
    }

    var tAttachments : string = '';
    if(this.ticketAttachments.length > 0)
      tAttachments = JSON.stringify(this.ticketAttachments);
    
    const ticketJson = JSON.stringify(ticket);

    debugger;
  
    this.apiService.upsertTicket(files, ticketJson, tAttachments, this.attachmentType, ticket.TicketID).subscribe({
      next : (v: any) => {
        this.onClose.emit();
        this.appService.successMessage(MESSAGES.DataSaved);
      },
      error: (err) => {
        this.appService.errorMessage(MESSAGES.DataSaveError);
      }
    });
  }

  acceptRequest() {
    this.reviewerComments = '';
    this.scanLot = '';
    this.showHideAcceptRequestSaveButtons = true;
    this.showHideSubmitClarificationtButton = false;
  }

  needClarification() {
    this.reviewerComments = '';
    this.showHideAcceptRequestSaveButtons = false;
    this.showHideSubmitClarificationtButton = true;
  }

  draftRequest() {
    this.statusID = 1;
    this.upsertTicket();
  }
  submitRequest() {
    this.statusID = 2;
    this.upsertTicket();
  }

  submitNeedClarification() {
    this.statusID = 3;
    this.upsertTicket();
  }

  saveAcceptRequest() {
    this.statusID = 4;
    this.upsertTicket();
  }

  completeRequest() {
    this.statusID = 5;
    var unScanedLots = this.lotDetailGrid.find(r => r.scanLotNum == null || r.scanLotNum == '');
    if(unScanedLots){
        this.appService.errorMessage('Please scan all the lots before completing the request.');
        return;
    }

    this.upsertTicket();
  }

  addScanLot(){

    this.lotDetailGrid.forEach((d) => {
      if(d.iseLot == this.scanLot)
      {
        d.scanLotNum = this.scanLot;
        this.scanLot = '';
      }
    })
  }

  getTicketLotLineItems(strLotNumbers:string): void {
   
    this.apiService.getTicketLotLineItems(strLotNumbers).subscribe({
      next: (v: any) => {
        
        this.lotDetailGrid.push(v); 
      },
      error: (v: any) => { }
    });
  }

  getTicketDetail(ticketId:number): void {
   
    this.apiService.getTicketDetail(ticketId).subscribe({
      next: (v: any) => {
        this.ticketDetail = v; 
        this.lotDetailGrid = v.lotDetails;
        this.commentsGrid = v.comments;
        this.ticketAttachments = v.ticketAttachments;
        this.filteredTicketAttachments = v.ticketAttachments;
        this.commentsAttachments = v.commentsAttachments;
        this.bindData();
      },
      error: (v: any) => { }
    });
  }

  private bindData() {
    
    if(this.ticketDetail != undefined) {
      this.ticketTypeSelected = this.ticketTypes.find((c) => c.ticketTypeID === this.ticketDetail?.ticketTypeID);
      this.dueDate = new Date(this.ticketDetail?.dueDate);
      this.requestDetail = this.ticketDetail?.requestDetails;
      this.setLotSelectedItems(); 

      this.commentsGrid.forEach((d)=> {
        if(this.vDataItem.ticketStatusID == 4) {
          if(d.requestorComments == undefined || d.requestorComments == ''){
            this.reviewerComments = d.reviewerComments;
            this.reviewerCommentId = d.commentId;
          }
        } 
        if(this.vDataItem.ticketStatusID == 3) {
          if(this.appService.sharedData.addTicket.isEditMode){
            if(d.requestorComments == undefined || d.requestorComments == ''){
              d.isEditable = true
            }
          }
        } 
      })
    }
  }

  onLotsChange(event:any) {
    
    if(this.ticketTypeSelected?.ticketTypeID == undefined || this.ticketTypeSelected?.ticketTypeID == 0) {
      this.appService.errorMessage('Please select Request Type.');
      this.lotsSelected =[];
      return;
    }
    //var selectedLots:TicketLot[]=[];
    if(event.length >  this.lotDetailGrid.length && this.ticketTypeSelected?.multiSelect == false && this.lotsSelected.length  > 1) {
      this.lotsSelected =[];
      if(this.lotDetailGrid.length > 0)
        this.lotsSelected = [{ inventoryID: this.lotDetailGrid[0].inventoryID, lotNum: this.lotDetailGrid[0].iseLot }]
      return;
    }
      
      this.lotDetailGrid =[];
      const commaSeparatedIds = this.lotsSelected.map(item => item.lotNum).join(',');
      this.apiService.getTicketLotLineItems(commaSeparatedIds).subscribe({
        next: (v:any) => {
          
          v.forEach((d:any) => {
              this.lotDetailGrid.push(d);
          })
        },
        error: () => { }
        });
    
  }

  onRequestorCommentsChange(event:any, dataItem:any) {
  
    this.commentsRow = { 
      commentId: dataItem.commentId, 
      requestorComments: dataItem.requestorComments,
      reviewerComments: dataItem.reviewerComments
    }
  }

  fileRestrictions: FileRestrictions = {
      allowedExtensions: [".jpg", ".png", ".jpeg"],
      minFileSize: 1024 // in bytes , 1024*1024 1MB
  };

  onRequestTypeChange(event:any){
    this.lotsSelected = [];
    this.lotDetailGrid = [];
  }

  onScanLotEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      // Handle the Enter key press
      this.addScanLot();
      // You can execute other logic here
    }
  }

   onCellClick(e: CellClickEvent): void {
      debugger;
      this.filteredCommentsAttachments = this.commentsAttachments.filter(a => a.commentID === e.dataItem.commentID)
    }
    
  onSelect(event: any): void {
    this.selectedFiles = event.files;
    // Get selected files count
  }

  onUpload(event: any): void {
    debugger;
    // Send selected files to API
    const formData = new FormData();
    event.files.forEach((file: any) => {
      formData.append('files', file.rawFile);
    });
    // Call API
  }
  
  downloadFile(d: CommentsAttachment) {
    debugger;
    this.apiService.downloadTicketFile(d.fileName).subscribe();
  }
  
  deleteTicketFile(dataItem: TicketAttachment) {
    debugger;
    dataItem.active = false;
    var attachment =  this.ticketAttachments.find(a => a.fileName === dataItem.fileName);
    if(attachment != undefined)
      attachment.active = false;

    this.filteredTicketAttachments = this.ticketAttachments.filter(a => a.active == true)
  }
  // print
  @ViewChild('pdfExport', { static: true }) pdfExportComponent!: PDFExportComponent;
  printSection() {
    this.pdfExportComponent.paperSize = 'A4'
    this.pdfExportComponent.landscape = true;
    this.pdfExportComponent.scale = 0.6;
    this.pdfExportComponent.margin = '0.9cm';
    this.pdfExportComponent.fileName = 'Receipt ' + new Date().toLocaleString();
    this.pdfExportComponent.saveAs();
  }
}

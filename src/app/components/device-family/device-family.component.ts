import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { GridDataResult, PageChangeEvent, CellClickEvent } from '@progress/kendo-angular-grid';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';
import { NotificationService } from '@progress/kendo-angular-notification';
import { ICON } from 'src/app/services/app.interface';

@Component({
  selector: 'app-device-family',
  templateUrl: './device-family.component.html',
  styleUrls: ['./device-family.component.scss'],
  standalone: false
})
export class DeviceFamilyComponent implements OnInit {
  readonly ICON = ICON;
  public pageSize = 25;
  public skip = 0;
  private originalData: any[] = [];
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  public selectedCustomerID: number | null = null;
  public selectedDeviceFamilyId: number | null = null;
  public selectedActive: boolean = true; // Default to checked (true)
  public searchText: string = ''; // Search across all columns

  public deviceFamilies: any[] = []; // For dropdown filter
  public customersList: any[] = []; // For dialog dropdown

  public isDialogOpen = false;
  public isEditMode = false;
  public isViewMode = false;
  public originalIsActive: boolean = true; // Track original active state for validation (matching TFS pActive)
  public deviceFamilyData: any = {
    deviceFamilyId: -1,
    deviceFamilyName: '',
    customerID: null,
    isActive: true
  };

  public columnData: any[] = [
    { field: 'customerName', title: 'Customer', width: 200 },
    { field: 'deviceFamilyName', title: 'Device Family', width: 200 },
    { field: 'createdOn', title: 'CreatedOn', width: 150 }
  ];

  selectedRowIndex: number = -1;

  readonly filterSettings: DropDownFilterSettings = {
    operator: 'contains',
    caseSensitive: false
  };

  rowCallback = (context: any) => {
    return {
      'highlighted-row': context.index === this.selectedRowIndex
    };
  };

  selectableSettings: any = {
    checkboxOnly: true,
    mode: 'single',
  };

  columnMenuSettings: any = {
    lock: false,
    stick: false,
    setColumnPosition: { expanded: true },
    autoSizeColumn: true,
    autoSizeAllColumns: true,
  };

  get customers(): any[] {
    // Always get fresh data from masterData
    if (this.appService.masterData && 
        this.appService.masterData.entityMap && 
        this.appService.masterData.entityMap.Customer) {
      return this.appService.masterData.entityMap.Customer;
    }
    return [];
  }

  constructor(
    private apiService: ApiService,
    public appService: AppService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    // Load customers list for dialog dropdown
    this.loadCustomers();
    
    // Load all device families initially (filtered by active status)
    this.loadGridData();
  }

  loadCustomers(): void {
    if (this.appService.masterData && 
        this.appService.masterData.entityMap && 
        this.appService.masterData.entityMap.Customer) {
      this.customersList = this.appService.masterData.entityMap.Customer;
    } else {
      this.customersList = [];
    }
  }

  onCustomerChange(customerId?: number | null): void {
    console.log('=== onCustomerChange START ===');
    console.log('customerId parameter:', customerId);
    console.log('this.selectedCustomerID:', this.selectedCustomerID);
    
    // Use the parameter if provided and valid, otherwise use the component property
    // The ngModelChange event passes the new value
    let selectedId: number | null = null;
    if (customerId !== undefined && customerId !== null && customerId !== -1) {
      selectedId = customerId;
    } else if (this.selectedCustomerID !== null && this.selectedCustomerID !== undefined && this.selectedCustomerID !== -1) {
      selectedId = this.selectedCustomerID;
    }
    
    console.log('Final selectedId:', selectedId);
    
    // When customer changes, load device families for that customer - similar to original TFS code
    this.selectedDeviceFamilyId = null; // Reset device family selection
    this.deviceFamilies = []; // Clear existing device families
    
    // Check if a valid customer is selected
    if (selectedId != null && selectedId !== -1 && selectedId !== undefined) {
      console.log('Loading device families for customer ID:', selectedId);
      // Load device families for selected customer (pass null for active to get all for dropdown)
      this.apiService.searchDeviceFamily(selectedId, null, null).subscribe({
        next: (data: any) => {
          console.log('=== API Response ===');
          console.log('Response type:', typeof data);
          console.log('Is array:', Array.isArray(data));
          console.log('Data:', data);
          console.log('Data length:', data?.length);
          
          // Handle response - could be array or object with data property
          let responseData: any[] = [];
          if (Array.isArray(data)) {
            responseData = data;
          } else if (data && data.data && Array.isArray(data.data)) {
            responseData = data.data;
          } else if (data && typeof data === 'object') {
            // Try to extract array from object
            responseData = Object.values(data).find((val: any) => Array.isArray(val)) as any[] || [];
          }
          
          console.log('Processed responseData:', responseData);
          console.log('Processed responseData length:', responseData.length);
          
          // Get unique device families for the dropdown
          const uniqueFamilies = new Map();
          if (responseData && responseData.length > 0) {
            responseData.forEach((item: any, index: number) => {
              console.log(`Processing item ${index}:`, item);
              // Handle both camelCase and PascalCase field names
              const deviceFamilyId = item.deviceFamilyId || item.DeviceFamilyId;
              const deviceFamilyName = item.deviceFamilyName || item.DeviceFamilyName;
              
              console.log(`  deviceFamilyId: ${deviceFamilyId}, deviceFamilyName: ${deviceFamilyName}`);
              
              if (deviceFamilyId && deviceFamilyId !== null && deviceFamilyId !== -1 && !uniqueFamilies.has(deviceFamilyId)) {
                uniqueFamilies.set(deviceFamilyId, {
                  deviceFamilyId: deviceFamilyId,
                  deviceFamilyName: deviceFamilyName
                });
              }
            });
          }
          
          // Set device families (no placeholder needed for combobox)
          this.deviceFamilies = Array.from(uniqueFamilies.values());
          console.log('=== Final deviceFamilies ===');
          console.log('Count:', this.deviceFamilies.length);
          console.log('Items:', this.deviceFamilies);
          
          // Force change detection to update the UI
          this.cdr.detectChanges();
          
          console.log('=== onCustomerChange END ===');
        },
        error: (error) => {
          console.error('=== API Error ===');
          console.error('Error loading device families:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          this.deviceFamilies = [];
          this.showNotification('Error loading device families: ' + (error?.message || 'Unknown error'), 'error');
        }
      });
    } else {
      // If no customer selected, clear device family dropdown
      console.log('No valid customer selected, clearing device families');
      this.deviceFamilies = [];
    }
  }

  loadGridData(): void {
    // If checkbox is checked (selectedActive = true), show only active records
    // If checkbox is unchecked (selectedActive = false), show only inactive records
    const active = this.selectedActive === true ? true : false;

    // Load all data, filtering only by active status (search is done client-side)
    this.apiService.searchDeviceFamily(null, null, active).subscribe({
      next: (data: any[]) => {
        this.processGridData(data);
      },
      error: (error) => {
        this.showNotification('Error loading device families', 'error');
        console.error('Error loading device families:', error);
      }
    });
  }

  private processGridData(data: any[]): void {
    // Normalize property names (handle both PascalCase and camelCase from API)
    this.originalData = data.map((item, index) => {
      // Handle active property - check both camelCase and PascalCase
      let activeValue: boolean;
      if (item.hasOwnProperty('active')) {
        activeValue = Boolean(item.active);
      } else if (item.hasOwnProperty('Active')) {
        activeValue = Boolean(item.Active);
      } else {
        // Default to false if property doesn't exist
        activeValue = false;
      }
      
      const normalizedItem = {
        ...item,
        active: activeValue,
        deviceFamilyId: item.deviceFamilyId !== undefined ? item.deviceFamilyId : item.DeviceFamilyId,
        deviceFamilyName: item.deviceFamilyName !== undefined ? item.deviceFamilyName : item.DeviceFamilyName,
        customerID: item.customerID !== undefined ? item.customerID : item.CustomerID,
        customerName: item.customerName !== undefined ? item.customerName : item.CustomerName,
        createdOn: item.createdOn !== undefined ? item.createdOn : item.CreatedOn
      };
      
      // Log first 3 items to debug active status
      if (index < 3) {
        console.log(`Item ${index}:`, {
          original: { active: item.active, Active: item.Active },
          normalized: normalizedItem.active,
          deviceFamilyName: normalizedItem.deviceFamilyName
        });
      }
      
      return normalizedItem;
    });
    
    // Log summary of active/inactive counts
    const activeCount = this.originalData.filter(item => item.active === true).length;
    const inactiveCount = this.originalData.filter(item => item.active === false).length;
    console.log(`Total records: ${this.originalData.length}, Active: ${activeCount}, Inactive: ${inactiveCount}`);
    
    this.pageData();
  }

  pageData(): void {
    const filteredData = this.filterData(this.originalData);
    // Pass all filtered data to grid, let grid handle pagination
    this.gridDataResult = {
      data: filteredData,
      total: filteredData.length
    };
  }

  filterData(data: any[]): any[] {
    // Active filtering is handled in loadGridData() at the API level:
    // - When selectedActive is true: fetches only active records (active=true)
    // - When selectedActive is false: fetches only inactive records (active=false)
    // Additional client-side filtering for search text across all columns
    if (!this.searchText || this.searchText.trim() === '') {
      return data;
    }
    
    const searchLower = this.searchText.toLowerCase().trim();
    return data.filter(item => {
      // Search across all visible columns
      const customerName = (item.customerName || '').toString().toLowerCase();
      const deviceFamilyName = (item.deviceFamilyName || '').toString().toLowerCase();
      const createdOn = (item.createdOn || '').toString().toLowerCase();
      
      return customerName.includes(searchLower) ||
             deviceFamilyName.includes(searchLower) ||
             createdOn.includes(searchLower);
    });
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.pageSize = event.take;
    // Grid handles pagination automatically with kendoGridBinding
  }

  onClear(): void {
    // Reset all filters
    this.selectedActive = true;
    this.searchText = '';
    this.skip = 0;
    this.loadGridData();
  }

  onSearchTextChange(): void {
    this.skip = 0;
    this.pageData(); // Re-filter the existing data
  }

  onCellClick(event: CellClickEvent): void {
    if (event.dataItem) {
      this.selectedRowIndex = event.rowIndex;
    }
  }

  onEdit(dataItem: any): void {
    if (dataItem) {
      this.selectedRowIndex = -1;
      this.deviceFamilyData = {
        deviceFamilyId: dataItem.deviceFamilyId,
        deviceFamilyName: dataItem.deviceFamilyName,
        customerID: dataItem.customerID,
        isActive: dataItem.active
      };
      // Track original active state for validation (matching TFS pActive)
      this.originalIsActive = this.deviceFamilyData.isActive;
      this.isEditMode = true;
      this.isViewMode = false;
      this.isDialogOpen = true;
    }
  }

  onView(dataItem: any): void {
    if (dataItem) {
      this.selectedRowIndex = -1;
      this.deviceFamilyData = {
        deviceFamilyId: dataItem.deviceFamilyId,
        deviceFamilyName: dataItem.deviceFamilyName,
        customerID: dataItem.customerID,
        isActive: dataItem.active
      };
      // Track original active state for validation (matching TFS pActive)
      this.originalIsActive = this.deviceFamilyData.isActive;
      this.isEditMode = false;
      this.isViewMode = true;
      this.isDialogOpen = true;
    }
  }

  openAddDialog(): void {
    // Ensure customersList is populated from getter before opening dialog
    // Kendo combobox in dialog needs a stable property reference
    this.customersList = [...this.customers]; // Create a new array reference
    
    this.originalIsActive = true; // Reset original active state for Add mode
    this.deviceFamilyData = {
      deviceFamilyId: -1,
      deviceFamilyName: '',
      customerID: null,
      isActive: true // In Add mode, always true (matching TFS behavior - checkbox is disabled but checked)
    };
    this.isEditMode = false;
    this.isViewMode = false;
    this.isDialogOpen = true;
    
    console.log('Dialog opened. customersList populated:', this.customersList?.length || 0);
    if (this.customersList && this.customersList.length > 0) {
      console.log('Sample customer:', this.customersList[0]);
      console.log('Customer fields:', Object.keys(this.customersList[0]));
    }
    
    // Force change detection after a tick to ensure combobox updates
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.isViewMode = false;
    this.originalIsActive = true; // Reset original active state
    this.deviceFamilyData = {
      deviceFamilyId: -1,
      deviceFamilyName: '',
      customerID: null,
      isActive: true
    };
  }

  validateDeviceFamily(): boolean {
    // Matching TFS Validation() method (line 167)
    let isValid = true;
    const errorMessages: string[] = [];

    // Customer validation (matching TFS line 174-184)
    if (!this.deviceFamilyData.customerID || this.deviceFamilyData.customerID === -1 || this.deviceFamilyData.customerID === null) {
      errorMessages.push('Please Select Customer.');
    }

    // Device Family Name validation (matching TFS line 185-195)
    if (!this.deviceFamilyData.deviceFamilyName || this.deviceFamilyData.deviceFamilyName.trim() === '') {
      errorMessages.push('Please Enter Device Family.');
    }

    // Inactive record validation (matching TFS line 196)
    // TFS checks: pMode.ToLower().Contains("edit") && !chkactive.IsChecked && !pActive
    // This means: in Edit mode, if checkbox is unchecked AND original was inactive
    if (this.isEditMode && !this.deviceFamilyData.isActive && !this.originalIsActive) {
      errorMessages.push("Inactive record can't be modified.");
    }

    // Show all error messages
    if (errorMessages.length > 0) {
      const errorMessage = errorMessages.join('\n');
      this.showNotification(errorMessage, 'error');
      isValid = false;
    }

    return isValid;
  }

  saveDeviceFamily(): void {
    // Comprehensive validation matching TFS Validation() method
    if (!this.validateDeviceFamily()) {
      return; // Validation failed, error messages already shown
    }

    const request = {
      deviceFamilyId: this.deviceFamilyData.deviceFamilyId,
      deviceFamilyName: this.deviceFamilyData.deviceFamilyName,
      customerID: this.deviceFamilyData.customerID,
      // In Add mode, always set isActive to true (matching TFS line 134: else objtemp.isActive = true)
      isActive: this.isEditMode ? this.deviceFamilyData.isActive : true,
      createdBy: 0 // Backend will override this from token, but sending 0 for now
    };

    this.apiService.addUpdateDeviceFamily(request).subscribe({
      next: (result) => {
        if (result >= 0) {
          this.showNotification(
            this.isEditMode ? 'Device family updated successfully' : 'Device family added successfully',
            'success'
          );
          this.closeDialog();
          this.loadGridData();
        } else {
          this.showNotification('Device family already exists or operation failed', 'error');
        }
      },
      error: (error) => {
        console.error('Error saving device family:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        
        let errorMessage = 'Error saving device family';
        if (error.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.showNotification(errorMessage, 'error');
      }
    });
  }

  getCustomerName(customerID: number | null): string {
    if (!customerID) return '';
    const customer = this.customersList.find(c => c.CustomerID === customerID);
    return customer ? customer.CustomerName : '';
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.notificationService.show({
      content: message,
      type: { style: type, icon: true },
      position: { horizontal: 'right', vertical: 'top' },
      animation: { type: 'fade', duration: 400 }
    });
  }
}


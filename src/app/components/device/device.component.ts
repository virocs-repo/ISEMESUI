import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GridDataResult, PageChangeEvent, CellClickEvent } from '@progress/kendo-angular-grid';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';
import { NotificationService } from '@progress/kendo-angular-notification';
import { ICON } from 'src/app/services/app.interface';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
  standalone: false
})
export class DeviceComponent implements OnInit {
  readonly ICON = ICON;
  public pageSize = 25;
  public skip = 0;
  private originalData: any[] = [];
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  public selectedCustomerID: number | null = null;
  public selectedDeviceAliasId: number | null = null;
  public selectedDeviceFamilyId: number | null = null;
  public selectedDeviceName: string = '';
  public selectedDeviceId: number | null = null;
  public selectedActive: boolean = true; // Default to checked (true)

  public deviceFamilies: any[] = [];
  public deviceAliases: any[] = [];
  public devices: any[] = [];
  public customersList: any[] = []; // For dialog dropdown
  
  // Dropdown data for form fields
  public partTypes: any[] = [{ value: 'N/A', text: 'N/A' }];
  public lotTypes: any[] = [
    { value: 'Standard', text: 'Standard' },
    { value: 'Non-Standard', text: 'Non-Standard' }
  ];
  public countriesOfOrigin: any[] = [];
  public materialDescriptions: any[] = [];
  public usHtsCodes: any[] = [];
  public eccns: any[] = [];
  public licenseExceptions: any[] = [];
  public restrictedCountries: any[] = [];
  public msls: any[] = [];
  public peakPackageBodyTemperatures: any[] = [];
  public shelfLifeMonths: any[] = [];
  public floorLives: any[] = [];
  public pbFrees: any[] = [];
  public pbFreeStickers: any[] = [];
  public rohses: any[] = [];
  public trayTubeStrappings: any[] = [];
  public trayStackings: any[] = [];
  public isDialogOpen = false;
  public isEditMode = false;
  public isViewMode = false;
  public deviceData: any = {
    deviceId: -1,
    deviceName: '',
    deviceFamilyId: null,
    customerID: null,
    isActive: false,
    // Device Info
    testDevice: '',
    reliabilityDevice: '',
    aliasNames: [] as string[],
    newAliasName: '',
    sku: '',
    partType: 'N/A',
    lotType: 'Standard',
    labelMapping: false,
    trayTubeMapping: 'Device',
    countryOfOriginId: null,
    unitCost: 0,
    // EAR Info
    materialDescriptionId: null,
    usHtsCodeId: null,
    eccnId: null,
    licenseExceptionId: null,
    restrictedCountriesToShipId: null,
    scheduleB: false,
    // Pack&Label Info
    mslId: null,
    peakPackageBodyTemperatureId: null,
    shelfLifeMonthId: null,
    floorLifeId: null,
    pbFreeId: null,
    pbFreeStickerId: null,
    rohsId: null,
    trayTubeStrappingId: null,
    trayStackingId: null
  };

  public columnData: any[] = [
    { field: 'customerName', title: 'Customer', width: 200 },
    { field: 'deviceFamily', title: 'Device Family', width: 200 },
    { field: 'device', title: 'Device', width: 200 },
    { field: 'testDevice', title: 'Test Device', width: 150 },
    { field: 'reliabilityDevice', title: 'Reliability Device', width: 150 },
    { field: 'deviceAlias', title: 'Device Alias', width: 150 },
    { field: 'createdOn', title: 'CreatedOn', width: 150 },
    { field: 'unitCost', title: 'UnitCost', width: 120 },
    { field: 'active', title: 'Active', width: 100 }
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
    this.loadCustomers();
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

  loadGridData(): void {
    // When search is triggered, use selected filters; otherwise load all data
    const customerID = this.selectedCustomerID && this.selectedCustomerID !== -1 ? this.selectedCustomerID : null;
    const deviceFamilyId = this.selectedDeviceFamilyId && this.selectedDeviceFamilyId !== -1 ? this.selectedDeviceFamilyId : null;
    const deviceName = this.selectedDeviceName && this.selectedDeviceName.trim() !== '' ? this.selectedDeviceName.trim() : null;
    // Pass active parameter: if selectedActive is true, pass true (show only active), if false, pass false (show only inactive)
    const active = this.selectedActive === true ? true : false;

    this.apiService.searchDevice(customerID, deviceFamilyId, deviceName, active).subscribe({
      next: (data: any[]) => {
        // Normalize property names (handle both PascalCase and camelCase from API)
        this.originalData = data.map((item, index) => {
          // Handle active property - check both camelCase and PascalCase
          let activeValue: boolean;
          if (item.hasOwnProperty('active')) {
            activeValue = Boolean(item.active);
          } else if (item.hasOwnProperty('Active')) {
            activeValue = Boolean(item.Active);
          } else {
            activeValue = false;
          }
          
          // Get device alias - try multiple sources
          let deviceAliasValue = '';
          if (item.deviceAlias !== undefined && item.deviceAlias !== null && item.deviceAlias !== '') {
            deviceAliasValue = item.deviceAlias;
          } else if (item.DeviceAlias !== undefined && item.DeviceAlias !== null && item.DeviceAlias !== '') {
            deviceAliasValue = item.DeviceAlias;
          } else if (item.customerDevice !== undefined && item.customerDevice !== null && item.customerDevice !== '') {
            deviceAliasValue = item.customerDevice;
          } else if (item.CustomerDevice !== undefined && item.CustomerDevice !== null && item.CustomerDevice !== '') {
            deviceAliasValue = item.CustomerDevice;
          }
          
          const normalizedItem = {
            ...item,
            active: activeValue,
            deviceId: item.deviceId !== undefined ? item.deviceId : item.DeviceId,
            device: item.device !== undefined ? item.device : item.Device,
            deviceFamily: item.deviceFamily !== undefined ? item.deviceFamily : item.DeviceFamily,
            deviceFamilyId: item.deviceFamilyId !== undefined ? item.deviceFamilyId : item.DeviceFamilyId,
            customerName: item.customerName !== undefined ? item.customerName : item.CustomerName,
            customerId: item.customerId !== undefined ? item.customerId : item.CustomerId,
            customerDevice: item.customerDevice !== undefined ? item.customerDevice : item.CustomerDevice,
            createdOn: item.createdOn !== undefined ? item.createdOn : item.CreatedOn,
            // Handle additional fields from stored procedure
            testDevice: item.testDevice !== undefined ? item.testDevice : (item.TestDevice !== undefined ? item.TestDevice : ''),
            reliabilityDevice: item.reliabilityDevice !== undefined ? item.reliabilityDevice : (item.ReliabilityDevice !== undefined ? item.ReliabilityDevice : ''),
            deviceAlias: deviceAliasValue,
            unitCost: item.unitCost !== undefined ? item.unitCost : (item.UnitCost !== undefined ? item.UnitCost : 0)
          };
          
          // Log first item to debug device alias
          if (data.indexOf(item) === 0) {
            console.log('Device search - First item:', {
              original: {
                deviceAlias: item.deviceAlias,
                DeviceAlias: item.DeviceAlias,
                customerDevice: item.customerDevice,
                CustomerDevice: item.CustomerDevice
              },
              normalized: {
                deviceAlias: normalizedItem.deviceAlias,
                customerDevice: normalizedItem.customerDevice
              }
            });
          }
          
          return normalizedItem;
        });
        this.pageData();
      },
      error: (error) => {
        this.showNotification('Error loading devices', 'error');
        console.error('Error loading devices:', error);
      }
    });
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
    // Active filtering is now handled in loadGridData() at the API level:
    // - When selectedActive is true: fetches only active records (active=true)
    // - When selectedActive is false: fetches only inactive records (active=false)
    // No additional client-side filtering needed
    return data;
  }

  onCustomerChange(customerId?: number | null): void {
    let selectedId: number | null = null;
    if (customerId !== undefined && customerId !== null && customerId !== -1) {
      selectedId = customerId;
    } else if (this.selectedCustomerID !== null && this.selectedCustomerID !== undefined && this.selectedCustomerID !== -1) {
      selectedId = this.selectedCustomerID;
    }
    
    // When customer changes, reset dependent dropdowns
    this.selectedDeviceFamilyId = null;
    this.selectedDeviceAliasId = null;
    this.selectedDeviceId = null;
    this.deviceFamilies = [];
    this.deviceAliases = [];
    this.devices = [];
    
    if (selectedId != null && selectedId !== -1 && selectedId !== undefined) {
      this.loadDeviceFamilies(selectedId);
      // Note: Device aliases would need to be loaded from API if available
    }
  }

  onDeviceFamilyChange(deviceFamilyId?: number | null): void {
    console.log('=== onDeviceFamilyChange START ===');
    console.log('deviceFamilyId parameter:', deviceFamilyId);
    console.log('this.selectedDeviceFamilyId:', this.selectedDeviceFamilyId);
    console.log('this.selectedCustomerID:', this.selectedCustomerID);
    
    // Use the parameter if provided and valid, otherwise use the component property
    let selectedId: number | null = null;
    if (deviceFamilyId !== undefined && deviceFamilyId !== null && deviceFamilyId !== -1) {
      selectedId = deviceFamilyId;
    } else if (this.selectedDeviceFamilyId !== null && this.selectedDeviceFamilyId !== undefined && this.selectedDeviceFamilyId !== -1) {
      selectedId = this.selectedDeviceFamilyId;
    }
    
    console.log('Final selectedId:', selectedId);
    
    // When device family changes, reset device and device alias dropdowns
    this.selectedDeviceId = null;
    this.selectedDeviceAliasId = null;
    this.devices = [];
    this.deviceAliases = [];
    
    // Only load devices and aliases if both customer and device family are selected
    if (selectedId != null && selectedId !== -1) {
      const customerID = this.selectedCustomerID && this.selectedCustomerID !== -1 ? this.selectedCustomerID : null;
      if (customerID != null && customerID !== -1) {
        console.log('Loading devices for customerID:', customerID, 'deviceFamilyId:', selectedId);
        // Load devices for the dropdown
        this.loadDevicesForFilter(selectedId);
        // Load device aliases for the dropdown (by customer and device family)
        this.loadDeviceAliasesForFilter(customerID, selectedId);
      } else {
        console.log('Customer not selected, cannot load devices');
        this.devices = [];
        this.deviceAliases = [];
      }
    } else {
      console.log('No valid device family ID selected, clearing devices');
      this.devices = [];
      this.deviceAliases = [];
    }
    console.log('=== onDeviceFamilyChange END ===');
  }

  loadDeviceFamilies(customerID: number): void {
    this.apiService.searchDeviceFamily(customerID, null, null).subscribe({
      next: (data: any[]) => {
        // Get unique device families for the dropdown
        const uniqueFamilies = new Map();
        if (data && data.length > 0) {
          data.forEach((item: any) => {
            const deviceFamilyId = item.deviceFamilyId || item.DeviceFamilyId;
            const deviceFamilyName = item.deviceFamilyName || item.DeviceFamilyName;
            
            if (deviceFamilyId && deviceFamilyId !== null && deviceFamilyId !== -1 && !uniqueFamilies.has(deviceFamilyId)) {
              uniqueFamilies.set(deviceFamilyId, {
                deviceFamilyId: deviceFamilyId,
                deviceFamilyName: deviceFamilyName
              });
            }
          });
        }
        this.deviceFamilies = Array.from(uniqueFamilies.values());
      },
      error: (error) => {
        console.error('Error loading device families:', error);
        this.deviceFamilies = [];
      }
    });
  }

  loadDevicesForFilter(deviceFamilyId: number): void {
    const customerID = this.selectedCustomerID && this.selectedCustomerID !== -1 ? this.selectedCustomerID : null;
    console.log('Loading devices for filter - customerID:', customerID, 'deviceFamilyId:', deviceFamilyId);
    
    if (!customerID || customerID === -1) {
      console.log('Customer ID is required to load devices');
      this.devices = [];
      return;
    }
    
    // For dropdown filter, pass null for active to get all devices
    this.apiService.searchDevice(customerID, deviceFamilyId, null, null).subscribe({
      next: (data: any[]) => {
        console.log('Devices API response:', data);
        // Get unique devices for the dropdown
        const uniqueDevices = new Map();
        if (data && data.length > 0) {
          data.forEach((item: any) => {
            // Handle both PascalCase and camelCase from API
            const deviceId = item.deviceId || item.DeviceId;
            const deviceName = item.device || item.Device || item.deviceName || item.DeviceName;
            
            if (deviceId && deviceId !== null && deviceId !== -1 && !uniqueDevices.has(deviceId)) {
              uniqueDevices.set(deviceId, {
                deviceId: deviceId,
                deviceName: deviceName
              });
            }
          });
        }
        this.devices = Array.from(uniqueDevices.values());
        console.log('Loaded devices for dropdown:', this.devices.length, this.devices);
      },
      error: (error) => {
        console.error('Error loading devices:', error);
        this.devices = [];
      }
    });
  }

  loadDeviceAliasesForFilter(customerID: number, deviceFamilyId: number, deviceId?: number | null): void {
    console.log('Loading device aliases for filter - customerID:', customerID, 'deviceFamilyId:', deviceFamilyId, 'deviceId:', deviceId);
    
    if (!customerID || customerID === -1 || !deviceFamilyId || deviceFamilyId === -1) {
      console.log('Customer ID and Device Family ID are required to load device aliases');
      this.deviceAliases = [];
      return;
    }
    
    // Use deviceId = -1 to get all aliases for the device family (matching TFS behavior)
    // If deviceId is provided and valid (> 0), use it; otherwise use -1 to get all aliases for the family
    const deviceIdToUse = (deviceId !== null && deviceId !== undefined && deviceId !== -1 && deviceId > 0) ? deviceId : -1;
    
    console.log('Calling getDeviceAlias API with deviceIdToUse:', deviceIdToUse);
    this.apiService.getDeviceAlias(customerID, deviceFamilyId, deviceIdToUse).subscribe({
      next: (data: any[]) => {
        console.log('Device Aliases API response:', data);
        // Get unique device aliases for the dropdown
        const uniqueAliases = new Map();
        if (data && data.length > 0) {
          data.forEach((item: any) => {
            // Handle both PascalCase and camelCase from API
            const aliasId = item.deviceAliasId || item.DeviceAliasId || item.aliasId || item.AliasId;
            const aliasName = item.deviceAliasName || item.DeviceAliasName || item.aliasName || item.AliasName;
            
            if (aliasId && aliasId !== null && aliasId !== -1 && aliasId > 0 && !uniqueAliases.has(aliasId)) {
              uniqueAliases.set(aliasId, {
                deviceAliasId: aliasId,
                deviceAliasName: aliasName
              });
            }
          });
        }
        this.deviceAliases = Array.from(uniqueAliases.values());
        console.log('Loaded device aliases for dropdown:', this.deviceAliases.length, this.deviceAliases);
      },
      error: (error) => {
        console.error('Error loading device aliases:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        this.deviceAliases = [];
      }
    });
  }

  onDeviceChange(deviceId?: number | null): void {
    console.log('=== onDeviceChange START ===');
    console.log('deviceId parameter:', deviceId);
    console.log('this.selectedDeviceId:', this.selectedDeviceId);
    
    // When device changes, reload device aliases if customer and device family are selected
    const customerID = this.selectedCustomerID && this.selectedCustomerID !== -1 ? this.selectedCustomerID : null;
    const deviceFamilyId = this.selectedDeviceFamilyId && this.selectedDeviceFamilyId !== -1 ? this.selectedDeviceFamilyId : null;
    
    if (customerID && deviceFamilyId) {
      // Use the parameter if provided, otherwise use the component property
      const selectedDeviceId = (deviceId !== undefined && deviceId !== null && deviceId !== -1) 
        ? deviceId 
        : ((this.selectedDeviceId !== null && this.selectedDeviceId !== undefined && this.selectedDeviceId !== -1) 
            ? this.selectedDeviceId 
            : null);
      
      console.log('Reloading device aliases for deviceId:', selectedDeviceId);
      this.loadDeviceAliasesForFilter(customerID, deviceFamilyId, selectedDeviceId);
    } else {
      console.log('Customer or Device Family not selected, cannot load device aliases');
      this.deviceAliases = [];
    }
    console.log('=== onDeviceChange END ===');
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.pageSize = event.take;
    // Grid handles pagination automatically with kendoGridBinding
  }

  onSearch(): void {
    this.skip = 0;
    this.loadGridData();
  }

  onClear(): void {
    // Reset all filters
    this.selectedCustomerID = null;
    this.selectedDeviceAliasId = null;
    this.selectedDeviceFamilyId = null;
    this.selectedDeviceName = '';
    this.selectedDeviceId = null;
    this.selectedActive = true;
    this.deviceFamilies = [];
    this.deviceAliases = [];
    this.devices = [];
    this.skip = 0;
    this.loadGridData();
  }

  onCellClick(event: CellClickEvent): void {
    if (event.dataItem) {
      this.selectedRowIndex = event.rowIndex;
    }
  }

  onEdit(dataItem: any): void {
    if (dataItem) {
      this.selectedRowIndex = -1;
      // Load dropdown data before opening dialog
      this.loadAllDropdownData();
      this.deviceData = {
        deviceId: dataItem.deviceId,
        deviceName: dataItem.device,
        deviceFamilyId: dataItem.deviceFamilyId,
        customerID: dataItem.customerId,
        isActive: dataItem.active
      };
      this.isEditMode = true;
      this.isViewMode = false;
      this.isDialogOpen = true;
      if (this.deviceData.customerID) {
        this.selectedCustomerID = this.deviceData.customerID;
        this.loadDeviceFamiliesForDialog();
      }
    }
  }

  onView(dataItem: any): void {
    if (dataItem) {
      this.selectedRowIndex = -1;
      // Load dropdown data before opening dialog
      this.loadAllDropdownData();
      this.deviceData = {
        deviceId: dataItem.deviceId || dataItem.DeviceId,
        deviceName: dataItem.device || dataItem.Device,
        deviceFamilyId: dataItem.deviceFamilyId || dataItem.DeviceFamilyId,
        customerID: dataItem.customerId || dataItem.CustomerId,
        isActive: dataItem.active || dataItem.Active,
        testDevice: dataItem.testDevice || dataItem.TestDevice || '',
        reliabilityDevice: dataItem.reliabilityDevice || dataItem.ReliabilityDevice || '',
        aliasNames: dataItem.aliasNames || [],
        newAliasName: '',
        sku: dataItem.sku || dataItem.SKU || '',
        partType: dataItem.partType || dataItem.PartType || 'N/A',
        lotType: dataItem.lotType || dataItem.LotType || 'Standard',
        labelMapping: dataItem.labelMapping || false,
        trayTubeMapping: dataItem.trayTubeMapping || dataItem.TrayTubeMapping || 'Device',
        countryOfOriginId: dataItem.countryOfOriginId || dataItem.CountryOfOriginId || null,
        unitCost: dataItem.unitCost || dataItem.UnitCost || 0,
        materialDescriptionId: dataItem.materialDescriptionId || null,
        usHtsCodeId: dataItem.usHtsCodeId || null,
        eccnId: dataItem.eccnId || null,
        licenseExceptionId: dataItem.licenseExceptionId || null,
        restrictedCountriesToShipId: dataItem.restrictedCountriesToShipId || null,
        scheduleB: dataItem.scheduleB || false,
        mslId: dataItem.mslId || null,
        peakPackageBodyTemperatureId: dataItem.peakPackageBodyTemperatureId || null,
        shelfLifeMonthId: dataItem.shelfLifeMonthId || null,
        floorLifeId: dataItem.floorLifeId || null,
        pbFreeId: dataItem.pbFreeId || null,
        pbFreeStickerId: dataItem.pbFreeStickerId || null,
        rohsId: dataItem.rohsId || null,
        trayTubeStrappingId: dataItem.trayTubeStrappingId || null,
        trayStackingId: dataItem.trayStackingId || null
      };
      this.isEditMode = false;
      this.isViewMode = true;
      this.isDialogOpen = true;
      if (this.deviceData.customerID) {
        this.selectedCustomerID = this.deviceData.customerID;
        this.loadDeviceFamiliesForDialog();
      }
    }
  }

  openAddDialog(): void {
    // Ensure customersList is populated from getter before opening dialog
    // Kendo combobox in dialog needs a stable property reference
    this.customersList = [...this.customers]; // Create a new array reference
    
    // Load all dropdown data
    this.loadAllDropdownData();
    
    // Force change detection after a tick to ensure combobox updates
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
    
    this.deviceData = {
      deviceId: -1,
      deviceName: '',
      deviceFamilyId: null,
      customerID: null,
      isActive: false,
      testDevice: '',
      reliabilityDevice: '',
      aliasNames: [],
      newAliasName: '',
      sku: '',
      partType: 'N/A',
      lotType: 'Standard',
      labelMapping: false,
      trayTubeMapping: 'Device',
      countryOfOriginId: null,
      unitCost: 0,
      materialDescriptionId: null,
      usHtsCodeId: null,
      eccnId: null,
      licenseExceptionId: null,
      restrictedCountriesToShipId: null,
      scheduleB: false,
      mslId: null,
      peakPackageBodyTemperatureId: null,
      shelfLifeMonthId: null,
      floorLifeId: null,
      pbFreeId: null,
      pbFreeStickerId: null,
      rohsId: null,
      trayTubeStrappingId: null,
      trayStackingId: null
    };
    this.isEditMode = false;
    this.isViewMode = false;
    this.isDialogOpen = true;
    this.deviceFamilies = [];
    
    console.log('Dialog opened. customersList populated:', this.customersList?.length || 0);
  }
  
  loadAllDropdownData(): void {
    console.log('=== loadAllDropdownData called ===');
    
    // Load Country of Origin from masterData (matches pattern from other components)
    if (this.appService.masterData && this.appService.masterData.coo) {
      this.countriesOfOrigin = this.appService.masterData.coo.map((item: any) => ({
        id: item.masterListItemId || item.MasterListItemId,
        name: item.itemText || item.ItemText
      }));
      console.log('Countries of Origin loaded:', this.countriesOfOrigin.length);
    } else {
      console.warn('masterData.coo not available');
    }
    
    // Load all other dropdowns from master list API
    // IMPORTANT: List names must match the MasterList table ListName column values in your database
    // If you get 404 warnings, query your database: SELECT DISTINCT ListName FROM MasterList
    // Then update the list names below to match your database values
    
    // TODO: Update these list names to match your MasterList table ListName values
    // Common patterns to try if these don't work:
    // - With spaces: "Material Description", "US HTS Code"
    // - Different casing: "materialdescription", "MaterialDescription"
    this.loadMasterListDropdown('MaterialDescription', 'materialDescriptions');
    this.loadMasterListDropdown('USHTSCode', 'usHtsCodes');
    this.loadMasterListDropdown('ECCN', 'eccns');
    this.loadMasterListDropdown('LicenseException', 'licenseExceptions');
    this.loadMasterListDropdown('RestrictedCountriesToShip', 'restrictedCountries');
    this.loadMasterListDropdown('MSL', 'msls');
    this.loadMasterListDropdown('PeakPackageBodyTemperature', 'peakPackageBodyTemperatures');
    this.loadMasterListDropdown('ShelfLifeMonth', 'shelfLifeMonths');
    this.loadMasterListDropdown('FloorLife', 'floorLives');
    this.loadMasterListDropdown('PBFree', 'pbFrees');
    this.loadMasterListDropdown('PBFreeSticker', 'pbFreeStickers');
    this.loadMasterListDropdown('ROHS', 'rohses');
    this.loadMasterListDropdown('TrayTubeStrapping', 'trayTubeStrappings');
    this.loadMasterListDropdown('TrayStacking', 'trayStackings');
  }

  loadMasterListDropdown(listName: string, propertyName: string): void {
    this.apiService.getMasterListItems(listName, null).subscribe({
      next: (data: any) => {
        // API returns array directly with masterListItemId and itemText properties
        if (data && Array.isArray(data) && data.length > 0) {
          const mappedData = data.map((item: any) => ({
            id: item.masterListItemId || item.MasterListItemId || item.masterListItemID,
            name: item.itemText || item.ItemText || item.itemtext
          }));
          (this as any)[propertyName] = mappedData;
          console.log(`✓ Loaded ${propertyName}: ${mappedData.length} items`);
          // Trigger change detection after loading to update UI
          this.cdr.detectChanges();
        } else {
          console.warn(`⚠ No data returned for list: ${listName}`);
        }
      },
      error: (error: any) => {
        // 404 means list doesn't exist in database - silently handle it
        // Dropdown will remain empty until the list is created in the database
        if (error.status !== 404) {
          console.error(`✗ Error loading '${listName}':`, error.status, error.message);
        }
        // Keep empty array on error - dropdown will remain empty
      }
    });
  }

  addAliasName(): void {
    if (this.deviceData.newAliasName && this.deviceData.newAliasName.trim() !== '') {
      if (!this.deviceData.aliasNames) {
        this.deviceData.aliasNames = [];
      }
      if (!this.deviceData.aliasNames.includes(this.deviceData.newAliasName.trim())) {
        this.deviceData.aliasNames.push(this.deviceData.newAliasName.trim());
      }
      this.deviceData.newAliasName = '';
    }
  }
  
  removeAliasName(alias: string): void {
    if (this.deviceData.aliasNames) {
      const index = this.deviceData.aliasNames.indexOf(alias);
      if (index > -1) {
        this.deviceData.aliasNames.splice(index, 1);
      }
    }
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.isViewMode = false;
    this.deviceData = {
      deviceId: -1,
      deviceName: '',
      deviceFamilyId: null,
      customerID: null,
      isActive: false,
      testDevice: '',
      reliabilityDevice: '',
      aliasNames: [],
      newAliasName: '',
      sku: '',
      partType: 'N/A',
      lotType: 'Standard',
      labelMapping: false,
      trayTubeMapping: 'Device',
      countryOfOriginId: null,
      unitCost: 0,
      materialDescriptionId: null,
      usHtsCodeId: null,
      eccnId: null,
      licenseExceptionId: null,
      restrictedCountriesToShipId: null,
      scheduleB: false,
      mslId: null,
      peakPackageBodyTemperatureId: null,
      shelfLifeMonthId: null,
      floorLifeId: null,
      pbFreeId: null,
      pbFreeStickerId: null,
      rohsId: null,
      trayTubeStrappingId: null,
      trayStackingId: null
    };
  }

  onDialogCustomerChange(customerId?: number | null): void {
    this.deviceData.deviceFamilyId = null;
    this.deviceFamilies = [];
    const selectedCustomerId = customerId !== undefined ? customerId : this.deviceData.customerID;
    if (selectedCustomerId) {
      this.loadDeviceFamiliesForDialog();
    }
  }

  loadDeviceFamiliesForDialog(): void {
    const customerID = this.deviceData.customerID;
    if (!customerID) {
      this.deviceFamilies = [];
      return;
    }
    this.apiService.searchDeviceFamily(customerID, null, null).subscribe({
      next: (data: any[]) => {
        // Get unique device families for the dropdown
        const uniqueFamilies = new Map();
        if (data && data.length > 0) {
          data.forEach((item: any) => {
            const deviceFamilyId = item.deviceFamilyId || item.DeviceFamilyId;
            const deviceFamilyName = item.deviceFamilyName || item.DeviceFamilyName;
            
            if (deviceFamilyId && deviceFamilyId !== null && deviceFamilyId !== -1 && !uniqueFamilies.has(deviceFamilyId)) {
              uniqueFamilies.set(deviceFamilyId, {
                deviceFamilyId: deviceFamilyId,
                deviceFamilyName: deviceFamilyName
              });
            }
          });
        }
        this.deviceFamilies = Array.from(uniqueFamilies.values());
      },
      error: (error) => {
        console.error('Error loading device families:', error);
        this.deviceFamilies = [];
      }
    });
  }

  saveDevice(): void {
    if (!this.deviceData.deviceName || !this.deviceData.deviceFamilyId || !this.deviceData.customerID || 
        !this.deviceData.testDevice || !this.deviceData.reliabilityDevice || !this.deviceData.lotType) {
      this.showNotification('Please fill in all required fields', 'warning');
      return;
    }

    const request = {
      deviceId: this.deviceData.deviceId,
      deviceName: this.deviceData.deviceName,
      deviceFamilyId: this.deviceData.deviceFamilyId,
      customerID: this.deviceData.customerID,
      isActive: this.deviceData.isActive,
      testDevice: this.deviceData.testDevice,
      reliabilityDevice: this.deviceData.reliabilityDevice,
      aliasNames: this.deviceData.aliasNames || [],
      sku: this.deviceData.sku,
      partType: this.deviceData.partType,
      lotType: this.deviceData.lotType,
      labelMapping: this.deviceData.labelMapping,
      trayTubeMapping: this.deviceData.trayTubeMapping,
      countryOfOriginId: this.deviceData.countryOfOriginId,
      unitCost: this.deviceData.unitCost,
      materialDescriptionId: this.deviceData.materialDescriptionId,
      usHtsCodeId: this.deviceData.usHtsCodeId,
      eccnId: this.deviceData.eccnId,
      licenseExceptionId: this.deviceData.licenseExceptionId,
      restrictedCountriesToShipId: this.deviceData.restrictedCountriesToShipId,
      scheduleB: this.deviceData.scheduleB,
      mslId: this.deviceData.mslId,
      peakPackageBodyTemperatureId: this.deviceData.peakPackageBodyTemperatureId,
      shelfLifeMonthId: this.deviceData.shelfLifeMonthId,
      floorLifeId: this.deviceData.floorLifeId,
      pbFreeId: this.deviceData.pbFreeId,
      pbFreeStickerId: this.deviceData.pbFreeStickerId,
      rohsId: this.deviceData.rohsId,
      trayTubeStrappingId: this.deviceData.trayTubeStrappingId,
      trayStackingId: this.deviceData.trayStackingId,
      createdBy: 0 // Will be set by backend from token
    };

    this.apiService.addUpdateDevice(request).subscribe({
      next: (result) => {
        if (result >= 0) {
          this.showNotification(
            this.isEditMode ? 'Device updated successfully' : 'Device added successfully',
            'success'
          );
          this.closeDialog();
          this.loadGridData();
        } else {
          this.showNotification('Device already exists or operation failed', 'error');
        }
      },
      error: (error) => {
        this.showNotification('Error saving device', 'error');
        console.error('Error saving device:', error);
      }
    });
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


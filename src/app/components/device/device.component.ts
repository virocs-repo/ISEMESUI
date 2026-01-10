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
  public searchText: string = ''; // Search across all columns

  public deviceFamilies: any[] = [];
  public deviceAliases: any[] = [];
  public devices: any[] = [];
  public customersList: any[] = []; // For dialog dropdown
  
  // Dropdown data for form fields
  public partTypes: any[] = [];
  public lotTypes: any[] = [];
  public countriesOfOrigin: any[] = [];
  public materialDescriptions: any[] = [];
  public usHtsCodes: any[] = [];
  public eccns: any[] = [];
  public licenseExceptions: any[] = [];
  public restrictedCountries: any[] = [];
  public customerLabels: any[] = []; // For Label1-Label5 dropdowns
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
  public isLabelDetailsDialogOpen = false;
  public labelDetailsData: any[] = [];
  public currentLabelName: string = '';
  public currentLabelNumber: number = 0; // Track which label number (1-5) triggered the dialog
  public labelTypeOptions: any[] = ['--Select--', 'Text', 'Database', 'Constant', 'Customer Service']; // Common label types with --Select-- first (matching TFS)
  public labelValueOptions: any[] = ['--Select--']; // Will be loaded based on selected type - start with --Select-- (matching TFS)
  public labelDetailsGridHeight: number = 0; // Auto-calculated height for compact grid
  public canEdit: boolean = true; // Track if device can be edited (from GetDeviceInfo)
  public canEditlotType: boolean = true; // Track if lot type can be edited (from GetDeviceInfo)
  public canEditLabel1: boolean = true; // Track if label1 can be edited (from GetDeviceInfo)
  public canEditLabel2: boolean = true; // Track if label2 can be edited (from GetDeviceInfo)
  public canEditLabel3: boolean = true; // Track if label3 can be edited (from GetDeviceInfo)
  public canEditLabel4: boolean = true; // Track if label4 can be edited (from GetDeviceInfo)
  public canEditLabel5: boolean = true; // Track if label5 can be edited (from GetDeviceInfo)
  public lastModifiedOn: string = ''; // Track last modified timestamp for optimistic locking
  public lockId: number = -1; // Track lock ID for optimistic locking
  public isDeviceInfoDialogOpen = false; // Track DeviceInfo dialog state
  public originalIsActive: boolean = true; // Track original active state for validation (matching TFS pActive)
  
  // Security feature flags (matching TFS EnableDisableBasedOnSecurity)
  public deviceEditEnabled: boolean = true; // EditDeviceDetails feature
  public labelEditEnabled: boolean = true; // EditLabels feature
  
  // Label dictionary for format string generation (matching TFS dicLabels)
  public labelDictionary: Map<string, string> = new Map<string, string>();
  public deviceInfoData: any = {
    canEdit: true,
    canEditlotType: true,
    canEditLabel1: true,
    canEditLabel2: true,
    canEditLabel3: true,
    canEditLabel4: true,
    canEditLabel5: true,
    lastModifiedOn: '',
    dqp: [] as any[],
    mf: [] as any[],
    trv: [] as any[],
    boards: [] as any[],
    deviceLabelInfo: [] as any[]
  };
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
    label1: null,
    label2: null,
    label3: null,
    label4: null,
    label5: null,
    trayTubeMapping: 'Device',
    countryOfOriginId: null,
    unitCost: 0,
    // EAR Info
    materialDescriptionId: null,
    usHtsCodeId: null,
    eccnId: null,
    licenseExceptionId: null,
    restrictedCountriesToShipIds: [] as number[],
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
    { field: 'unitCost', title: 'UnitCost', width: 120 }
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
    this.checkSecurityFeatures();
  }

  checkSecurityFeatures(): void {
    // Matching TFS EnableDisableBasedOnSecurity() method (lines 667-696)
    // Check EditDeviceDetails feature
    const editDeviceFeature = this.appService.feature.find(f => f.featureName === 'EditDeviceDetails');
    this.deviceEditEnabled = editDeviceFeature?.active ?? true; // Default to true if not found
    
    // Check EditLabels feature
    const editLabelsFeature = this.appService.feature.find(f => f.featureName === 'EditLabels');
    this.labelEditEnabled = editLabelsFeature?.active ?? true; // Default to true if not found
    
    console.log('Security features:', {
      deviceEditEnabled: this.deviceEditEnabled,
      labelEditEnabled: this.labelEditEnabled
    });
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
    // Pass active parameter: if selectedActive is true, pass true (show only active), if false, pass false (show only inactive)
    const active = this.selectedActive === true ? true : false;

    // Load all data, filtering only by active status (search is done client-side)
    this.apiService.searchDevice(null, null, null, active).subscribe({
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
    // Additional client-side filtering for search text across all columns
    if (!this.searchText || this.searchText.trim() === '') {
      return data;
    }
    
    const searchLower = this.searchText.toLowerCase().trim();
    return data.filter(item => {
      // Search across all visible columns
      const customerName = (item.customerName || '').toString().toLowerCase();
      const deviceFamily = (item.deviceFamily || '').toString().toLowerCase();
      const device = (item.device || '').toString().toLowerCase();
      const testDevice = (item.testDevice || '').toString().toLowerCase();
      const reliabilityDevice = (item.reliabilityDevice || '').toString().toLowerCase();
      const deviceAlias = (item.deviceAlias || '').toString().toLowerCase();
      const createdOn = (item.createdOn || '').toString().toLowerCase();
      const unitCost = (item.unitCost || '').toString().toLowerCase();
      
      return customerName.includes(searchLower) ||
             deviceFamily.includes(searchLower) ||
             device.includes(searchLower) ||
             testDevice.includes(searchLower) ||
             reliabilityDevice.includes(searchLower) ||
             deviceAlias.includes(searchLower) ||
             createdOn.includes(searchLower) ||
             unitCost.includes(searchLower);
    });
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
      // Load dropdown data before opening dialog
      this.loadAllDropdownData();
      
      // Ensure customersList is populated from getter before opening dialog
      // Kendo combobox in dialog needs a stable property reference
      this.customersList = [...this.customers]; // Create a new array reference
      
      const deviceId = dataItem.deviceId || dataItem.DeviceId;
      const customerId = dataItem.customerId || dataItem.CustomerId;
      const deviceFamilyId = dataItem.deviceFamilyId || dataItem.DeviceFamilyId;
      
      // Initialize deviceData with all available fields from search result (matching TFS FillControls)
      this.deviceData = {
        deviceId: deviceId,
        deviceName: dataItem.device || dataItem.Device,
        deviceFamilyId: deviceFamilyId,
        customerID: customerId,
        isActive: dataItem.active || dataItem.Active !== undefined ? (dataItem.active || dataItem.Active) : true,
        testDevice: dataItem.testDevice || dataItem.TestDevice || '',
        reliabilityDevice: dataItem.reliabilityDevice || dataItem.ReliabilityDevice || '',
        aliasNames: [], // Will be loaded separately
        newAliasName: '',
        sku: dataItem.sku || dataItem.SKU || '',
        partType: dataItem.partType || dataItem.PartType || dataItem.partTypeId || dataItem.PartTypeId || null,
        lotType: dataItem.lotType || dataItem.LotType || dataItem.deviceTypeId || dataItem.DeviceTypeId || null,
        labelMapping: dataItem.labelMapping !== undefined ? dataItem.labelMapping : (dataItem.isLabelMapped !== undefined ? dataItem.isLabelMapped : false),
        trayTubeMapping: dataItem.trayTubeMapping || dataItem.TrayTubeMapping || (dataItem.isDeviceBasedTray !== undefined ? (dataItem.isDeviceBasedTray ? 'Device' : 'Lot') : 'Device'),
        countryOfOriginId: dataItem.countryOfOriginId || dataItem.CountryOfOriginId || dataItem.cooId || dataItem.COOId || null,
        unitCost: dataItem.unitCost !== undefined ? dataItem.unitCost : (dataItem.UnitCost !== undefined ? dataItem.UnitCost : 0),
        materialDescriptionId: dataItem.materialDescriptionId || dataItem.MaterialDescriptionId || null,
        usHtsCodeId: dataItem.usHtsCodeId || dataItem.USHTSCodeId || dataItem.usHtsCode || dataItem.USHTSCode || null,
        eccnId: dataItem.eccnId || dataItem.ECCNId || dataItem.eccn || dataItem.ECCN || null,
        licenseExceptionId: dataItem.licenseExceptionId || dataItem.LicenseExceptionId || dataItem.licenseExceptions || dataItem.LicenseExceptions || null,
        restrictedCountriesToShipIds: this.parseRestrictedCountriesIds(dataItem.restrictedCountriesToShipId || dataItem.restrictedCountriesToShipIds || dataItem.restrictedCountriesIds || dataItem.RestrictedCountriesIds),
        scheduleB: dataItem.scheduleB !== undefined ? dataItem.scheduleB : (dataItem.ScheduleB !== undefined ? dataItem.ScheduleB : false),
        mslId: dataItem.mslId || dataItem.MSL || dataItem.msl || null,
        peakPackageBodyTemperatureId: dataItem.peakPackageBodyTemperatureId || dataItem.PeakPackageBodyTemperatureId || dataItem.peakPacckageBody || dataItem.PeakPacckageBody || null,
        shelfLifeMonthId: dataItem.shelfLifeMonthId || dataItem.ShelfLifeMonthId || dataItem.shelfLife || dataItem.ShelfLife || null,
        floorLifeId: dataItem.floorLifeId || dataItem.FloorLifeId || dataItem.floorLife || dataItem.FloorLife || null,
        pbFreeId: dataItem.pbFreeId || dataItem.PBFreeId || dataItem.pbFree || dataItem.PBFree || null,
        pbFreeStickerId: dataItem.pbFreeStickerId || dataItem.PBFreeStickerId || dataItem.pbFreeSticker || dataItem.PBFreeSticker || null,
        rohsId: dataItem.rohsId || dataItem.ROHSId || dataItem.rohs || dataItem.ROHS || null,
        trayTubeStrappingId: dataItem.trayTubeStrappingId || dataItem.TrayTubeStrappingId || dataItem.trayStrapping || dataItem.TrayStrapping || null,
        trayStackingId: dataItem.trayStackingId || dataItem.TrayStackingId || dataItem.trayStacking || dataItem.TrayStacking || null,
        label1: dataItem.label1 ? Number(dataItem.label1) : null,
        label2: dataItem.label2 ? Number(dataItem.label2) : null,
        label3: dataItem.label3 ? Number(dataItem.label3) : null,
        label4: dataItem.label4 ? Number(dataItem.label4) : null,
        label5: dataItem.label5 ? Number(dataItem.label5) : null
      };
      
      // Track original active state for validation (matching TFS pActive)
      this.originalIsActive = this.deviceData.isActive;
      
      this.isEditMode = true;
      this.isViewMode = false;
      
      if (this.deviceData.customerID) {
        this.selectedCustomerID = this.deviceData.customerID;
        this.loadDeviceFamiliesForDialog();
      }
      
      // Load device info (matching TFS GetDevicefamilyDeviceInfo) - includes CanEdit flag and usage data
      if (deviceId && deviceId > 0) {
        this.apiService.getDeviceInfo(deviceId).subscribe({
          next: (deviceInfo: any) => {
            console.log('Device Info loaded for edit:', deviceInfo);
            // Set CanEdit flag (matching TFS line 51: objtemp.CanEdit = UtilityClass.ToBoolean(ds.Tables[0].Rows[0]["CanEdit"]))
            // Handle different possible response formats: canEdit, CanEdit, or from nested object
            if (deviceInfo.canEdit !== undefined) {
              this.canEdit = Boolean(deviceInfo.canEdit);
            } else if (deviceInfo.CanEdit !== undefined) {
              this.canEdit = Boolean(deviceInfo.CanEdit);
            } else if (deviceInfo.deviceInfo && deviceInfo.deviceInfo.canEdit !== undefined) {
              this.canEdit = Boolean(deviceInfo.deviceInfo.canEdit);
            } else {
              // Default to true if not found (device can be edited)
              this.canEdit = true;
            }
            
            // Set CanEditlotType flag (matching TFS line 78)
            if (deviceInfo.canEditlotType !== undefined) {
              this.canEditlotType = Boolean(deviceInfo.canEditlotType);
            } else if (deviceInfo.CanEditlotType !== undefined) {
              this.canEditlotType = Boolean(deviceInfo.CanEditlotType);
            } else {
              this.canEditlotType = true; // Default to true
            }
            
            // Set CanEditLabel1-5 flags (matching TFS lines 73-77)
            this.canEditLabel1 = deviceInfo.canEditLabel1 !== undefined ? Boolean(deviceInfo.canEditLabel1) : 
                                (deviceInfo.CanEditLabel1 !== undefined ? Boolean(deviceInfo.CanEditLabel1) : true);
            this.canEditLabel2 = deviceInfo.canEditLabel2 !== undefined ? Boolean(deviceInfo.canEditLabel2) : 
                                (deviceInfo.CanEditLabel2 !== undefined ? Boolean(deviceInfo.CanEditLabel2) : true);
            this.canEditLabel3 = deviceInfo.canEditLabel3 !== undefined ? Boolean(deviceInfo.canEditLabel3) : 
                                (deviceInfo.CanEditLabel3 !== undefined ? Boolean(deviceInfo.CanEditLabel3) : true);
            this.canEditLabel4 = deviceInfo.canEditLabel4 !== undefined ? Boolean(deviceInfo.canEditLabel4) : 
                                (deviceInfo.CanEditLabel4 !== undefined ? Boolean(deviceInfo.CanEditLabel4) : true);
            this.canEditLabel5 = deviceInfo.canEditLabel5 !== undefined ? Boolean(deviceInfo.canEditLabel5) : 
                                (deviceInfo.CanEditLabel5 !== undefined ? Boolean(deviceInfo.CanEditLabel5) : true);
            
            // Set LastModifiedOn for optimistic locking (matching TFS line 76)
            this.lastModifiedOn = deviceInfo.lastModifiedOn || deviceInfo.LastModifiedOn || '';
            
            // Update deviceData with values from GetDeviceInfo response (more accurate than search result)
            if (deviceInfo) {
              // Update device fields from stored procedure response
              if (deviceInfo.device !== undefined) this.deviceData.deviceName = deviceInfo.device || deviceInfo.Device || this.deviceData.deviceName;
              if (deviceInfo.testDevice !== undefined) this.deviceData.testDevice = deviceInfo.testDevice || deviceInfo.TestDevice || this.deviceData.testDevice;
              if (deviceInfo.reliabilityDevice !== undefined) this.deviceData.reliabilityDevice = deviceInfo.reliabilityDevice || deviceInfo.ReliabilityDevice || this.deviceData.reliabilityDevice;
              if (deviceInfo.sku !== undefined) this.deviceData.sku = deviceInfo.sku || deviceInfo.SKU || this.deviceData.sku;
              // Store PartTypeId temporarily - will be converted to text after partTypes are loaded
              if (deviceInfo.partTypeId !== undefined || deviceInfo.PartTypeId !== undefined) {
                const partTypeId = deviceInfo.partTypeId || deviceInfo.PartTypeId;
                if (partTypeId !== null && partTypeId !== undefined) {
                  // Try to find the text value if partTypes are already loaded
                  const partTypeItem = this.partTypes.find((pt: any) => pt.id === partTypeId);
                  if (partTypeItem) {
                    this.deviceData.partType = partTypeItem.value || partTypeItem.text;
                  } else {
                    // Store ID temporarily for conversion after partTypes are loaded
                    (this.deviceData as any).partTypeId = partTypeId;
                  }
                }
              }
              // Store DeviceTypeId temporarily - will be converted to text after lotTypes are loaded
              if (deviceInfo.deviceTypeId !== undefined || deviceInfo.DeviceTypeId !== undefined) {
                const deviceTypeId = deviceInfo.deviceTypeId || deviceInfo.DeviceTypeId;
                if (deviceTypeId !== null && deviceTypeId !== undefined) {
                  // Try to find the text value if lotTypes are already loaded
                  const lotTypeItem = this.lotTypes.find((lt: any) => lt.id === deviceTypeId);
                  if (lotTypeItem) {
                    this.deviceData.lotType = lotTypeItem.value || lotTypeItem.text;
                  } else {
                    // Store ID temporarily for conversion after lotTypes are loaded
                    (this.deviceData as any).deviceTypeId = deviceTypeId;
                  }
                }
              }
              if (deviceInfo.isLabelMapped !== undefined) this.deviceData.labelMapping = deviceInfo.isLabelMapped || deviceInfo.IsLabelMapped || this.deviceData.labelMapping;
              if (deviceInfo.isDeviceBasedTray !== undefined) {
                const isDeviceBased = deviceInfo.isDeviceBasedTray || deviceInfo.IsDeviceBasedTray;
                this.deviceData.trayTubeMapping = isDeviceBased ? 'Device' : 'Lot';
              }
              if (deviceInfo.cooId !== undefined) this.deviceData.countryOfOriginId = deviceInfo.cooId || deviceInfo.COOId || this.deviceData.countryOfOriginId;
              if (deviceInfo.unitCost !== undefined) this.deviceData.unitCost = deviceInfo.unitCost || deviceInfo.UnitCost || this.deviceData.unitCost;
              if (deviceInfo.materialDescriptionId !== undefined) this.deviceData.materialDescriptionId = deviceInfo.materialDescriptionId || deviceInfo.MaterialDescriptionId || this.deviceData.materialDescriptionId;
              // US HTS Code - handle both camelCase and PascalCase
              const usHtsCodeId = deviceInfo.usHtsCodeId !== undefined ? deviceInfo.usHtsCodeId : 
                                 (deviceInfo.USHTSCodeId !== undefined ? deviceInfo.USHTSCodeId : null);
              if (usHtsCodeId !== null && usHtsCodeId !== undefined) {
                this.deviceData.usHtsCodeId = usHtsCodeId;
              }
              if (deviceInfo.eccnId !== undefined) this.deviceData.eccnId = deviceInfo.eccnId || deviceInfo.ECCNId || this.deviceData.eccnId;
              if (deviceInfo.licenseExceptionId !== undefined) this.deviceData.licenseExceptionId = deviceInfo.licenseExceptionId || deviceInfo.LicenseExceptionId || this.deviceData.licenseExceptionId;
              // Restricted Countries to Ship - handle both camelCase and PascalCase
              const restrictedCountriesIds = deviceInfo.restrictedCountriesIds !== undefined ? deviceInfo.restrictedCountriesIds : 
                                            (deviceInfo.RestrictedCountriesIds !== undefined ? deviceInfo.RestrictedCountriesIds : null);
              if (restrictedCountriesIds !== null && restrictedCountriesIds !== undefined) {
                this.deviceData.restrictedCountriesToShipIds = this.parseRestrictedCountriesIds(restrictedCountriesIds);
              }
              // ScheduleB (STA) - handle both camelCase and PascalCase, and null values
              if (deviceInfo.scheduleB !== undefined) {
                this.deviceData.scheduleB = Boolean(deviceInfo.scheduleB);
              } else if (deviceInfo.ScheduleB !== undefined) {
                this.deviceData.scheduleB = Boolean(deviceInfo.ScheduleB);
              }
              if (deviceInfo.msl !== undefined) this.deviceData.mslId = deviceInfo.msl || deviceInfo.MSL || this.deviceData.mslId;
              if (deviceInfo.peakPacckageBody !== undefined) this.deviceData.peakPackageBodyTemperatureId = deviceInfo.peakPacckageBody || deviceInfo.PeakPacckageBody || this.deviceData.peakPackageBodyTemperatureId;
              if (deviceInfo.shelfLife !== undefined) this.deviceData.shelfLifeMonthId = deviceInfo.shelfLife || deviceInfo.ShelfLife || this.deviceData.shelfLifeMonthId;
              if (deviceInfo.floorLife !== undefined) this.deviceData.floorLifeId = deviceInfo.floorLife || deviceInfo.FloorLife || this.deviceData.floorLifeId;
              if (deviceInfo.pbFree !== undefined) this.deviceData.pbFreeId = deviceInfo.pbFree || deviceInfo.PBFree || this.deviceData.pbFreeId;
              if (deviceInfo.pbFreeSticker !== undefined) this.deviceData.pbFreeStickerId = deviceInfo.pbFreeSticker || deviceInfo.PBFreeSticker || this.deviceData.pbFreeStickerId;
              if (deviceInfo.rohs !== undefined) this.deviceData.rohsId = deviceInfo.rohs || deviceInfo.ROHS || this.deviceData.rohsId;
              if (deviceInfo.trayStrapping !== undefined) this.deviceData.trayTubeStrappingId = deviceInfo.trayStrapping || deviceInfo.TrayStrapping || this.deviceData.trayTubeStrappingId;
              if (deviceInfo.trayStacking !== undefined) this.deviceData.trayStackingId = deviceInfo.trayStacking || deviceInfo.TrayStacking || this.deviceData.trayStackingId;
              
              // Store label names temporarily - will be converted to IDs after customer labels are loaded
              // Update label values from label details (Table[5])
              if (deviceInfo.label1 !== undefined || deviceInfo.Label1 !== undefined) {
                const label1Value = deviceInfo.label1 || deviceInfo.Label1;
                if (label1Value) {
                  // Try to convert to ID if customer labels are already loaded, otherwise store name for later conversion
                  const labelId = this.getLabelIdFromName(label1Value);
                  this.deviceData.label1 = labelId !== null ? Number(labelId) : null;
                  // Store name for later conversion if ID not found
                  if (labelId === null && this.customerLabels.length === 0) {
                    (this.deviceData as any).label1Name = label1Value;
                  }
                } else {
                  this.deviceData.label1 = null;
                }
              }
              if (deviceInfo.label2 !== undefined || deviceInfo.Label2 !== undefined) {
                const label2Value = deviceInfo.label2 || deviceInfo.Label2;
                if (label2Value) {
                  const labelId = this.getLabelIdFromName(label2Value);
                  this.deviceData.label2 = labelId !== null ? Number(labelId) : null;
                  if (labelId === null && this.customerLabels.length === 0) {
                    (this.deviceData as any).label2Name = label2Value;
                  }
                } else {
                  this.deviceData.label2 = null;
                }
              }
              if (deviceInfo.label3 !== undefined || deviceInfo.Label3 !== undefined) {
                const label3Value = deviceInfo.label3 || deviceInfo.Label3;
                if (label3Value) {
                  const labelId = this.getLabelIdFromName(label3Value);
                  this.deviceData.label3 = labelId !== null ? Number(labelId) : null;
                  if (labelId === null && this.customerLabels.length === 0) {
                    (this.deviceData as any).label3Name = label3Value;
                  }
                } else {
                  this.deviceData.label3 = null;
                }
              }
              if (deviceInfo.label4 !== undefined || deviceInfo.Label4 !== undefined) {
                const label4Value = deviceInfo.label4 || deviceInfo.Label4;
                if (label4Value) {
                  const labelId = this.getLabelIdFromName(label4Value);
                  this.deviceData.label4 = labelId !== null ? Number(labelId) : null;
                  if (labelId === null && this.customerLabels.length === 0) {
                    (this.deviceData as any).label4Name = label4Value;
                  }
                } else {
                  this.deviceData.label4 = null;
                }
              }
              if (deviceInfo.label5 !== undefined || deviceInfo.Label5 !== undefined) {
                const label5Value = deviceInfo.label5 || deviceInfo.Label5;
                if (label5Value) {
                  const labelId = this.getLabelIdFromName(label5Value);
                  this.deviceData.label5 = labelId !== null ? Number(labelId) : null;
                  if (labelId === null && this.customerLabels.length === 0) {
                    (this.deviceData as any).label5Name = label5Value;
                  }
                } else {
                  this.deviceData.label5 = null;
                }
              }
            }
            
            console.log('canEdit set to:', this.canEdit, 'canEditlotType:', this.canEditlotType, 'isEditMode:', this.isEditMode);
            console.log('canEditLabel flags:', {
              label1: this.canEditLabel1,
              label2: this.canEditLabel2,
              label3: this.canEditLabel3,
              label4: this.canEditLabel4,
              label5: this.canEditLabel5
            });
            
            // Store device info data for "Devices in Use" dialog
            // API returns: DQP, MF, TRV, Boards, DeviceLabelInfo (matching TFS property names)
            this.deviceInfoData = {
              canEdit: this.canEdit,
              canEditlotType: this.canEditlotType,
              canEditLabel1: this.canEditLabel1,
              canEditLabel2: this.canEditLabel2,
              canEditLabel3: this.canEditLabel3,
              canEditLabel4: this.canEditLabel4,
              canEditLabel5: this.canEditLabel5,
              lastModifiedOn: this.lastModifiedOn,
              dqp: deviceInfo.DQP || deviceInfo.dqp || deviceInfo.lstDQP || [],
              mf: deviceInfo.MF || deviceInfo.mf || deviceInfo.lstMF || [],
              trv: deviceInfo.TRV || deviceInfo.trv || deviceInfo.lstTRV || [],
              boards: deviceInfo.Boards || deviceInfo.boards || deviceInfo.lstBoards || [],
              deviceLabelInfo: deviceInfo.DeviceLabelInfo || deviceInfo.deviceLabelInfo || deviceInfo.lstDeviceLabelInfo || []
            };
            console.log('Device Info Data:', this.deviceInfoData);
            // Load alias names (matching TFS - loads from Table[7] via GetDevicefamilyDeviceInfo)
            // In TFS, alias names come from objPRD_Devicefamily_DeviceBO.lstDeviceAliasNames
            if (customerId && deviceFamilyId) {
              this.loadDeviceAliasesForEdit(deviceId, customerId, deviceFamilyId);
            } else {
              this.deviceData.aliasNames = [];
              this.openEditDialogAfterDataLoad();
            }
          },
          error: (error) => {
            console.error('Error loading device info:', error);
            // Default to editable if API fails
            this.canEdit = true;
            this.canEditlotType = true;
            this.canEditLabel1 = true;
            this.canEditLabel2 = true;
            this.canEditLabel3 = true;
            this.canEditLabel4 = true;
            this.canEditLabel5 = true;
            this.lastModifiedOn = '';
            this.deviceInfoData = {
              canEdit: true,
              canEditlotType: true,
              canEditLabel1: true,
              canEditLabel2: true,
              canEditLabel3: true,
              canEditLabel4: true,
              canEditLabel5: true,
              lastModifiedOn: '',
              dqp: [],
              mf: [],
              trv: [],
              boards: [],
              deviceLabelInfo: []
            };
            // Still try to load aliases
            if (customerId && deviceFamilyId) {
              this.loadDeviceAliasesForEdit(deviceId, customerId, deviceFamilyId);
            } else {
              this.deviceData.aliasNames = [];
              this.openEditDialogAfterDataLoad();
            }
          }
        });
      } else {
        // New device - no device info to load
        this.canEdit = true;
        this.canEditlotType = true;
        this.canEditLabel1 = true;
        this.canEditLabel2 = true;
        this.canEditLabel3 = true;
        this.canEditLabel4 = true;
        this.canEditLabel5 = true;
        this.lastModifiedOn = '';
        this.lockId = -1;
        this.deviceInfoData = {
          canEdit: true,
          canEditlotType: true,
          canEditLabel1: true,
          canEditLabel2: true,
          canEditLabel3: true,
          canEditLabel4: true,
          canEditLabel5: true,
          lastModifiedOn: '',
          dqp: [],
          mf: [],
          trv: [],
          boards: [],
          deviceLabelInfo: []
        };
        this.deviceData.aliasNames = [];
        this.openEditDialogAfterDataLoad();
      }
    }
  }

  private loadDeviceAliasesForEdit(deviceId: number, customerId: number, deviceFamilyId: number): void {
    this.apiService.getDeviceAlias(customerId, deviceFamilyId, deviceId).subscribe({
      next: (aliases: any[]) => {
        console.log('Device Aliases loaded for edit:', aliases);
        if (aliases && Array.isArray(aliases)) {
          // Map alias names to string array (matching TFS - AliasName property)
          // HTML template expects array of strings, not objects
          this.deviceData.aliasNames = aliases
            .map((alias: any) => alias.deviceAliasName || alias.DeviceAliasName || alias.aliasName || alias.AliasName || '')
            .filter((aliasName: string) => aliasName && aliasName.trim() !== '');
          console.log('Mapped alias names:', this.deviceData.aliasNames);
        } else {
          this.deviceData.aliasNames = [];
        }
        this.openEditDialogAfterDataLoad();
      },
      error: (error) => {
        console.error('Error loading device aliases:', error);
        this.deviceData.aliasNames = [];
        this.openEditDialogAfterDataLoad();
      }
    });
  }

  private openEditDialogAfterDataLoad(): void {
    // Auto-check label mapping if labels are selected but labelMapping is false (matching TFS line 539-542)
    if (!this.deviceData.labelMapping && 
        (this.deviceData.label1 || this.deviceData.label2 || this.deviceData.label3 || 
         this.deviceData.label4 || this.deviceData.label5)) {
      this.deviceData.labelMapping = true;
      console.log('Auto-checked label mapping because labels are selected');
    }
    
    // Fill label dictionary for format string generation (matching TFS FillLabelDictionary)
    this.fillLabelDictionary();
    
    // Apply security feature restrictions (matching TFS EnableDisableBasedOnSecurity)
    this.applySecurityRestrictions();
    
    // Load customer labels BEFORE opening dialog and setting values to ensure values bind correctly
    if (this.deviceData.labelMapping && this.deviceData.customerID) {
      this.loadCustomerLabels().then(() => {
        // Labels are now loaded, values are already set in deviceData
        // Open dialog after values are set
        this.isDialogOpen = true;
        // Force change detection after dialog opens to ensure dropdowns update
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      });
    } else {
      // No labels needed, open dialog immediately
      this.isDialogOpen = true;
    }
  }

  private openViewDialogAfterDataLoad(): void {
    // Fill label dictionary for format string generation
    this.fillLabelDictionary();
    
    // Load customer labels BEFORE opening dialog and setting values to ensure values bind correctly
    if (this.deviceData.labelMapping && this.deviceData.customerID) {
      this.loadCustomerLabels().then(() => {
        // Labels are now loaded, values are already set in deviceData
        // Open dialog after values are set
        this.isDialogOpen = true;
        // Force change detection after dialog opens to ensure dropdowns update
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      });
    } else {
      // No labels needed, open dialog immediately
      this.isDialogOpen = true;
    }
  }

  applySecurityRestrictions(): void {
    // Matching TFS EnableDisableBasedOnSecurity() method (lines 667-696)
    // This method is called after loading device info to apply security restrictions
    // Note: In Angular, we handle this via [disabled] bindings in the template
    // The flags are already set in checkSecurityFeatures() and deviceInfoData
  }

  onView(dataItem: any): void {
    if (dataItem) {
      this.selectedRowIndex = -1;
      // Load dropdown data before opening dialog
      this.loadAllDropdownData();
      
      // Ensure customersList is populated from getter before opening dialog
      // Needed for getCustomerName() method used in view mode
      this.customersList = [...this.customers]; // Create a new array reference
      
      const deviceId = dataItem.deviceId || dataItem.DeviceId;
      const customerId = dataItem.customerId || dataItem.CustomerId;
      const deviceFamilyId = dataItem.deviceFamilyId || dataItem.DeviceFamilyId;
      
      // Initialize deviceData with all available fields from search result (matching TFS FillControls)
      this.deviceData = {
        deviceId: deviceId,
        deviceName: dataItem.device || dataItem.Device,
        deviceFamilyId: deviceFamilyId,
        customerID: customerId,
        isActive: dataItem.active || dataItem.Active !== undefined ? (dataItem.active || dataItem.Active) : true,
        testDevice: dataItem.testDevice || dataItem.TestDevice || '',
        reliabilityDevice: dataItem.reliabilityDevice || dataItem.ReliabilityDevice || '',
        aliasNames: [], // Will be loaded separately
        newAliasName: '',
        sku: dataItem.sku || dataItem.SKU || '',
        partType: dataItem.partType || dataItem.PartType || dataItem.partTypeId || dataItem.PartTypeId || null,
        lotType: dataItem.lotType || dataItem.LotType || dataItem.deviceTypeId || dataItem.DeviceTypeId || null,
        labelMapping: dataItem.labelMapping !== undefined ? dataItem.labelMapping : (dataItem.isLabelMapped !== undefined ? dataItem.isLabelMapped : false),
        trayTubeMapping: dataItem.trayTubeMapping || dataItem.TrayTubeMapping || (dataItem.isDeviceBasedTray !== undefined ? (dataItem.isDeviceBasedTray ? 'Device' : 'Lot') : 'Device'),
        countryOfOriginId: dataItem.countryOfOriginId || dataItem.CountryOfOriginId || dataItem.cooId || dataItem.COOId || null,
        unitCost: dataItem.unitCost !== undefined ? dataItem.unitCost : (dataItem.UnitCost !== undefined ? dataItem.UnitCost : 0),
        materialDescriptionId: dataItem.materialDescriptionId || dataItem.MaterialDescriptionId || null,
        usHtsCodeId: dataItem.usHtsCodeId || dataItem.USHTSCodeId || dataItem.usHtsCode || dataItem.USHTSCode || null,
        eccnId: dataItem.eccnId || dataItem.ECCNId || dataItem.eccn || dataItem.ECCN || null,
        licenseExceptionId: dataItem.licenseExceptionId || dataItem.LicenseExceptionId || dataItem.licenseExceptions || dataItem.LicenseExceptions || null,
        restrictedCountriesToShipIds: this.parseRestrictedCountriesIds(dataItem.restrictedCountriesToShipId || dataItem.restrictedCountriesToShipIds || dataItem.restrictedCountriesIds || dataItem.RestrictedCountriesIds),
        scheduleB: dataItem.scheduleB !== undefined ? dataItem.scheduleB : (dataItem.ScheduleB !== undefined ? dataItem.ScheduleB : false),
        mslId: dataItem.mslId || dataItem.MSL || dataItem.msl || null,
        peakPackageBodyTemperatureId: dataItem.peakPackageBodyTemperatureId || dataItem.PeakPackageBodyTemperatureId || dataItem.peakPacckageBody || dataItem.PeakPacckageBody || null,
        shelfLifeMonthId: dataItem.shelfLifeMonthId || dataItem.ShelfLifeMonthId || dataItem.shelfLife || dataItem.ShelfLife || null,
        floorLifeId: dataItem.floorLifeId || dataItem.FloorLifeId || dataItem.floorLife || dataItem.FloorLife || null,
        pbFreeId: dataItem.pbFreeId || dataItem.PBFreeId || dataItem.pbFree || dataItem.PBFree || null,
        pbFreeStickerId: dataItem.pbFreeStickerId || dataItem.PBFreeStickerId || dataItem.pbFreeSticker || dataItem.PBFreeSticker || null,
        rohsId: dataItem.rohsId || dataItem.ROHSId || dataItem.rohs || dataItem.ROHS || null,
        trayTubeStrappingId: dataItem.trayTubeStrappingId || dataItem.TrayTubeStrappingId || dataItem.trayStrapping || dataItem.TrayStrapping || null,
        trayStackingId: dataItem.trayStackingId || dataItem.TrayStackingId || dataItem.trayStacking || dataItem.TrayStacking || null,
        label1: dataItem.label1 ? Number(dataItem.label1) : null,
        label2: dataItem.label2 ? Number(dataItem.label2) : null,
        label3: dataItem.label3 ? Number(dataItem.label3) : null,
        label4: dataItem.label4 ? Number(dataItem.label4) : null,
        label5: dataItem.label5 ? Number(dataItem.label5) : null
      };
      
      // Track original active state for validation (matching TFS pActive)
      this.originalIsActive = this.deviceData.isActive;
      
      this.isEditMode = false;
      this.isViewMode = true;
      
      if (this.deviceData.customerID) {
        this.selectedCustomerID = this.deviceData.customerID;
        this.loadDeviceFamiliesForDialog();
      }
      
      // Load device info (matching TFS GetDevicefamilyDeviceInfo) - includes CanEdit flag and usage data
      if (deviceId && deviceId > 0) {
        this.apiService.getDeviceInfo(deviceId).subscribe({
          next: (deviceInfo: any) => {
            console.log('Device Info loaded for view:', deviceInfo);
            // Set CanEdit flag (matching TFS line 51: objtemp.CanEdit = UtilityClass.ToBoolean(ds.Tables[0].Rows[0]["CanEdit"]))
            // Handle different possible response formats: canEdit, CanEdit, or from nested object
            if (deviceInfo.canEdit !== undefined) {
              this.canEdit = Boolean(deviceInfo.canEdit);
            } else if (deviceInfo.CanEdit !== undefined) {
              this.canEdit = Boolean(deviceInfo.CanEdit);
            } else if (deviceInfo.deviceInfo && deviceInfo.deviceInfo.canEdit !== undefined) {
              this.canEdit = Boolean(deviceInfo.deviceInfo.canEdit);
            } else {
              // Default to true if not found (device can be edited)
              this.canEdit = true;
            }
            
            // Update deviceData with values from GetDeviceInfo response (more accurate than search result)
            if (deviceInfo) {
              // Update device fields from stored procedure response
              if (deviceInfo.device !== undefined) this.deviceData.deviceName = deviceInfo.device || deviceInfo.Device || this.deviceData.deviceName;
              if (deviceInfo.testDevice !== undefined) this.deviceData.testDevice = deviceInfo.testDevice || deviceInfo.TestDevice || this.deviceData.testDevice;
              if (deviceInfo.reliabilityDevice !== undefined) this.deviceData.reliabilityDevice = deviceInfo.reliabilityDevice || deviceInfo.ReliabilityDevice || this.deviceData.reliabilityDevice;
              if (deviceInfo.sku !== undefined) this.deviceData.sku = deviceInfo.sku || deviceInfo.SKU || this.deviceData.sku;
              // Store PartTypeId temporarily - will be converted to text after partTypes are loaded
              if (deviceInfo.partTypeId !== undefined || deviceInfo.PartTypeId !== undefined) {
                const partTypeId = deviceInfo.partTypeId || deviceInfo.PartTypeId;
                if (partTypeId !== null && partTypeId !== undefined) {
                  // Try to find the text value if partTypes are already loaded
                  const partTypeItem = this.partTypes.find((pt: any) => pt.id === partTypeId);
                  if (partTypeItem) {
                    this.deviceData.partType = partTypeItem.value || partTypeItem.text;
                  } else {
                    // Store ID temporarily for conversion after partTypes are loaded
                    (this.deviceData as any).partTypeId = partTypeId;
                  }
                }
              }
              // Store DeviceTypeId temporarily - will be converted to text after lotTypes are loaded
              if (deviceInfo.deviceTypeId !== undefined || deviceInfo.DeviceTypeId !== undefined) {
                const deviceTypeId = deviceInfo.deviceTypeId || deviceInfo.DeviceTypeId;
                if (deviceTypeId !== null && deviceTypeId !== undefined) {
                  // Try to find the text value if lotTypes are already loaded
                  const lotTypeItem = this.lotTypes.find((lt: any) => lt.id === deviceTypeId);
                  if (lotTypeItem) {
                    this.deviceData.lotType = lotTypeItem.value || lotTypeItem.text;
                  } else {
                    // Store ID temporarily for conversion after lotTypes are loaded
                    (this.deviceData as any).deviceTypeId = deviceTypeId;
                  }
                }
              }
              if (deviceInfo.isLabelMapped !== undefined) this.deviceData.labelMapping = deviceInfo.isLabelMapped || deviceInfo.IsLabelMapped || this.deviceData.labelMapping;
              if (deviceInfo.isDeviceBasedTray !== undefined) {
                const isDeviceBased = deviceInfo.isDeviceBasedTray || deviceInfo.IsDeviceBasedTray;
                this.deviceData.trayTubeMapping = isDeviceBased ? 'Device' : 'Lot';
              }
              if (deviceInfo.cooId !== undefined) this.deviceData.countryOfOriginId = deviceInfo.cooId || deviceInfo.COOId || this.deviceData.countryOfOriginId;
              if (deviceInfo.unitCost !== undefined) this.deviceData.unitCost = deviceInfo.unitCost || deviceInfo.UnitCost || this.deviceData.unitCost;
              if (deviceInfo.materialDescriptionId !== undefined) this.deviceData.materialDescriptionId = deviceInfo.materialDescriptionId || deviceInfo.MaterialDescriptionId || this.deviceData.materialDescriptionId;
              // US HTS Code - handle both camelCase and PascalCase
              const usHtsCodeId = deviceInfo.usHtsCodeId !== undefined ? deviceInfo.usHtsCodeId : 
                                 (deviceInfo.USHTSCodeId !== undefined ? deviceInfo.USHTSCodeId : null);
              if (usHtsCodeId !== null && usHtsCodeId !== undefined) {
                this.deviceData.usHtsCodeId = usHtsCodeId;
              }
              if (deviceInfo.eccnId !== undefined) this.deviceData.eccnId = deviceInfo.eccnId || deviceInfo.ECCNId || this.deviceData.eccnId;
              if (deviceInfo.licenseExceptionId !== undefined) this.deviceData.licenseExceptionId = deviceInfo.licenseExceptionId || deviceInfo.LicenseExceptionId || this.deviceData.licenseExceptionId;
              // Restricted Countries to Ship - handle both camelCase and PascalCase
              const restrictedCountriesIds = deviceInfo.restrictedCountriesIds !== undefined ? deviceInfo.restrictedCountriesIds : 
                                            (deviceInfo.RestrictedCountriesIds !== undefined ? deviceInfo.RestrictedCountriesIds : null);
              if (restrictedCountriesIds !== null && restrictedCountriesIds !== undefined) {
                this.deviceData.restrictedCountriesToShipIds = this.parseRestrictedCountriesIds(restrictedCountriesIds);
              }
              // ScheduleB (STA) - handle both camelCase and PascalCase, and null values
              if (deviceInfo.scheduleB !== undefined) {
                this.deviceData.scheduleB = Boolean(deviceInfo.scheduleB);
              } else if (deviceInfo.ScheduleB !== undefined) {
                this.deviceData.scheduleB = Boolean(deviceInfo.ScheduleB);
              }
              if (deviceInfo.msl !== undefined) this.deviceData.mslId = deviceInfo.msl || deviceInfo.MSL || this.deviceData.mslId;
              if (deviceInfo.peakPacckageBody !== undefined) this.deviceData.peakPackageBodyTemperatureId = deviceInfo.peakPacckageBody || deviceInfo.PeakPacckageBody || this.deviceData.peakPackageBodyTemperatureId;
              if (deviceInfo.shelfLife !== undefined) this.deviceData.shelfLifeMonthId = deviceInfo.shelfLife || deviceInfo.ShelfLife || this.deviceData.shelfLifeMonthId;
              if (deviceInfo.floorLife !== undefined) this.deviceData.floorLifeId = deviceInfo.floorLife || deviceInfo.FloorLife || this.deviceData.floorLifeId;
              if (deviceInfo.pbFree !== undefined) this.deviceData.pbFreeId = deviceInfo.pbFree || deviceInfo.PBFree || this.deviceData.pbFreeId;
              if (deviceInfo.pbFreeSticker !== undefined) this.deviceData.pbFreeStickerId = deviceInfo.pbFreeSticker || deviceInfo.PBFreeSticker || this.deviceData.pbFreeStickerId;
              if (deviceInfo.rohs !== undefined) this.deviceData.rohsId = deviceInfo.rohs || deviceInfo.ROHS || this.deviceData.rohsId;
              if (deviceInfo.trayStrapping !== undefined) this.deviceData.trayTubeStrappingId = deviceInfo.trayStrapping || deviceInfo.TrayStrapping || this.deviceData.trayTubeStrappingId;
              if (deviceInfo.trayStacking !== undefined) this.deviceData.trayStackingId = deviceInfo.trayStacking || deviceInfo.TrayStacking || this.deviceData.trayStackingId;
              
              // Update label values from label details (Table[5])
              if (deviceInfo.label1 !== undefined || deviceInfo.Label1 !== undefined) {
                const label1Value = deviceInfo.label1 || deviceInfo.Label1;
                if (label1Value) {
                  const labelId = this.getLabelIdFromName(label1Value);
                  this.deviceData.label1 = labelId !== null ? labelId : null;
                  if (labelId === null && this.customerLabels.length === 0) {
                    (this.deviceData as any).label1Name = label1Value;
                  }
                } else {
                  this.deviceData.label1 = null;
                }
              }
              if (deviceInfo.label2 !== undefined || deviceInfo.Label2 !== undefined) {
                const label2Value = deviceInfo.label2 || deviceInfo.Label2;
                if (label2Value) {
                  const labelId = this.getLabelIdFromName(label2Value);
                  this.deviceData.label2 = labelId !== null ? labelId : null;
                  if (labelId === null && this.customerLabels.length === 0) {
                    (this.deviceData as any).label2Name = label2Value;
                  }
                } else {
                  this.deviceData.label2 = null;
                }
              }
              if (deviceInfo.label3 !== undefined || deviceInfo.Label3 !== undefined) {
                const label3Value = deviceInfo.label3 || deviceInfo.Label3;
                if (label3Value) {
                  const labelId = this.getLabelIdFromName(label3Value);
                  this.deviceData.label3 = labelId !== null ? labelId : null;
                  if (labelId === null && this.customerLabels.length === 0) {
                    (this.deviceData as any).label3Name = label3Value;
                  }
                } else {
                  this.deviceData.label3 = null;
                }
              }
              if (deviceInfo.label4 !== undefined || deviceInfo.Label4 !== undefined) {
                const label4Value = deviceInfo.label4 || deviceInfo.Label4;
                if (label4Value) {
                  const labelId = this.getLabelIdFromName(label4Value);
                  this.deviceData.label4 = labelId !== null ? labelId : null;
                  if (labelId === null && this.customerLabels.length === 0) {
                    (this.deviceData as any).label4Name = label4Value;
                  }
                } else {
                  this.deviceData.label4 = null;
                }
              }
              if (deviceInfo.label5 !== undefined || deviceInfo.Label5 !== undefined) {
                const label5Value = deviceInfo.label5 || deviceInfo.Label5;
                if (label5Value) {
                  const labelId = this.getLabelIdFromName(label5Value);
                  this.deviceData.label5 = labelId !== null ? labelId : null;
                  if (labelId === null && this.customerLabels.length === 0) {
                    (this.deviceData as any).label5Name = label5Value;
                  }
                } else {
                  this.deviceData.label5 = null;
                }
              }
            }
            
            console.log('canEdit set to:', this.canEdit);
            // Store device info data for "Devices in Use" dialog
            // API returns: DQP, MF, TRV, Boards, DeviceLabelInfo (matching TFS property names)
            this.deviceInfoData = {
              canEdit: this.canEdit,
              dqp: deviceInfo.DQP || deviceInfo.dqp || deviceInfo.lstDQP || [],
              mf: deviceInfo.MF || deviceInfo.mf || deviceInfo.lstMF || [],
              trv: deviceInfo.TRV || deviceInfo.trv || deviceInfo.lstTRV || [],
              boards: deviceInfo.Boards || deviceInfo.boards || deviceInfo.lstBoards || [],
              deviceLabelInfo: deviceInfo.DeviceLabelInfo || deviceInfo.deviceLabelInfo || deviceInfo.lstDeviceLabelInfo || []
            };
            console.log('Device Info Data:', this.deviceInfoData);
            // Load alias names (matching TFS - loads from Table[7] via GetDevicefamilyDeviceInfo)
            // In TFS, alias names come from objPRD_Devicefamily_DeviceBO.lstDeviceAliasNames
            if (customerId && deviceFamilyId) {
              this.loadDeviceAliasesForView(deviceId, customerId, deviceFamilyId);
            } else {
              this.deviceData.aliasNames = [];
              this.openViewDialogAfterDataLoad();
            }
          },
          error: (error) => {
            console.error('Error loading device info:', error);
            // Default to editable if API fails
            this.canEdit = true;
            this.canEditlotType = true;
            this.canEditLabel1 = true;
            this.canEditLabel2 = true;
            this.canEditLabel3 = true;
            this.canEditLabel4 = true;
            this.canEditLabel5 = true;
            this.lastModifiedOn = '';
            this.deviceInfoData = {
              canEdit: true,
              canEditlotType: true,
              canEditLabel1: true,
              canEditLabel2: true,
              canEditLabel3: true,
              canEditLabel4: true,
              canEditLabel5: true,
              lastModifiedOn: '',
              dqp: [],
              mf: [],
              trv: [],
              boards: [],
              deviceLabelInfo: []
            };
            // Still try to load aliases
            if (customerId && deviceFamilyId) {
              this.loadDeviceAliasesForView(deviceId, customerId, deviceFamilyId);
            } else {
              this.deviceData.aliasNames = [];
              this.openViewDialogAfterDataLoad();
            }
          }
        });
      } else {
        // No device info to load
        this.canEdit = true;
        this.canEditlotType = true;
        this.canEditLabel1 = true;
        this.canEditLabel2 = true;
        this.canEditLabel3 = true;
        this.canEditLabel4 = true;
        this.canEditLabel5 = true;
        this.lastModifiedOn = '';
        this.deviceInfoData = {
          canEdit: true,
          canEditlotType: true,
          canEditLabel1: true,
          canEditLabel2: true,
          canEditLabel3: true,
          canEditLabel4: true,
          canEditLabel5: true,
          lastModifiedOn: '',
          dqp: [],
          mf: [],
          trv: [],
          boards: [],
          deviceLabelInfo: []
        };
        this.deviceData.aliasNames = [];
        this.openViewDialogAfterDataLoad();
      }
    }
  }

  private loadDeviceAliasesForView(deviceId: number, customerId: number, deviceFamilyId: number): void {
    this.apiService.getDeviceAlias(customerId, deviceFamilyId, deviceId).subscribe({
      next: (aliases: any[]) => {
        console.log('Device Aliases loaded for view:', aliases);
        if (aliases && Array.isArray(aliases)) {
          // Map alias names to string array (matching TFS - AliasName property)
          // HTML template expects array of strings, not objects
          this.deviceData.aliasNames = aliases
            .map((alias: any) => alias.deviceAliasName || alias.DeviceAliasName || alias.aliasName || alias.AliasName || '')
            .filter((aliasName: string) => aliasName && aliasName.trim() !== '');
          console.log('Mapped alias names:', this.deviceData.aliasNames);
        } else {
          this.deviceData.aliasNames = [];
        }
        this.openViewDialogAfterDataLoad();
      },
      error: (error) => {
        console.error('Error loading device aliases:', error);
        this.deviceData.aliasNames = [];
        this.openViewDialogAfterDataLoad();
      }
    });
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
    
    this.originalIsActive = true; // Reset original active state for Add mode
    this.deviceData = {
      deviceId: -1,
      deviceName: '',
      deviceFamilyId: null,
      customerID: null,
      isActive: true, // In Add mode, always true (matching TFS behavior - checkbox is disabled but checked)
      testDevice: '',
      reliabilityDevice: '',
      aliasNames: [],
      newAliasName: '',
      sku: '',
      partType: 'N/A',
      lotType: 'Standard',
      labelMapping: false,
      label1: null,
      label2: null,
      label3: null,
      label4: null,
      label5: null,
      trayTubeMapping: 'Device',
      countryOfOriginId: null,
      unitCost: 0,
      materialDescriptionId: null,
      usHtsCodeId: null,
      eccnId: null,
      licenseExceptionId: null,
      restrictedCountriesToShipIds: [] as number[],
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
        id: item.serviceCategoryId || item.ServiceCategoryId || item.masterListItemId || item.MasterListItemId,
        name: item.serviceCategoryName || item.ServiceCategoryName || item.itemText || item.ItemText
      }));
      console.log('Countries of Origin loaded:', this.countriesOfOrigin.length);
    } else {
      console.warn('masterData.coo not available');
    }
    
    // Load EAR Info dropdowns using getListItems API (PRD_Shipping_P_GetMasterListItems) - NO SPACES in list names
    this.loadListItemsDropdown('MaterialDescription', 'materialDescriptions');
    this.loadListItemsDropdown('USHTSCode', 'usHtsCodes');
    this.loadListItemsDropdown('ECCN', 'eccns');
    this.loadListItemsDropdown('LicenseType', 'licenseExceptions'); // Note: Original uses "LicenseType", not "LicenseException"
    
    // Load Restricted Countries - Original uses GetRestrictedCountries (tfsp_GetRestrictedCountries stored procedure)
    // Note: This requires a separate API endpoint that doesn't exist yet. Using masterData.country as fallback for now.
    this.loadRestrictedCountries();
    
    // Load Part Type using getMasterListItems API (PRD_P_GetMasterListItems) - same as Pack&Label Info
    this.loadMasterListDropdown('PartType', 'partTypes');
    
    // Load Lot Type using getMasterListItems API (PRD_P_GetMasterListItems) - uses "DeviceType" list name
    this.loadMasterListDropdown('DeviceType', 'lotTypes');
    
    // Load Pack&Label Info dropdowns using getMasterListItems API (PRD_P_GetMasterListItems)
    this.loadMasterListDropdown('MSL', 'msls');
    this.loadMasterListDropdown('PeakPackagebodytemperature', 'peakPackageBodyTemperatures'); // All lowercase in original
    this.loadMasterListDropdown('ShelfLife', 'shelfLifeMonths'); // "ShelfLife", not "Shelf Life Month"
    this.loadMasterListDropdown('FloorLife', 'floorLives');
    this.loadMasterListDropdown('PBFree', 'pbFrees');
    this.loadMasterListDropdown('PBFreeSticker', 'pbFreeStickers');
    this.loadMasterListDropdown('ROHS', 'rohses');
    this.loadMasterListDropdown('TrayStrapping', 'trayTubeStrappings'); // "TrayStrapping", not "Tray/Tube Strapping"
    this.loadMasterListDropdown('TrayStacking', 'trayStackings');
  }

  loadServiceCategoryDropdown(listName: string, propertyName: string): void {
    console.log(`Loading ServiceCategory for list: "${listName}" -> property: ${propertyName}`);
    this.apiService.ServiceCategory(listName).subscribe({
      next: (data: any) => {
        console.log(`ServiceCategory API response for "${listName}":`, data);
        // API returns ServiceCategory objects with ServiceCategoryId and ServiceCategoryName
        // But also handle cases where it might return masterListItemId/itemText format
        if (data && Array.isArray(data) && data.length > 0) {
          const mappedData = data.map((item: any) => ({
            id: item.serviceCategoryId || item.ServiceCategoryId || item.masterListItemId || item.MasterListItemId,
            name: item.serviceCategoryName || item.ServiceCategoryName || item.itemText || item.ItemText
          }));
          (this as any)[propertyName] = mappedData;
          console.log(`✓ Loaded ${propertyName} (${listName}): ${mappedData.length} items`, mappedData.slice(0, 3));
          // Trigger change detection after loading to update UI
          this.cdr.detectChanges();
        } else {
          console.warn(`⚠ No data returned for list: ${listName}`, data);
          (this as any)[propertyName] = [];
        }
      },
      error: (error: any) => {
        console.error(`✗ Error loading '${listName}':`, error.status, error.statusText, error.message, error);
        // Keep empty array on error - dropdown will remain empty
        (this as any)[propertyName] = [];
      }
    });
  }

  loadListItemsDropdown(listName: string, propertyName: string): void {
    console.log(`Loading ListItems (PRD_Shipping_P_GetMasterListItems) for list: "${listName}" -> property: ${propertyName}`);
    this.apiService.getListItems(listName, null).subscribe({
      next: (data: any) => {
        console.log(`ListItems API response for "${listName}":`, data);
        // API returns MasterListItem objects with masterListItemId and itemText
        if (data && Array.isArray(data) && data.length > 0) {
          const mappedData = data.map((item: any) => ({
            id: item.masterListItemId || item.MasterListItemId,
            name: item.itemText || item.ItemText
          }));
          (this as any)[propertyName] = mappedData;
          console.log(`✓ Loaded ${propertyName} (${listName}): ${mappedData.length} items`, mappedData.slice(0, 3));
          // Trigger change detection after loading to update UI
          this.cdr.detectChanges();
        } else {
          console.warn(`⚠ No data returned for list: ${listName}`, data);
          (this as any)[propertyName] = [];
        }
      },
      error: (error: any) => {
        console.error(`✗ Error loading '${listName}':`, error.status, error.statusText, error.message, error);
        // Keep empty array on error - dropdown will remain empty
        (this as any)[propertyName] = [];
      }
    });
  }

  loadMasterListDropdown(listName: string, propertyName: string): void {
    console.log(`Loading MasterList (PRD_P_GetMasterListItems) for list: "${listName}" -> property: ${propertyName}`);
    this.apiService.getMasterListItems(listName, null).subscribe({
      next: (data: any) => {
        console.log(`MasterList API response for "${listName}":`, data);
        // API returns MasterList objects with masterListItemId and itemText
        if (data && Array.isArray(data) && data.length > 0) {
          let mappedData: any[];
          
          // For PartType and DeviceType (Lot Type), use {value, text, id} format to allow ID-to-text conversion
          if (listName === 'PartType') {
            mappedData = data.map((item: any) => ({
              value: item.itemText || item.ItemText,
              text: item.itemText || item.ItemText,
              id: item.masterListItemId || item.MasterListItemId // Store ID for lookup
            }));
            // Add "N/A" as the first item (matching original TFS behavior)
            mappedData.unshift({ value: 'N/A', text: 'N/A', id: null });
            
            // If we have a stored partTypeId, convert it to text value now
            if ((this.deviceData as any).partTypeId) {
              const partTypeId = (this.deviceData as any).partTypeId;
              const partTypeItem = mappedData.find((pt: any) => pt.id === partTypeId);
              if (partTypeItem) {
                this.deviceData.partType = partTypeItem.value || partTypeItem.text;
                console.log(`✓ Converted PartTypeId ${partTypeId} to partType: ${this.deviceData.partType}`);
                delete (this.deviceData as any).partTypeId;
              }
            }
          } else if (listName === 'DeviceType') {
            // For Lot Type (DeviceType), use {value, text, id} format to allow ID-to-text conversion
            mappedData = data.map((item: any) => ({
              value: item.itemText || item.ItemText,
              text: item.itemText || item.ItemText,
              id: item.masterListItemId || item.MasterListItemId // Store ID for lookup
            }));
            
            // If we have a stored deviceTypeId, convert it to text value now
            if ((this.deviceData as any).deviceTypeId) {
              const deviceTypeId = (this.deviceData as any).deviceTypeId;
              const lotTypeItem = mappedData.find((lt: any) => lt.id === deviceTypeId);
              if (lotTypeItem) {
                this.deviceData.lotType = lotTypeItem.value || lotTypeItem.text;
                console.log(`✓ Converted DeviceTypeId ${deviceTypeId} to lotType: ${this.deviceData.lotType}`);
                delete (this.deviceData as any).deviceTypeId;
              }
            }
          } else {
            // For other dropdowns, use {id, name} format
            mappedData = data.map((item: any) => ({
              id: item.masterListItemId || item.MasterListItemId,
              name: item.itemText || item.ItemText
            }));
          }
          
          (this as any)[propertyName] = mappedData;
          console.log(`✓ Loaded ${propertyName} (${listName}): ${mappedData.length} items`, mappedData.slice(0, 3));
          // Trigger change detection after loading to update UI
          this.cdr.detectChanges();
        } else {
          console.warn(`⚠ No data returned for list: ${listName}`, data);
          // For PartType, at least include "N/A" option
          if (listName === 'PartType') {
            (this as any)[propertyName] = [{ value: 'N/A', text: 'N/A' }];
          } else if (listName === 'DeviceType') {
            // For Lot Type, include "Standard" as fallback (matching API default)
            (this as any)[propertyName] = [{ value: 'Standard', text: 'Standard' }];
          } else {
            (this as any)[propertyName] = [];
          }
        }
      },
      error: (error: any) => {
        console.error(`✗ Error loading '${listName}':`, error.status, error.statusText, error.message, error);
        // For PartType, at least include "N/A" option on error
        if (listName === 'PartType') {
          (this as any)[propertyName] = [{ value: 'N/A', text: 'N/A' }];
        } else if (listName === 'DeviceType') {
          // For Lot Type, include "Standard" as fallback on error (matching API default)
          (this as any)[propertyName] = [{ value: 'Standard', text: 'Standard' }];
        } else {
          (this as any)[propertyName] = [];
        }
      }
    });
  }

  loadRestrictedCountries(): void {
    console.log('Loading Restricted Countries (tfsp_GetRestrictedCountries)');
    this.apiService.getRestrictedCountries().subscribe({
      next: (data: any) => {
        console.log('Restricted Countries API response:', data);
        if (data && Array.isArray(data) && data.length > 0) {
          this.restrictedCountries = data.map((item: any) => ({
            id: item.countryID || item.CountryID,
            name: item.countryName || item.CountryName
          }));
          console.log(`✓ Loaded restrictedCountries: ${this.restrictedCountries.length} items`, this.restrictedCountries.slice(0, 3));
          this.cdr.detectChanges();
        } else {
          console.warn('⚠ No data returned for restricted countries', data);
          this.restrictedCountries = [];
        }
      },
      error: (error: any) => {
        console.error('✗ Error loading restricted countries:', error.status, error.statusText, error.message, error);
        this.restrictedCountries = [];
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
    this.originalIsActive = true; // Reset original active state
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
      label1: null,
      label2: null,
      label3: null,
      label4: null,
      label5: null,
      trayTubeMapping: 'Device',
      countryOfOriginId: null,
      unitCost: 0,
      materialDescriptionId: null,
      usHtsCodeId: null,
      eccnId: null,
      licenseExceptionId: null,
      restrictedCountriesToShipIds: [] as number[],
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
      // Reload customer labels when customer changes if labelMapping is checked
      if (this.deviceData.labelMapping) {
        setTimeout(() => {
          this.loadCustomerLabels().then(() => {
            this.cdr.detectChanges();
          });
        }, 100);
      }
    } else {
      this.customerLabels = [];
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

  validateDevice(fromSave: boolean): boolean {
    // Matching TFS Validation() method (line 567)
    let isValid = true;
    const errorMessages: string[] = [];

    // Customer validation (matching TFS line 575-585)
    if (!this.deviceData.customerID || this.deviceData.customerID === -1 || this.deviceData.customerID === null) {
      errorMessages.push('Please Select Customer.');
    }

    // Device Family validation (matching TFS line 586-596)
    if (!this.deviceData.deviceFamilyId || this.deviceData.deviceFamilyId === -1 || this.deviceData.deviceFamilyId === null) {
      errorMessages.push('Please Select Device Family.');
    }

    // Device Name validation (required field)
    if (!this.deviceData.deviceName || this.deviceData.deviceName.trim() === '') {
      errorMessages.push('Please Enter Device Name.');
    }

    // Test Device validation (matching TFS line 597-607)
    if (!this.deviceData.testDevice || this.deviceData.testDevice.trim() === '') {
      errorMessages.push('Please Enter Test Device.');
    }

    // Reliability Device validation (matching TFS line 608-618) - Note: TFS has typo "Reliabilty"
    if (!this.deviceData.reliabilityDevice || this.deviceData.reliabilityDevice.trim() === '') {
      errorMessages.push('Please Enter Reliabilty Device.');
    }

    // Lot Type validation (required field)
    if (!this.deviceData.lotType || this.deviceData.lotType.trim() === '') {
      errorMessages.push('Please Select Lot Type.');
    }

    // UnitCost validation (matching TFS line 619-643, 1268-1308)
    const unitCostStr = this.deviceData.unitCost !== null && this.deviceData.unitCost !== undefined 
      ? String(this.deviceData.unitCost) 
      : '';
    
    if (!unitCostStr || unitCostStr.trim() === '') {
      errorMessages.push('Please Enter Device UnitCost.');
    } else {
      // Validate decimal format (matching TFS line 624-643)
      // Check if it's a valid number using regex (similar to ValidateScanParam)
      const isValidNumber = /^-?\d*\.?\d+$/.test(unitCostStr.trim());
      const unitCostValue = parseFloat(unitCostStr);
      
      if (!isValidNumber || isNaN(unitCostValue) || unitCostValue < 0) {
        errorMessages.push('Please enter valid decimal values in Device UnitCost.');
        this.deviceData.unitCost = 0;
      } else {
        // Check for empty decimal parts (e.g., "123." or ".456") - matching TFS line 630-641
        const parts = unitCostStr.split('.');
        if (parts.length > 2) {
          errorMessages.push('Please enter valid decimal values in Device UnitCost.');
        } else if (parts.length === 2) {
          // Check if either part is empty or invalid after trim
          const part0 = parts[0].trim();
          const part1 = parts[1].trim();
          if ((part0 === '' && part1 === '') || 
              (part0 === '' && part1 !== '' && !/^\d+$/.test(part1)) ||
              (part0 !== '' && !/^-?\d+$/.test(part0) && part1 !== '')) {
            errorMessages.push('Please enter valid decimal values in Device UnitCost.');
          }
          
          // Check maximum 16 decimal places (matching TFS line 1295)
          if (part1.length > 16) {
            errorMessages.push('Maximum 16 decimal values Allowed.');
            this.deviceData.unitCost = 0;
          }
        }
        
        // Check maximum value: 9999999999.9999999 (matching TFS line 1300-1303)
        if (unitCostValue >= 10000000000) {
          errorMessages.push('Unit Value cannot be greater than 9999999999.9999999.');
          this.deviceData.unitCost = 0;
        }
      }
    }

    // Inactive record validation (matching TFS line 644-645)
    // TFS checks: pMode.ToLower().Contains("edit") && !chkactive.IsChecked && !pActive
    // This means: in Edit mode, if checkbox is unchecked AND original was inactive
    if (this.isEditMode && !this.deviceData.isActive && !this.originalIsActive) {
      errorMessages.push("Inactive record can't be modified.");
    }

    // Label mapping validation (matching TFS line 647-653)
    if (this.deviceData.labelMapping && fromSave) {
      const labelValidation = this.validateLabels();
      if (labelValidation.labelAlert) {
        errorMessages.push(labelValidation.labelAlert);
      }
      if (labelValidation.duplicateLabels) {
        errorMessages.push(`Please check the selected Labels ${labelValidation.duplicateLabels} are same.`);
      }
    }

    // Show all error messages
    if (errorMessages.length > 0) {
      const errorMessage = errorMessages.join('\n');
      this.showNotification(errorMessage, 'error');
      isValid = false;
    }

    return isValid;
  }

  validateLabels(): { labelAlert: string; duplicateLabels: string } {
    // Matching TFS LabelValidations() method (line 1040)
    let duplicateLabels = '';
    let labelAlert = '';

    // Helper function to check if a label value is valid (primary check - based on ID)
    // This is the source of truth as labels are stored as IDs
    const isValidLabelId = (labelValue: any): boolean => {
      // Handle null, undefined, empty string
      if (labelValue === null || labelValue === undefined || labelValue === '') {
        return false;
      }
      
      // Convert to number and validate
      const numValue = Number(labelValue);
      
      // A valid label ID is a positive number (greater than 0)
      // 0 represents "--Select--" option, so it's not valid
      // NaN means invalid number, so also not valid
      return !isNaN(numValue) && numValue > 0;
    };

    // Check each label ID directly (this is the primary and most reliable check)
    const label1Valid = isValidLabelId(this.deviceData.label1);
    const label2Valid = isValidLabelId(this.deviceData.label2);
    const label3Valid = isValidLabelId(this.deviceData.label3);
    const label4Valid = isValidLabelId(this.deviceData.label4);
    const label5Valid = isValidLabelId(this.deviceData.label5);
    
    const hasAtLeastOneLabel = label1Valid || label2Valid || label3Valid || label4Valid || label5Valid;
    
    // If at least one label ID is valid, validation passes (ID check is the source of truth)
    if (!hasAtLeastOneLabel) {
      // Get display text for logging purposes only (not for validation decision)
      const labels: { [key: string]: string } = {
        Label1: this.deviceData.label1 ? this.getLabelDisplayText(this.deviceData.label1) : '',
        Label2: this.deviceData.label2 ? this.getLabelDisplayText(this.deviceData.label2) : '',
        Label3: this.deviceData.label3 ? this.getLabelDisplayText(this.deviceData.label3) : '',
        Label4: this.deviceData.label4 ? this.getLabelDisplayText(this.deviceData.label4) : '',
        Label5: this.deviceData.label5 ? this.getLabelDisplayText(this.deviceData.label5) : ''
      };
      
      // Debug logging to help diagnose issues
      console.error('Label validation failed. Label IDs:', {
        label1: this.deviceData.label1,
        label2: this.deviceData.label2,
        label3: this.deviceData.label3,
        label4: this.deviceData.label4,
        label5: this.deviceData.label5,
        label1Type: typeof this.deviceData.label1,
        label2Type: typeof this.deviceData.label2,
        label3Type: typeof this.deviceData.label3,
        label4Type: typeof this.deviceData.label4,
        label5Type: typeof this.deviceData.label5
      });
      console.error('Label validation details:', {
        label1Valid,
        label2Valid,
        label3Valid,
        label4Valid,
        label5Valid,
        label1Num: Number(this.deviceData.label1),
        label2Num: Number(this.deviceData.label2),
        label3Num: Number(this.deviceData.label3),
        label4Num: Number(this.deviceData.label4),
        label5Num: Number(this.deviceData.label5)
      });
      console.error('Label display texts:', labels);
      console.error('customerLabels loaded:', this.customerLabels && this.customerLabels.length > 0);
      console.error('customerLabels count:', this.customerLabels?.length || 0);
      console.error('deviceData:', {
        labelMapping: this.deviceData.labelMapping,
        customerID: this.deviceData.customerID,
        deviceId: this.deviceData.deviceId
      });
      
      labelAlert = 'Please Add atleast one Label.';
      return { labelAlert, duplicateLabels };
    }

    // Get display text for duplicate checking (only if at least one label is valid)
    const labels: { [key: string]: string } = {
      Label1: this.deviceData.label1 && isValidLabelId(this.deviceData.label1) ? this.getLabelDisplayText(this.deviceData.label1) : '',
      Label2: this.deviceData.label2 && isValidLabelId(this.deviceData.label2) ? this.getLabelDisplayText(this.deviceData.label2) : '',
      Label3: this.deviceData.label3 && isValidLabelId(this.deviceData.label3) ? this.getLabelDisplayText(this.deviceData.label3) : '',
      Label4: this.deviceData.label4 && isValidLabelId(this.deviceData.label4) ? this.getLabelDisplayText(this.deviceData.label4) : '',
      Label5: this.deviceData.label5 && isValidLabelId(this.deviceData.label5) ? this.getLabelDisplayText(this.deviceData.label5) : ''
    };

    // Check for duplicates (matching TFS line 1053-1107)
    for (let i = 1; i <= 5; i++) {
      const currentLabel = labels[`Label${i}`];
      if (currentLabel && currentLabel !== '') {
        for (let j = i + 1; j <= 5; j++) {
          const compareLabel = labels[`Label${j}`];
          if (compareLabel && compareLabel !== '' && currentLabel === compareLabel) {
            const duplicatePair = `Label${i}&Label${j}`;
            if (duplicateLabels === '') {
              duplicateLabels = duplicatePair;
            } else {
              duplicateLabels += `,${duplicatePair}`;
            }
          }
        }
      }
    }

    return { labelAlert, duplicateLabels };
  }

  validateAliasNames(): boolean {
    // Matching TFS ValidateAliasNames() method (line 1203)
    if (!this.deviceData.aliasNames || this.deviceData.aliasNames.length === 0) {
      return true; // No aliases to validate
    }

    const errorMessages: string[] = [];

    // Check maximum 10 alias names (matching TFS line 89-93)
    if (this.deviceData.aliasNames.length > 10) {
      errorMessages.push('Maximum 10 Alias Names Allowed!');
      this.showNotification(errorMessages.join('\n'), 'error');
      return false;
    }

    // Check for duplicate alias names (matching TFS line 1209)
    const aliasCounts = new Map<string, number>();
    this.deviceData.aliasNames.forEach((alias: string) => {
      const trimmedAlias = alias.trim();
      aliasCounts.set(trimmedAlias, (aliasCounts.get(trimmedAlias) || 0) + 1);
    });

    const duplicates = Array.from(aliasCounts.entries()).filter(([_, count]: [string, number]) => count > 1);
    if (duplicates.length > 0) {
      errorMessages.push('Duplicate Alias Names are not allowed');
    }

    // Validate each alias name (matching TFS line 1211-1221)
    this.deviceData.aliasNames.forEach((alias: string, index: number) => {
      if (!alias || alias.trim() === '') {
        if (!errorMessages.some(msg => msg.includes('enter Device Alias Name'))) {
          errorMessages.push('Please enter Device Alias Name');
        }
      } else {
        const trimmedAlias = alias.trim();
        if (trimmedAlias.includes(',') || trimmedAlias.includes('*')) {
          if (!errorMessages.some(msg => msg.includes('Special characters'))) {
            errorMessages.push('Special characters(, and *) are not allowed in Alias Name');
          }
        }
      }
    });

    if (errorMessages.length > 0) {
      const errorMessage = errorMessages.join('\n');
      this.showNotification(errorMessage, 'error');
      return false;
    }

    return true;
  }

  saveDevice(): void {
    // Ensure all label values are properly converted to numbers before validation
    // This handles cases where labels might be stored as strings or need type conversion
    // Also ensures that 0 values (which represent "--Select--") are converted to null
    if (this.deviceData.labelMapping) {
      // Helper function to safely convert label value to number or null
      const convertLabelValue = (labelValue: any): number | null => {
        if (labelValue === null || labelValue === undefined || labelValue === '') {
          return null;
        }
        const numValue = Number(labelValue);
        // 0 represents "--Select--" option, so treat it as null (invalid)
        // NaN means invalid number, also treat as null
        if (isNaN(numValue) || numValue === 0) {
          return null;
        }
        return numValue;
      };
      
      this.deviceData.label1 = convertLabelValue(this.deviceData.label1);
      this.deviceData.label2 = convertLabelValue(this.deviceData.label2);
      this.deviceData.label3 = convertLabelValue(this.deviceData.label3);
      this.deviceData.label4 = convertLabelValue(this.deviceData.label4);
      this.deviceData.label5 = convertLabelValue(this.deviceData.label5);
      
      // Convert any temporary label names to IDs if customer labels are loaded
      if (this.customerLabels && this.customerLabels.length > 0) {
        if ((this.deviceData as any).label1Name && !this.deviceData.label1) {
          const labelId = this.getLabelIdFromName((this.deviceData as any).label1Name);
          if (labelId !== null) {
            this.deviceData.label1 = Number(labelId);
            delete (this.deviceData as any).label1Name;
          }
        }
        if ((this.deviceData as any).label2Name && !this.deviceData.label2) {
          const labelId = this.getLabelIdFromName((this.deviceData as any).label2Name);
          if (labelId !== null) {
            this.deviceData.label2 = Number(labelId);
            delete (this.deviceData as any).label2Name;
          }
        }
        if ((this.deviceData as any).label3Name && !this.deviceData.label3) {
          const labelId = this.getLabelIdFromName((this.deviceData as any).label3Name);
          if (labelId !== null) {
            this.deviceData.label3 = Number(labelId);
            delete (this.deviceData as any).label3Name;
          }
        }
        if ((this.deviceData as any).label4Name && !this.deviceData.label4) {
          const labelId = this.getLabelIdFromName((this.deviceData as any).label4Name);
          if (labelId !== null) {
            this.deviceData.label4 = Number(labelId);
            delete (this.deviceData as any).label4Name;
          }
        }
        if ((this.deviceData as any).label5Name && !this.deviceData.label5) {
          const labelId = this.getLabelIdFromName((this.deviceData as any).label5Name);
          if (labelId !== null) {
            this.deviceData.label5 = Number(labelId);
            delete (this.deviceData as any).label5Name;
          }
        }
      }
      
      // Force change detection to ensure all values are updated
      this.cdr.detectChanges();
    }
    
    // Comprehensive validation matching TFS Validation() method
    if (!this.validateDevice(true)) {
      return; // Validation failed, error messages already shown
    }

    // Validate alias names (matching TFS ValidateAliasNames)
    if (!this.validateAliasNames()) {
      return; // Validation failed, error messages already shown
    }

    // Generate label format string if label mapping is enabled (matching TFS line 421)
    let labelFormatString = '';
    if (this.deviceData.labelMapping) {
      labelFormatString = this.generateLabelFormatString();
    }
    
    // Build label details list (matching TFS line 423)
    const labelDetailsList: any[] = [];
    // Note: In TFS, dicOfLabelDetails contains label details per label name
    // For now, we'll send empty list as the label details are saved separately via saveLabelDetails
    
    // Build request payload - ensure required fields are not null/undefined
    // Note: Backend expects non-nullable int for DeviceFamilyId and CustomerID
    // Validation should have already ensured these are valid numbers (> 0)
    // Explicitly convert to numbers to ensure proper type
    const deviceFamilyId = Number(this.deviceData.deviceFamilyId);
    const customerID = Number(this.deviceData.customerID);
    const deviceId = Number(this.deviceData.deviceId ?? -1);
    
    const request: any = {
      deviceId: deviceId,
      deviceName: this.deviceData.deviceName || '',
      deviceFamilyId: deviceFamilyId, // Required non-nullable int - validation ensures this exists
      customerID: customerID, // Required non-nullable int - validation ensures this exists
      // In Add mode, always set isActive to true (matching TFS behavior)
      isActive: this.isEditMode ? (this.deviceData.isActive ?? true) : true,
      testDevice: this.deviceData.testDevice || '',
      reliabilityDevice: this.deviceData.reliabilityDevice || '',
      aliasNames: this.deviceData.aliasNames || [],
      sku: this.deviceData.sku || '',
      // Convert PartType text value to ID for backend
      partType: this.convertPartTypeToId(this.deviceData.partType),
      partTypeId: this.convertPartTypeToId(this.deviceData.partType),
      // Convert LotType text value to ID for backend
      lotType: this.convertLotTypeToId(this.deviceData.lotType),
      deviceTypeId: this.convertLotTypeToId(this.deviceData.lotType),
      labelMapping: this.deviceData.labelMapping ?? false,
      trayTubeMapping: this.deviceData.trayTubeMapping || 'Device',
      unitCost: Number(this.deviceData.unitCost ?? 0),
      scheduleB: this.deviceData.scheduleB ?? false,
      // Optimistic locking fields (matching TFS lines 438-439)
      // Ensure lockId is always a valid number (not null/undefined) to avoid DBNull casting issues
      lockId: this.isEditMode ? (this.lockId != null && this.lockId !== -1 ? Number(this.lockId) : -1) : -1,
      lastModifiedOn: this.isEditMode ? (this.lastModifiedOn || null) : null,
      // Label fields (matching TFS lines 421-423)
      labels: labelFormatString || null,
      lstLabelDetails: labelDetailsList,
      createdBy: 0 // Will be set by backend from token
    };
    
    // Only include nullable int? fields if they have values (to avoid DBNull casting issues)
    // These fields are optional and should only be included if they have actual values
    // Explicitly convert to numbers to ensure proper type
    if (this.deviceData.countryOfOriginId != null && this.deviceData.countryOfOriginId !== -1) {
      request.countryOfOriginId = Number(this.deviceData.countryOfOriginId);
    }
    if (this.deviceData.materialDescriptionId != null && this.deviceData.materialDescriptionId !== -1) {
      request.materialDescriptionId = Number(this.deviceData.materialDescriptionId);
    }
    if (this.deviceData.usHtsCodeId != null && this.deviceData.usHtsCodeId !== -1) {
      request.usHtsCodeId = Number(this.deviceData.usHtsCodeId);
      request.USHTSCodeId = Number(this.deviceData.usHtsCodeId); // Also send PascalCase for backend compatibility
    }
    if (this.deviceData.eccnId != null && this.deviceData.eccnId !== -1) {
      request.eccnId = Number(this.deviceData.eccnId);
    }
    if (this.deviceData.licenseExceptionId != null && this.deviceData.licenseExceptionId !== -1) {
      request.licenseExceptionId = Number(this.deviceData.licenseExceptionId);
    }
    // RestrictedCountriesToShipId expects string (comma-separated IDs)
    const restrictedCountriesId = this.formatRestrictedCountriesIds(this.deviceData.restrictedCountriesToShipIds);
    if (restrictedCountriesId != null && restrictedCountriesId !== '') {
      request.restrictedCountriesToShipId = restrictedCountriesId;
    }
    if (this.deviceData.mslId != null && this.deviceData.mslId !== -1) {
      request.mslId = Number(this.deviceData.mslId);
    }
    if (this.deviceData.peakPackageBodyTemperatureId != null && this.deviceData.peakPackageBodyTemperatureId !== -1) {
      request.peakPackageBodyTemperatureId = Number(this.deviceData.peakPackageBodyTemperatureId);
    }
    if (this.deviceData.shelfLifeMonthId != null && this.deviceData.shelfLifeMonthId !== -1) {
      request.shelfLifeMonthId = Number(this.deviceData.shelfLifeMonthId);
    }
    if (this.deviceData.floorLifeId != null && this.deviceData.floorLifeId !== -1) {
      request.floorLifeId = Number(this.deviceData.floorLifeId);
    }
    if (this.deviceData.pbFreeId != null && this.deviceData.pbFreeId !== -1) {
      request.pbFreeId = Number(this.deviceData.pbFreeId);
    }
    if (this.deviceData.pbFreeStickerId != null && this.deviceData.pbFreeStickerId !== -1) {
      request.pbFreeStickerId = Number(this.deviceData.pbFreeStickerId);
    }
    if (this.deviceData.rohsId != null && this.deviceData.rohsId !== -1) {
      request.rohsId = Number(this.deviceData.rohsId);
    }
    if (this.deviceData.trayTubeStrappingId != null && this.deviceData.trayTubeStrappingId !== -1) {
      request.trayTubeStrappingId = Number(this.deviceData.trayTubeStrappingId);
    }
    if (this.deviceData.trayStackingId != null && this.deviceData.trayStackingId !== -1) {
      request.trayStackingId = Number(this.deviceData.trayStackingId);
    }
    
    // Ensure customerID and deviceFamilyId are valid numbers (not -1 or null for required fields)
    if (!request.customerID || request.customerID === -1) {
      console.error('Invalid customerID in request:', request.customerID);
      this.showNotification('Please select a valid customer', 'error');
      return;
    }
    
    if (!request.deviceFamilyId || request.deviceFamilyId === -1) {
      console.error('Invalid deviceFamilyId in request:', request.deviceFamilyId);
      this.showNotification('Please select a valid device family', 'error');
      return;
    }

    // Log request payload for debugging
    console.log('Saving device with request:', JSON.stringify(request, null, 2));
    console.log('Device data:', this.deviceData);
    console.log('Is Edit Mode:', this.isEditMode);
    console.log('API endpoint will be: api/v1/ise/devicemaster/device');

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
        console.error('Error saving device:', error);
        
        // Extract error message from HttpErrorResponse
        let errorMessage = 'Error saving device';
        if (error?.error) {
          // Try to get error message from response body
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.title) {
            errorMessage = error.error.title;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Include status code if available
        if (error?.status) {
          errorMessage += ` (Status: ${error.status})`;
        }
        
        this.showNotification(errorMessage, 'error');
        
        // Log full error details for debugging
        console.error('Full error details:', {
          status: error?.status,
          statusText: error?.statusText,
          error: error?.error,
          message: error?.message,
          url: error?.url,
          headers: error?.headers,
          name: error?.name
        });
        
        // Log the actual request that was sent
        if (error?.url) {
          console.error('Failed URL:', error.url);
        }
        console.error('Request payload that was sent:', JSON.stringify(request, null, 2));
      }
    });
  }

  getCustomerName(customerID: number | null): string {
    if (!customerID) return '';
    const customer = this.customersList.find(c => c.CustomerID === customerID);
    return customer ? customer.CustomerName : '';
  }

  getDeviceFamilyName(deviceFamilyId: number | null): string {
    if (!deviceFamilyId) return '';
    const family = this.deviceFamilies.find(f => f.deviceFamilyId === deviceFamilyId);
    return family ? family.deviceFamilyName : '';
  }

  getDropdownDisplayText(list: any[], id: number | null, idField: string = 'id', textField: string = 'name'): string {
    if (!id || !list || list.length === 0) return '';
    const item = list.find(item => item[idField] === id);
    return item ? item[textField] : '';
  }

  getRestrictedCountriesDisplayText(): string {
    if (!this.deviceData.restrictedCountriesToShipIds || this.deviceData.restrictedCountriesToShipIds.length === 0) {
      return '';
    }
    const selectedCountries = this.restrictedCountries.filter(country => 
      this.deviceData.restrictedCountriesToShipIds.includes(country.id)
    );
    return selectedCountries.map(country => country.name).join(', ');
  }

  parseRestrictedCountriesIds(value: any): number[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    // If it's a comma-separated string (from API), parse it
    if (typeof value === 'string') {
      return value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    }
    // If it's a single number (legacy), convert to array
    if (typeof value === 'number') {
      return [value];
    }
    return [];
  }

  formatRestrictedCountriesIds(ids: number[]): string | null {
    if (!ids || ids.length === 0) return null;
    return ids.join(',');
  }

  convertPartTypeToId(partTypeValue: string | null | undefined): number | null {
    if (!partTypeValue || !this.partTypes || this.partTypes.length === 0) return null;
    // If it's already a number, return it
    if (typeof partTypeValue === 'number') return partTypeValue;
    // Find the partType item by text value
    const partTypeItem = this.partTypes.find((pt: any) => 
      (pt.value && pt.value.toLowerCase() === partTypeValue.toLowerCase()) ||
      (pt.text && pt.text.toLowerCase() === partTypeValue.toLowerCase())
    );
    // Return the ID if found, otherwise try to parse as number
    if (partTypeItem && partTypeItem.id !== null && partTypeItem.id !== undefined) {
      return Number(partTypeItem.id);
    }
    // Try to parse as number if it's a numeric string
    const parsed = parseInt(partTypeValue);
    return !isNaN(parsed) ? parsed : null;
  }

  convertLotTypeToId(lotTypeValue: string | null | undefined): number | null {
    if (!lotTypeValue || !this.lotTypes || this.lotTypes.length === 0) return null;
    // If it's already a number, return it
    if (typeof lotTypeValue === 'number') return lotTypeValue;
    // Find the lotType item by text value
    const lotTypeItem = this.lotTypes.find((lt: any) => 
      (lt.value && lt.value.toLowerCase() === lotTypeValue.toLowerCase()) ||
      (lt.text && lt.text.toLowerCase() === lotTypeValue.toLowerCase())
    );
    // Return the ID if found, otherwise try to parse as number
    if (lotTypeItem && lotTypeItem.id !== null && lotTypeItem.id !== undefined) {
      return Number(lotTypeItem.id);
    }
    // Try to parse as number if it's a numeric string
    const parsed = parseInt(lotTypeValue);
    return !isNaN(parsed) ? parsed : null;
  }

  isAllRestrictedCountriesSelected(): boolean {
    if (!this.restrictedCountries || this.restrictedCountries.length === 0) return false;
    if (!this.deviceData.restrictedCountriesToShipIds || this.deviceData.restrictedCountriesToShipIds.length === 0) return false;
    return this.deviceData.restrictedCountriesToShipIds.length === this.restrictedCountries.length;
  }

  toggleSelectAllRestrictedCountries(event?: any): void {
    if (!this.restrictedCountries || this.restrictedCountries.length === 0) return;
    
    const isChecked = event ? event.target.checked : !this.isAllRestrictedCountriesSelected();
    
    if (isChecked) {
      // Select all countries
      this.deviceData.restrictedCountriesToShipIds = this.restrictedCountries.map(country => country.id);
    } else {
      // Deselect all countries
      this.deviceData.restrictedCountriesToShipIds = [];
    }
    
    // Trigger change detection
    this.cdr.detectChanges();
  }

  onLabelMappingChange(): void {
    if (!this.deviceData.labelMapping) {
      // Clear label values when unchecked
      this.deviceData.label1 = null;
      this.deviceData.label2 = null;
      this.deviceData.label3 = null;
      this.deviceData.label4 = null;
      this.deviceData.label5 = null;
    } else {
      // Load customer labels when checked
      this.loadCustomerLabels().then(() => {
        this.cdr.detectChanges();
      });
    }
  }


  loadCustomerLabels(): Promise<void> {
    return new Promise((resolve) => {
    if (this.deviceData.customerID) {
      // Get customer name from customersList (used in dialog)
      const customer = this.customersList.find((c: any) => 
        c.id === this.deviceData.customerID || 
        c.CustomerID === this.deviceData.customerID ||
        c.customerID === this.deviceData.customerID
      );
      if (customer) {
        const customerName = customer.CustomerName || customer.customerName || customer.name || customer.Name || '';
        console.log('Loading customer labels for customerID:', this.deviceData.customerID, 'customerName:', customerName);
        console.log('Customer object:', customer);
        this.apiService.getCustomerLabelList(customerName).subscribe({
          next: (data: any) => {
            console.log('Customer Labels API response:', data);
            if (data && Array.isArray(data) && data.length > 0) {
              // Add --Select-- as first option - create new array to ensure reference change triggers update
              const newLabels = [
                { id: null, name: '--Select--' },
                ...data.map((item: any) => ({
                  id: Number(item.lID || item.LID),
                  name: item.lName || item.LName
                }))
              ];
              this.customerLabels = newLabels;
              console.log(`✓ Loaded customerLabels: ${this.customerLabels.length} items`, this.customerLabels.slice(0, 3));
              
              // Convert label names to IDs if they were stored temporarily
              if ((this.deviceData as any).label1Name) {
                const labelId = this.getLabelIdFromName((this.deviceData as any).label1Name);
                if (labelId !== null) {
                  this.deviceData.label1 = Number(labelId);
                }
                delete (this.deviceData as any).label1Name;
              }
              if ((this.deviceData as any).label2Name) {
                const labelId = this.getLabelIdFromName((this.deviceData as any).label2Name);
                if (labelId !== null) {
                  this.deviceData.label2 = Number(labelId);
                }
                delete (this.deviceData as any).label2Name;
              }
              if ((this.deviceData as any).label3Name) {
                const labelId = this.getLabelIdFromName((this.deviceData as any).label3Name);
                if (labelId !== null) {
                  this.deviceData.label3 = Number(labelId);
                }
                delete (this.deviceData as any).label3Name;
              }
              if ((this.deviceData as any).label4Name) {
                const labelId = this.getLabelIdFromName((this.deviceData as any).label4Name);
                if (labelId !== null) {
                  this.deviceData.label4 = Number(labelId);
                }
                delete (this.deviceData as any).label4Name;
              }
              if ((this.deviceData as any).label5Name) {
                const labelId = this.getLabelIdFromName((this.deviceData as any).label5Name);
                if (labelId !== null) {
                  this.deviceData.label5 = Number(labelId);
                }
                delete (this.deviceData as any).label5Name;
              }
              
              this.cdr.detectChanges();
              resolve();
            } else {
              console.warn('⚠ No data returned for customer labels', data);
              this.customerLabels = [{ id: null, name: '--Select--' }];
              this.cdr.detectChanges();
              resolve();
            }
          },
            error: (error: any) => {
              console.error('✗ Error loading customer labels:', error.status, error.statusText, error.message, error);
              this.customerLabels = [{ id: null, name: '--Select--' }];
              this.cdr.detectChanges();
              resolve();
            }
        });
      } else {
        console.warn('⚠ Customer not found for customerID:', this.deviceData.customerID, 'customersList length:', this.customersList?.length);
        // Try loading all labels if customer not found
        this.apiService.getCustomerLabelList('').subscribe({
          next: (data: any) => {
            console.log('Customer Labels API response (fallback - all):', data);
            if (data && Array.isArray(data) && data.length > 0) {
              // Add --Select-- as first option - create new array to ensure reference change triggers update
              const newLabels = [
                { id: null, name: '--Select--' },
                ...data.map((item: any) => ({
                  id: Number(item.lID || item.LID),
                  name: item.lName || item.LName
                }))
              ];
              this.customerLabels = newLabels;
              console.log(`✓ Loaded customerLabels (fallback): ${this.customerLabels.length} items`);
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 0);
              resolve();
            } else {
              this.customerLabels = [{ id: null, name: '--Select--' }];
              this.cdr.detectChanges();
              resolve();
            }
          },
          error: (error: any) => {
            console.error('✗ Error loading customer labels (fallback):', error);
            this.customerLabels = [{ id: null, name: '--Select--' }];
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 0);
            resolve();
          }
        });
      }
    } else {
      // Load all labels if no customer selected (empty string)
      console.log('Loading all customer labels (no customer selected)');
      this.apiService.getCustomerLabelList('').subscribe({
        next: (data: any) => {
          console.log('Customer Labels API response (all):', data);
            if (data && Array.isArray(data) && data.length > 0) {
              // Add --Select-- as first option - create new array to ensure reference change triggers update
              const newLabels = [
                { id: null, name: '--Select--' },
                ...data.map((item: any) => ({
                  id: Number(item.lID || item.LID),
                  name: item.lName || item.LName
                }))
              ];
              this.customerLabels = newLabels;
              console.log(`✓ Loaded customerLabels: ${this.customerLabels.length} items`);
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 0);
              resolve();
            } else {
              console.warn('⚠ No data returned for customer labels (all)');
              this.customerLabels = [{ id: null, name: '--Select--' }];
              this.cdr.detectChanges();
              resolve();
            }
          },
          error: (error: any) => {
            console.error('✗ Error loading customer labels:', error);
            this.customerLabels = [{ id: null, name: '--Select--' }];
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 0);
            resolve();
          }
        });
      }
    });
  }

  getLabelDisplayText(labelId: number | null | undefined): string {
    // Handle null, undefined, or invalid values
    if (labelId === null || labelId === undefined) {
      return '';
    }
    
    // Handle empty string if somehow passed as a different type
    if (typeof labelId === 'string' && labelId === '') {
      return '';
    }
    
    // Convert to number for comparison to handle type mismatches (string vs number)
    const labelIdNum = Number(labelId);
    if (isNaN(labelIdNum) || labelIdNum === 0) {
      return '';
    }
    
    if (!this.customerLabels || this.customerLabels.length === 0) {
      return '';
    }
    
    // Find label by comparing both as numbers to handle type mismatches
    const label = this.customerLabels.find(l => {
      const lIdNum = l.id !== null && l.id !== undefined ? Number(l.id) : null;
      return lIdNum !== null && lIdNum === labelIdNum;
    });
    return label ? label.name : '';
  }

  getLabelIdFromName(labelName: string | null | undefined): number | null {
    if (!labelName || !this.customerLabels || this.customerLabels.length === 0) return null;
    const label = this.customerLabels.find(l => 
      (l.name && l.name.toLowerCase() === labelName.toLowerCase()) ||
      (l.name && l.name === labelName)
    );
    return label && label.id !== null ? Number(label.id) : null;
  }

  onLabel1Change(value: any): void {
    // Ensure value is stored as number to match ID type
    this.deviceData.label1 = value !== null && value !== undefined ? Number(value) : null;
  }

  onLabel2Change(value: any): void {
    // Ensure value is stored as number to match ID type
    this.deviceData.label2 = value !== null && value !== undefined ? Number(value) : null;
  }

  onLabel3Change(value: any): void {
    // Ensure value is stored as number to match ID type
    this.deviceData.label3 = value !== null && value !== undefined ? Number(value) : null;
  }

  onLabel4Change(value: any): void {
    // Ensure value is stored as number to match ID type
    this.deviceData.label4 = value !== null && value !== undefined ? Number(value) : null;
  }

  onLabel5Change(value: any): void {
    // Ensure value is stored as number to match ID type
    this.deviceData.label5 = value !== null && value !== undefined ? Number(value) : null;
  }

  openLabelDetails(labelNumber: number): void {
    // Validate required fields first (same as TFS Validation(false) method)
    const missingFields: string[] = [];
    
    if (!this.deviceData.customerID) {
      missingFields.push('Customer');
    }
    if (!this.deviceData.deviceFamilyId) {
      missingFields.push('Device Family');
    }
    if (!this.deviceData.testDevice || this.deviceData.testDevice.trim() === '') {
      missingFields.push('Test Device');
    }
    if (!this.deviceData.reliabilityDevice || this.deviceData.reliabilityDevice.trim() === '') {
      missingFields.push('Reliability Device');
    }
    
    if (missingFields.length > 0) {
      const errorMessage = missingFields.length === 1 
        ? `Please ${missingFields[0] === 'Customer' || missingFields[0] === 'Device Family' ? 'Select' : 'Enter'} ${missingFields[0]}.`
        : `Please complete the following required fields: ${missingFields.join(', ')}.`;
      this.showNotification(errorMessage, 'error');
      return;
    }

    // Get the selected label NAME (text) from dropdown, not ID - matching TFS FindLabelId() method
    // Use the same check as isLabelSelected to ensure consistency
    // Force change detection first to ensure values are up to date
    this.cdr.detectChanges();
    
    // Re-check after change detection
    if (!this.isLabelSelected(labelNumber)) {
      console.error(`Label${labelNumber} not selected after change detection:`, {
        labelId: this.getLabelIdByNumber(labelNumber),
        deviceData: this.deviceData[`label${labelNumber}`]
      });
      this.showNotification(`Please select Label${labelNumber}.`, 'error');
      return;
    }
    
    const labelId = this.getLabelIdByNumber(labelNumber);
    
    // Check if customerLabels is loaded
    if (!this.customerLabels || this.customerLabels.length === 0) {
      // Reload customer labels and then retry
      this.loadCustomerLabels().then(() => {
        setTimeout(() => {
          this.openLabelDetails(labelNumber);
        }, 100);
      });
      return;
    }
    
    // Find the label by ID to get the name (matching TFS FindLabelId which gets text from dropdown)
    const selectedLabel = this.customerLabels.find(l => {
      const labelIdNum = l.id !== null && l.id !== undefined ? Number(l.id) : null;
      const searchIdNum = Number(labelId);
      return labelIdNum === searchIdNum;
    });
    
    // If not found, try string comparison as fallback
    if (!selectedLabel) {
      const fallbackLabel = this.customerLabels.find(l => String(l.id) === String(labelId));
      if (fallbackLabel) {
        const labelName = fallbackLabel.name;
        if (labelName && labelName.trim() !== '' && labelName !== '--Select--') {
          console.log(`Opening label details dialog for Label${labelNumber}: ${labelName}`);
          this.currentLabelName = labelName;
          this.currentLabelNumber = labelNumber; // Store which label number triggered the dialog
          this.loadLabelDetails(labelName);
          return;
        }
      }
      
      this.showNotification(`Label${labelNumber} not found. Please select a valid label.`, 'error');
      return;
    }
    
    // Get label name (text) - matching TFS which uses dropdown text, not ID
    const labelName = selectedLabel.name;
    
    if (!labelName || labelName.trim() === '' || labelName === '--Select--') {
      this.showNotification(`Please select Label${labelNumber}.`, 'error');
      return;
    }
    
    console.log(`Opening label details dialog for Label${labelNumber}: ${labelName}`);
    
    // Open the label details dialog - pass label name (text) like TFS does
    this.currentLabelName = labelName;
    this.currentLabelNumber = labelNumber; // Store which label number triggered the dialog
    this.loadLabelDetails(labelName);
  }

  loadLabelDetails(labelName: string): void {
    if (!this.deviceData.customerID) {
      this.showNotification('Error: Customer is required to load label details', 'error');
      return;
    }
    if (!labelName || labelName.trim() === '') {
      this.showNotification('Error: Label name is required to load label details', 'error');
      return;
    }

    const customerId = this.deviceData.customerID;
    // In Add mode, deviceId is -1, but API repository converts deviceId <= 0 to DBNull.Value
    // For new devices, explicitly convert -1 to 0 to avoid potential server issues
    // The repository code checks: deviceId > 0 ? deviceId : DBNull.Value
    let deviceId: number;
    if (this.deviceData.deviceId && this.deviceData.deviceId > 0) {
      deviceId = this.deviceData.deviceId;
    } else {
      deviceId = 0; // API repository will convert 0 to DBNull.Value for new devices
    }
    console.log('Loading label details for:', {
      labelName: labelName,
      customerId: customerId,
      deviceId: deviceId,
      originalDeviceId: this.deviceData.deviceId,
      testDevice: this.deviceData.testDevice
    });
    
    this.apiService.getLabelDetails(customerId, deviceId, labelName, '').subscribe({
      next: (data: any) => {
        console.log('Label Details API response:', data);
        
        // Handle new response structure: { labelDetails: [], ldTypes: [], ldValues: [], packAndLabelImages: [] }
        // Matching TFS structure where stored procedure returns 4 tables:
        // Table[0]: Label mapping details
        // Table[1]: LD Types (for Type dropdown)
        // Table[2]: LD Values (for Value dropdown when Type is "Database")
        // Table[3]: Pack and Label Images (for ImageVisible dropdown for rohs/e1 fields)
        // or legacy array structure for backward compatibility
        let labelDetailsArray: any[] = [];
        let ldTypesArray: any[] = [];
        let ldValuesArray: any[] = [];
        let packAndLabelImagesArray: any[] = [];
        
        if (data) {
          if (data.labelDetails && Array.isArray(data.labelDetails)) {
            // New response structure (matching TFS LabelDetailsResponse)
            labelDetailsArray = data.labelDetails;
            ldTypesArray = data.ldTypes || data.LDTypes || [];
            ldValuesArray = data.ldValues || data.LDValues || [];
            packAndLabelImagesArray = data.packAndLabelImages || data.PackAndLabelImages || [];
          } else if (Array.isArray(data)) {
            // Legacy array structure (backward compatibility)
            labelDetailsArray = data;
          }
        }
        
        if (labelDetailsArray && labelDetailsArray.length > 0) {
          // Convert LD Types to simple string array for dropdown (matching TFS LDTypes method)
          // API already includes "--Select--" as first item (LDTypeId = 0), so extract all values
          const ldTypesForDropdown = ldTypesArray.map((lt: any) => lt.ldType || lt.LDType || '').filter((v: string) => v !== '');
          
          // Convert LD Values to simple string array for dropdown (matching TFS LDValues method)
          // API already includes "--Select--" as first item (LDValueId = 0), so extract all values
          const ldValuesForDropdown = ldValuesArray.map((lv: any) => lv.ldValue || lv.LDValue || '').filter((v: string) => v !== '');
          
          // Convert Pack and Label Images to simple string array for dropdown (matching TFS LImageDetails method)
          // API already includes "--Select--" as first item (ImageId = 0), so extract all values
          const packAndLabelImagesForDropdown = packAndLabelImagesArray.map((img: any) => img.imageVisible || img.ImageVisible || '').filter((v: string) => v !== '');
          
          // Store globally for use in dropdowns (matching TFS: objtemp.lstPrd_LDTypes, etc.)
          // Use ldTypes from API if available, otherwise fall back to hardcoded options
          if (ldTypesForDropdown.length > 0) {
            this.labelTypeOptions = ['--Select--', ...ldTypesForDropdown.filter((v: string) => v !== '--Select--')];
          }
          
          if (ldValuesForDropdown.length > 0) {
            this.labelValueOptions = ['--Select--', ...ldValuesForDropdown.filter((v: string) => v !== '--Select--')];
          }
          
          // Map label details and attach dropdown lists to each item (matching TFS lines 129-135)
          this.labelDetailsData = labelDetailsArray.map((item: any) => {
            // Initialize Type dropdown with "--Select--" if empty (matching TFS behavior)
            let ldType = item.ldType || item.LDType || '';
            if (!ldType || ldType.trim() === '') {
              ldType = '--Select--';
            }
            
            // Initialize ImageVisible with "--Select--" if empty (for rohs/e1 fields)
            let imageVisible = item.imageVisible || item.ImageVisible || '';
            if (!imageVisible || imageVisible.trim() === '') {
              imageVisible = '--Select--';
            }
            
            // Value should be initially empty (not "--Select--") - matching TFS requirement
            let ldValue = item.ldValue || item.LDValue || '';
            let ldText = item.ldText || item.LDText || '';
            
            // Determine visibility based on LDType (matching TFS BO logic)
            let cmbvisibility = 'Collapsed';
            let txtvisibility = 'Collapsed';
            let isEdit = item.isEdit !== undefined ? item.isEdit : (item.IsEdit !== undefined ? item.IsEdit : false);
            
            // Check if field is rohs or e1 (matching TFS line 117-118)
            const fieldName = (item.lfName || item.LFName || '').toLowerCase();
            const isRohsOrE1 = fieldName === 'rohs' || fieldName === 'e1';
            
            if (ldType && ldType !== '--Select--') {
              if (ldType === 'Constant') {
                // Constant -> show textbox
                txtvisibility = 'Visible';
                cmbvisibility = 'Collapsed';
                isEdit = false;
              } else if (ldType === 'Database') {
                // Database -> show combobox
                txtvisibility = 'Collapsed';
                cmbvisibility = 'Visible';
                isEdit = true;
              } else {
                // Other types -> show nothing
                txtvisibility = 'Collapsed';
                cmbvisibility = 'Collapsed';
                isEdit = true;
              }
            }
            
            return {
              labelId: item.labelId || item.LabelId || 0,
              lfName: item.lfName || item.LFName || '',
              ldType: ldType,
              ldText: ldText, // Initially empty
              ldValue: ldValue, // Initially empty (will be populated when Database is selected)
              imageVisible: imageVisible,
              isEnable: item.isEnable !== undefined ? item.isEnable : (item.IsEnable !== undefined ? item.IsEnable : true),
              isEdit: isEdit,
              cmbvisibility: cmbvisibility,
              txtvisibility: txtvisibility,
              ldTypecmbvisibility: item.ldTypecmbvisibility || item.LdTypecmbvisibility || 'Visible',
              imgcmbvisibility: item.imgcmbvisibility || item.Imgcmbvisibility || (isRohsOrE1 ? 'Visible' : 'Collapsed'),
              ldTypeId: item.ldTypeId || item.LDTypeId || 0,
              // Store dropdown lists for each item (matching TFS: obj.lstPrd_LDTypes, obj.lstPrd_LDValues, obj.lstPrd_PackandLabelImges)
              // All items share the same lists (matching TFS lines 132-134)
              ldTypesList: this.labelTypeOptions, // For Type dropdown
              ldValuesList: this.labelValueOptions, // For Value dropdown when Type is "Database"
              packAndLabelImagesList: packAndLabelImagesForDropdown.length > 0 
                ? ['--Select--', ...packAndLabelImagesForDropdown.filter((v: string) => v !== '--Select--')]
                : ['--Select--', 'Image1', 'Image2', 'Image3'] // Fallback if API doesn't return images
            };
          });
          
          console.log(`✓ Loaded labelDetailsData: ${this.labelDetailsData.length} items`);
          console.log(`✓ LD Types: ${ldTypesArray.length} items, LD Values: ${ldValuesArray.length} items, Images: ${packAndLabelImagesArray.length} items`);
          
          // Calculate grid height: header (22px) + rows (22px each) + border (2px)
          this.labelDetailsGridHeight = 22 + (this.labelDetailsData.length * 22) + 2;
          this.isLabelDetailsDialogOpen = true;
          this.cdr.detectChanges();
        } else {
          console.warn('⚠ No data returned for label details');
          this.labelDetailsData = [];
          this.labelDetailsGridHeight = 24; // Just header + border
          this.labelValueOptions = ['--Select--']; // Reset to default
          this.isLabelDetailsDialogOpen = true;
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('✗ Error loading label details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error,
          url: error.url,
          customerId: customerId,
          deviceId: deviceId,
          labelName: labelName
        });
        
        // Show more specific error message
        let errorMessage = 'Error loading label details';
        if (error.status === 404) {
          errorMessage = 'Label details not found. Please verify the label name and try again.';
        } else if (error.status === 400) {
          errorMessage = 'Invalid request. Please check that all required fields are filled.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.message) {
          errorMessage = `Error loading label details: ${error.message}`;
        }
        
        this.showNotification(errorMessage, 'error');
        this.labelDetailsData = [];
        this.labelDetailsGridHeight = 24;
      }
    });
  }

  closeLabelDetailsDialog(): void {
    this.isLabelDetailsDialogOpen = false;
    this.labelDetailsData = [];
    this.currentLabelName = '';
    this.currentLabelNumber = 0; // Reset label number
    this.labelDetailsGridHeight = 0;
  }

  saveLabelDetails(): void {
    // Validate first (matching TFS Validation() method)
    if (!this.validateLabelDetails()) {
      return; // Validation failed, error message already shown
    }

    // For Device screen, format and save (matching TFS btnSave_Click)
    // Note: TFS code shows the save is commented out, but we'll implement it
    if (!this.deviceData.customerID || !this.currentLabelName) {
      this.showNotification('Error: Missing required data to save label details', 'error');
      return;
    }
    
    // For new devices, deviceId may be 0 or -1, which is valid
    const deviceId = this.deviceData.deviceId && this.deviceData.deviceId > 0 ? this.deviceData.deviceId : 0;

    // Format the input string similar to TFS FillInputs method
    // Format: "LFName|LDType|Value@LFName|LDType|Value@"
    const inputString = this.fillInputs(true);
    
    if (!inputString) {
      this.showNotification('Error: No label data to save', 'error');
      return;
    }

    console.log('Saving label details with input:', inputString);
    this.apiService.saveLabelDetails(this.deviceData.customerID, deviceId, this.currentLabelName, inputString).subscribe({
      next: (result: number) => {
        if (result >= 0) {
          this.showNotification('Label details saved successfully', 'success');
          this.closeLabelDetailsDialog();
        } else {
          this.showNotification('Error saving label details to database', 'error');
        }
      },
      error: (error: any) => {
        console.error('✗ Error saving label details:', error);
        this.showNotification('Error saving label details: ' + (error.message || 'Unknown error'), 'error');
      }
    });
  }

  validateLabelDetails(): boolean {
    // Matching TFS Validation() method
    let isValid = true;
    let errorMessage = '';

    for (const lab of this.labelDetailsData) {
      if (lab.lfName?.toLowerCase() === 'rohs' || lab.lfName?.toLowerCase() === 'e1') {
        // For rohs/e1, check ImageVisible
        if (!lab.imageVisible || lab.imageVisible.trim() === '' || lab.imageVisible.includes('--Select--')) {
          errorMessage = `Please select the Field Type for: ${lab.lfName}`;
          isValid = false;
          break;
        }
      } else {
        // For other fields, check LDType
        if (!lab.ldType || lab.ldType.trim() === '' || lab.ldType.includes('--Select--')) {
          errorMessage = `Please select the Field Type for: ${lab.lfName}`;
          isValid = false;
          break;
        } else if (lab.ldType && !lab.ldType.includes('--Select--') && lab.ldType.toLowerCase() === 'database') {
          // If type is Database, check LDValue
          if (!lab.ldValue || lab.ldValue.trim() === '' || lab.ldValue.includes('--Select--')) {
            errorMessage = `Please select a Database Value for: ${lab.lfName}`;
            isValid = false;
            break;
          }
        }
      }
    }

    if (!isValid && errorMessage) {
      this.showNotification(errorMessage, 'error');
    }

    return isValid;
  }

  fillInputs(isLabelDataMapped: boolean): string {
    // Matching TFS FillInputs method
    let inputString = '';

    if (!isLabelDataMapped) {
      return inputString;
    }

    for (const item of this.labelDetailsData) {
      let strLDType = '';
      
      // For rohs/e1, use ImageVisible; otherwise use LDType (or ImageVisible if LDType contains "Select")
      if (item.lfName?.toLowerCase() === 'rohs' || item.lfName?.toLowerCase() === 'e1') {
        strLDType = item.imageVisible || '';
      } else {
        strLDType = (item.ldType?.includes('Select') || !item.ldType) ? (item.imageVisible || '') : (item.ldType || '');
      }

      let value = '';
      // For Device screen (PlotNumber is empty), use Database value if type is Database, otherwise use Text
      // Note: PlotNumber is not used in Device screen, so we use the Device logic
      if (item.ldType === 'Database') {
        value = item.ldValue || '';
      } else {
        value = item.ldText || '';
      }
      
      // Remove "Select" from value if present (matching TFS)
      if (value.includes('Select')) {
        value = '';
      }

      // Build input string: "LFName|LDType|Value@"
      if (inputString === '') {
        if (value !== '') {
          inputString = `${item.lfName}|${strLDType}|${value}@`;
        } else {
          inputString = `${item.lfName}|${strLDType}|@`;
        }
      } else {
        if (value !== '') {
          inputString = `${inputString}${item.lfName}|${strLDType}|${value}@`;
        } else {
          inputString = `${inputString}${item.lfName}|${strLDType}|@`;
        }
      }
    }

    return inputString;
  }

  fillLabelDictionary(): void {
    // Matching TFS FillLabelDictionary() method (lines 1027-1038)
    this.labelDictionary.clear();
    
    // Get label names from dropdowns (using label IDs to get names)
    const label1Name = this.deviceData.label1 ? this.getLabelDisplayText(this.deviceData.label1) : '';
    const label2Name = this.deviceData.label2 ? this.getLabelDisplayText(this.deviceData.label2) : '';
    const label3Name = this.deviceData.label3 ? this.getLabelDisplayText(this.deviceData.label3) : '';
    const label4Name = this.deviceData.label4 ? this.getLabelDisplayText(this.deviceData.label4) : '';
    const label5Name = this.deviceData.label5 ? this.getLabelDisplayText(this.deviceData.label5) : '';
    
    this.labelDictionary.set('Label1', label1Name);
    this.labelDictionary.set('Label2', label2Name);
    this.labelDictionary.set('Label3', label3Name);
    this.labelDictionary.set('Label4', label4Name);
    this.labelDictionary.set('Label5', label5Name);
  }

  generateLabelFormatString(): string {
    // Matching TFS LabelFormateString() method (lines 983-1001)
    let labelFormatString = '';
    
    // Fill label dictionary first
    this.fillLabelDictionary();
    
    // Get current label names from dropdowns
    const currentLabels: { [key: string]: string } = {
      Label1: this.deviceData.label1 ? this.getLabelDisplayText(this.deviceData.label1) : '',
      Label2: this.deviceData.label2 ? this.getLabelDisplayText(this.deviceData.label2) : '',
      Label3: this.deviceData.label3 ? this.getLabelDisplayText(this.deviceData.label3) : '',
      Label4: this.deviceData.label4 ? this.getLabelDisplayText(this.deviceData.label4) : '',
      Label5: this.deviceData.label5 ? this.getLabelDisplayText(this.deviceData.label5) : ''
    };
    
    let i = 1;
    for (const [key, originalLabelName] of this.labelDictionary.entries()) {
      const currentLabelName = currentLabels[key] || '';
      
      // Matching TFS logic: compare original with current and format accordingly
      if (i === 1 && originalLabelName !== currentLabels['Label1']) {
        labelFormatString = this.formatLabelString(currentLabels['Label1'], originalLabelName, labelFormatString);
      } else if (i === 2 && originalLabelName !== currentLabels['Label2']) {
        labelFormatString = this.formatLabelString(currentLabels['Label2'], originalLabelName, labelFormatString);
      } else if (i === 3 && originalLabelName !== currentLabels['Label3']) {
        labelFormatString = this.formatLabelString(currentLabels['Label3'], originalLabelName, labelFormatString);
      } else if (i === 4 && originalLabelName !== currentLabels['Label4']) {
        labelFormatString = this.formatLabelString(currentLabels['Label4'], originalLabelName, labelFormatString);
      } else if (i === 5 && originalLabelName !== currentLabels['Label5']) {
        labelFormatString = this.formatLabelString(currentLabels['Label5'], originalLabelName, labelFormatString);
      }
      i++;
    }
    
    return labelFormatString;
  }

  private formatLabelString(str: string, originalLabelName: string, currentFormatString: string): string {
    // Matching TFS FormateString() method (lines 1003-1025)
    try {
      if (originalLabelName !== '' && str !== '') {
        if (!currentFormatString.includes(originalLabelName + '|')) {
          currentFormatString = currentFormatString + originalLabelName + '|0@' + str + '|1@';
        } else {
          currentFormatString = currentFormatString + str + '|1@';
        }
      } else if (originalLabelName !== '' && str === '') {
        if (!currentFormatString.includes(originalLabelName + '|')) {
          currentFormatString = currentFormatString + originalLabelName + '|0@';
        }
      } else if (originalLabelName === '' && str !== '') {
        currentFormatString = currentFormatString + str + '|1@';
      }
    } catch (error) {
      console.error('Error formatting label string:', error);
    }
    return currentFormatString;
  }

  getLabelIdByNumber(labelNumber: number): number | null {
    switch (labelNumber) {
      case 1: return this.deviceData.label1;
      case 2: return this.deviceData.label2;
      case 3: return this.deviceData.label3;
      case 4: return this.deviceData.label4;
      case 5: return this.deviceData.label5;
      default: return null;
    }
  }

  isLabelSelected(labelNumber: number): boolean {
    const labelId = this.getLabelIdByNumber(labelNumber);
    // Label is selected if it's not null, not undefined, and not 0 (--Select-- has id: null)
    return labelId !== null && labelId !== undefined && labelId !== 0;
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.notificationService.show({
      content: message,
      type: { style: type, icon: true },
      position: { horizontal: 'right', vertical: 'top' },
      animation: { type: 'fade', duration: 400 }
    });
  }

  onLabelTypeChange(dataItem: any, newType: string): void {
    // Update visibility based on selected Type (matching TFS BO logic)
    if (newType === 'Constant') {
      // Constant -> show textbox
      dataItem.txtvisibility = 'Visible';
      dataItem.cmbvisibility = 'Collapsed';
      dataItem.isEdit = false;
      // Clear value when switching to Constant
      dataItem.ldValue = '';
    } else if (newType === 'Database') {
      // Database -> show combobox
      dataItem.txtvisibility = 'Collapsed';
      dataItem.cmbvisibility = 'Visible';
      dataItem.isEdit = true;
      // Clear text when switching to Database
      dataItem.ldText = '';
      // Ensure LDValues list is available (use global labelValueOptions loaded from API)
      if (!dataItem.ldValuesList || dataItem.ldValuesList.length <= 1) {
        dataItem.ldValuesList = this.labelValueOptions.length > 1 
          ? [...this.labelValueOptions] 
          : ['--Select--'];
      }
    } else {
      // Other types -> show nothing
      dataItem.txtvisibility = 'Collapsed';
      dataItem.cmbvisibility = 'Collapsed';
      dataItem.isEdit = true;
      // Clear both values
      dataItem.ldText = '';
      dataItem.ldValue = '';
    }
    
    // Force change detection to update UI
    this.cdr.detectChanges();
  }

  onTestDeviceChange(newValue: string): void {
    // Matching TFS txttestDevice_TextChanged behavior
    // In Add mode, copy Test Device text to Reliability Device
    // TFS logic: if (txttestDevice.Text.Trim() != string.Empty && pMode.ToLower().Contains("add"))
    //            { txtRelDevice.Text = txttestDevice.Text; }
    //            else if (pMode.ToLower().Contains("add")) { txtRelDevice.Text = string.Empty; }
    
    // Check if we're in Add mode (not Edit and not View)
    const isAddMode = !this.isEditMode && !this.isViewMode;
    
    if (isAddMode) {
      const testDeviceValue = newValue || this.deviceData.testDevice || '';
      if (testDeviceValue.trim() !== '') {
        // Copy Test Device to Reliability Device
        this.deviceData.reliabilityDevice = testDeviceValue;
      } else {
        // If Test Device is cleared, clear Reliability Device too
        this.deviceData.reliabilityDevice = '';
      }
    }
  }

  onUnitCostChange(newValue: string | number): void {
    // Matching TFS txtUnitCost_TextChanged behavior (lines 1268-1308)
    // Real-time validation for UnitCost
    const unitCostStr = newValue !== null && newValue !== undefined ? String(newValue) : '';
    
    if (unitCostStr === '' || unitCostStr.trim() === '') {
      return; // Allow empty, will be validated on save
    }
    
    // Check for multiple decimal points
    if (unitCostStr.includes('.')) {
      const parts = unitCostStr.split('.');
      if (parts.length > 2) {
        this.showNotification('Please enter valid UnitCost.', 'error');
        this.deviceData.unitCost = 0;
        return;
      }
      
      // Check decimal part length (max 16 decimals)
      if (parts.length === 2 && parts[1].length > 16) {
        this.showNotification('Maximum 16 decimal values Allowed.', 'error');
        this.deviceData.unitCost = 0;
        return;
      }
    }
    
    // Validate format
    const isValidNumber = /^-?\d*\.?\d+$/.test(unitCostStr.trim());
    if (!isValidNumber) {
      this.showNotification('Please enter valid UnitCost.', 'error');
      this.deviceData.unitCost = 0;
      return;
    }
    
    const unitCostValue = parseFloat(unitCostStr);
    
    // Check maximum value: 9999999999.9999999
    if (unitCostValue >= 10000000000) {
      this.showNotification('Unit Value cannot be greater than 9999999999.9999999.', 'error');
      this.deviceData.unitCost = 0;
      return;
    }
    
    // Check negative values
    if (unitCostValue < 0) {
      this.showNotification('Please enter valid UnitCost.', 'error');
      this.deviceData.unitCost = 0;
      return;
    }
  }

  openDeviceInfoDialog(): void {
    // Matching TFS hypLink_Click - opens DeviceInfo dialog
    this.isDeviceInfoDialogOpen = true;
  }

  closeDeviceInfoDialog(): void {
    this.isDeviceInfoDialogOpen = false;
  }

  getGridColumns(data: any[]): any[] {
    // Dynamically generate columns based on data structure (matching TFS DeviceInfo grid binding)
    if (!data || data.length === 0) {
      return [];
    }
    
    const firstItem = data[0];
    const columns: any[] = [];
    
    // Get all keys from the first item
    Object.keys(firstItem).forEach(key => {
      // Skip internal Angular properties
      if (!key.startsWith('_') && !key.startsWith('$')) {
        columns.push({
          field: key,
          title: this.formatColumnTitle(key),
          width: 150
        });
      }
    });
    
    return columns;
  }

  private formatColumnTitle(key: string): string {
    // Convert camelCase/PascalCase to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}


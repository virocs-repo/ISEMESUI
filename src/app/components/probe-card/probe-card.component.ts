import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { GridDataResult, PageChangeEvent, CellClickEvent } from '@progress/kendo-angular-grid';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';
import { NotificationService } from '@progress/kendo-angular-notification';
import { ICON } from 'src/app/services/app.interface';

@Component({
  selector: 'app-probe-card',
  templateUrl: './probe-card.component.html',
  styleUrls: ['./probe-card.component.scss'],
  standalone: false
})
export class ProbeCardComponent implements OnInit, AfterViewInit {
  readonly ICON = ICON;
  public pageSize = 25;
  public skip = 0;
  private originalData: any[] = [];
  public gridDataResult: GridDataResult = { data: [], total: 0 };
  public selectedActive: boolean = true; // Default to checked (true)
  public searchText: string = ''; // Search across all columns

  // Master data lists - Initialize with default "--Select--" option to ensure dropdown works
  public customersList: any[] = [];
  public platforms: any[] = [{ id: -1, name: '--Select--' }];
  public probeCardTypes: any[] = [{ id: -1, name: '--Select--' }];
  public probers: any[] = [{ id: -1, name: '--Select--' }];
  public boardTypes: any[] = [{ id: -1, name: '--Select--' }];

  // Selected filter values (only for fields NOT in grid columns)
  // Note: Customer and Customer Id removed from UI but still used in API call
  public selectedCustomerId: number | null = -1;
  public customerHWId: string = '';
  // With valuePrimitive="true", combobox can bind to primitive values (numbers) directly
  public selectedPlatformId: number | null = -1;
  public selectedProbeCardTypeId: number | null = -1;
  public selectedProberId: number | null = -1;
  public selectedBoardTypeId: number | null = -1;

  public columnData: any[] = [
    { field: 'iseId', title: 'ISE ID', width: 200 },
    { field: 'hardwareType', title: 'Hardware Type', width: 150 },
    { field: 'location', title: 'Hardware Location', width: 250 },
    { field: 'customerName', title: 'Customer Name', width: 200 },
    { field: 'secondaryCustomerName', title: 'Secondary Customer Name(s)', width: 200 },
    { field: 'status', title: 'Status', width: 360 },
    { field: 'deviceFamily', title: 'Device Family', width: 150 },
    { field: 'device', title: 'Device', width: 150 },
    { field: 'deviceAlias', title: 'Device Alias', width: 150 },
    { field: 'createdOn', title: 'Created Date', width: 150 }
  ];

  selectedRowIndex: number = -1;

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

  constructor(
    private apiService: ApiService,
    public appService: AppService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    // Note: selectedActive is already set to true in property declaration (matching device component pattern)
    this.loadMasterData();
    // Defer initial data load to avoid ExpressionChangedAfterItHasBeenCheckedError
    // This ensures the component is fully initialized before loading data
    setTimeout(() => {
      this.loadGridData();
    }, 0);
  }

  ngAfterViewInit(): void {
    // Ensure checkbox reflects the selectedActive value after view initialization
    // Explicitly set to true to ensure checkbox is checked on initial load
    this.selectedActive = true;
    this.cdr.detectChanges();
  }

  loadMasterData(): void {
    // Load Customers
    if (this.appService.masterData && this.appService.masterData.entityMap && this.appService.masterData.entityMap.Customer) {
      this.customersList = [
        { CustomerId: -1, CustomerName: '--Select--' },
        ...this.appService.masterData.entityMap.Customer
      ];
    } else {
      // Retry loading customers if not available yet
      setTimeout(() => {
        if (this.appService.masterData && this.appService.masterData.entityMap && this.appService.masterData.entityMap.Customer) {
          this.customersList = [
            { CustomerId: -1, CustomerName: '--Select--' },
            ...this.appService.masterData.entityMap.Customer
          ];
        }
      }, 500);
    }

    // Load Platforms
    // Note: API already includes "--Select--" option with id: -1
    this.apiService.getProbeCardPlatforms().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          // Remove any duplicate "--Select--" entries (keep only the first one with id: -1)
          const seen = new Set<number>();
          this.platforms = data.filter((item: any) => {
            if (item.id === -1) {
              if (seen.has(-1)) {
                return false; // Skip duplicate --Select--
              }
              seen.add(-1);
              return true;
            }
            if (seen.has(item.id)) {
              return false; // Skip duplicate IDs
            }
            seen.add(item.id);
            return true;
          });
        } else {
          this.platforms = [{ id: -1, name: '--Select--' }];
        }
        // Ensure default selection is set to -1 (--Select--)
        this.selectedPlatformId = -1;
      },
      error: (error) => {
        console.error('Error loading platforms:', error);
        this.platforms = [{ id: -1, name: '--Select--' }];
        this.selectedPlatformId = -1;
      }
    });

    // Load Probe Card Types
    // Note: API already includes "--Select--" option with id: -1
    this.apiService.getProbeCardTypes().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          // Remove any duplicate "--Select--" entries (keep only the first one with id: -1)
          const seen = new Set<number>();
          this.probeCardTypes = data.filter((item: any) => {
            if (item.id === -1) {
              if (seen.has(-1)) {
                return false; // Skip duplicate --Select--
              }
              seen.add(-1);
              return true;
            }
            if (seen.has(item.id)) {
              return false; // Skip duplicate IDs
            }
            seen.add(item.id);
            return true;
          });
        } else {
          this.probeCardTypes = [{ id: -1, name: '--Select--' }];
        }
        // Ensure default selection is set to -1 (--Select--)
        this.selectedProbeCardTypeId = -1;
      },
      error: (error) => {
        console.error('Error loading probe card types:', error);
        this.probeCardTypes = [{ id: -1, name: '--Select--' }];
        this.selectedProbeCardTypeId = -1;
      }
    });

    // Load Probers (Peripheral Mode)
    // Note: API already includes "--Select--" option with id: -1
    this.apiService.getProbeCardProbers().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          // Remove any duplicate "--Select--" entries (keep only the first one with id: -1)
          const seen = new Set<number>();
          this.probers = data.filter((item: any) => {
            if (item.id === -1) {
              if (seen.has(-1)) {
                return false; // Skip duplicate --Select--
              }
              seen.add(-1);
              return true;
            }
            if (seen.has(item.id)) {
              return false; // Skip duplicate IDs
            }
            seen.add(item.id);
            return true;
          });
        } else {
          this.probers = [{ id: -1, name: '--Select--' }];
        }
        // Ensure default selection is set to -1 (--Select--)
        this.selectedProberId = -1;
      },
      error: (error) => {
        console.error('Error loading probers:', error);
        this.probers = [{ id: -1, name: '--Select--' }];
        this.selectedProberId = -1;
      }
    });

    // Load Board Types
    // Note: API already includes "--Select--" option with id: -1
    this.apiService.getProbeCardBoardTypes().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          // Remove any duplicate "--Select--" entries (keep only the first one with id: -1)
          const seen = new Set<number>();
          this.boardTypes = data.filter((item: any) => {
            if (item.id === -1) {
              if (seen.has(-1)) {
                return false; // Skip duplicate --Select--
              }
              seen.add(-1);
              return true;
            }
            if (seen.has(item.id)) {
              return false; // Skip duplicate IDs
            }
            seen.add(item.id);
            return true;
          });
        } else {
          this.boardTypes = [{ id: -1, name: '--Select--' }];
        }
        // Ensure default selection is set to -1 (--Select--)
        this.selectedBoardTypeId = -1;
      },
      error: (error) => {
        console.error('Error loading board types:', error);
        this.boardTypes = [{ id: -1, name: '--Select--' }];
        this.selectedBoardTypeId = -1;
      }
    });
  }

  loadGridData(): void {
    // Reset to first page when filters change
    this.skip = 0;
    
    // Build search parameters from all combo box selections and Active checkbox
    // All combo boxes (Platform, Probe Card Type, Peripheral Mode, Board Type) and Active checkbox
    // trigger this method to search at the API level
    // Pass isActive parameter: if selectedActive is true, pass 1 (show only active), if false, pass 0 (show only inactive)
    // Matching device component pattern: const active = this.selectedActive === true ? true : false;
    const params: any = {
      customerId: this.selectedCustomerId !== null && this.selectedCustomerId !== -1 ? this.selectedCustomerId : -1,
      iseId: null, // ISE ID is in grid columns, search via "Search All Columns" or grid filter
      customerHWId: this.customerHWId && this.customerHWId.trim() !== '' ? this.customerHWId.trim() : null,
      platformId: this.selectedPlatformId !== null && this.selectedPlatformId !== -1 ? this.selectedPlatformId : -1,
      probeCardTypeId: this.selectedProbeCardTypeId !== null && this.selectedProbeCardTypeId !== -1 ? this.selectedProbeCardTypeId : -1,
      equipmentId: this.selectedProberId !== null && this.selectedProberId !== -1 ? this.selectedProberId : -1,
      boardTypeId: this.selectedBoardTypeId !== null && this.selectedBoardTypeId !== -1 ? this.selectedBoardTypeId : -1,
      hardwareTypeId: 4, // ProbeCard hardware type
      isActive: this.selectedActive === true ? 1 : 0
    };

    console.log('=== ProbeCard Search Request ===');
    console.log('Request params:', JSON.stringify(params, null, 2));
    console.log('selectedActive value:', this.selectedActive);

    this.apiService.searchProbeCard(params).subscribe({
      next: (data: any) => {
        console.log('=== ProbeCard Search Response ===');
        console.log('Response type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        console.log('Response data:', JSON.stringify(data, null, 2));
        console.log('Data length:', data ? (Array.isArray(data) ? data.length : 'Not an array') : 'null/undefined');
        
        if (data && Array.isArray(data) && data.length > 0) {
          console.log('First item (if any):', data[0]);
          console.log('First item keys:', Object.keys(data[0]));
          console.log('Available fields in first item:', data[0]);
        } else {
          console.warn('No data received or data is not an array');
        }

        // Handle response - could be array directly or wrapped in an object
        let responseData: any[] = [];
        if (Array.isArray(data)) {
          responseData = data;
        } else if (data && typeof data === 'object') {
          // Check if data is wrapped in a property
          if (data.data && Array.isArray(data.data)) {
            responseData = data.data;
          } else if (data.items && Array.isArray(data.items)) {
            responseData = data.items;
          } else if (data.results && Array.isArray(data.results)) {
            responseData = data.results;
          }
        }

        // Normalize property names (handle both PascalCase and camelCase from API)
        // This ensures fields are accessible regardless of how the API returns them
        this.originalData = responseData.map((item: any) => {
          const normalizedItem: any = {
            ...item,
            // Normalize key fields to camelCase for consistent access
            masterId: item.masterId !== undefined ? item.masterId : item.MasterId,
            probeCardId: item.probeCardId !== undefined ? item.probeCardId : item.ProbeCardId,
            iseId: item.iseId !== undefined ? item.iseId : (item.ISEId !== undefined ? item.ISEId : item.ISEID),
            customerName: item.customerName !== undefined ? item.customerName : item.CustomerName,
            customerId: item.customerId !== undefined ? item.customerId : item.CustomerId,
            customerHWId: item.customerHWId !== undefined ? item.customerHWId : item.CustomerHWId,
            hardwareType: item.hardwareType !== undefined ? item.hardwareType : item.HardwareType,
            location: item.location !== undefined ? item.location : item.Location,
            // Status - check multiple possible column names
            status: item.status !== undefined ? item.status : 
                   (item.Status !== undefined ? item.Status : 
                   (item.probeCardStatus !== undefined ? item.probeCardStatus : 
                   (item.ProbeCardStatus !== undefined ? item.ProbeCardStatus : ''))),
            isActive: item.isActive !== undefined ? item.isActive : 
                     (item.IsActive !== undefined ? item.IsActive : 
                     (item.active !== undefined ? item.active : 
                     (item.Active !== undefined ? item.Active : false))),
            platformName: item.platformName !== undefined ? item.platformName : item.PlatformName,
            probeCardType: item.probeCardType !== undefined ? item.probeCardType : item.ProbeCardType,
            equipmentName: item.equipmentName !== undefined ? item.equipmentName : item.EquipmentName,
            boardType: item.boardType !== undefined ? item.boardType : item.BoardType,
            createdOn: item.createdOn !== undefined ? item.createdOn : 
                      (item.CreatedOn !== undefined ? item.CreatedOn : 
                      (item.createdDate !== undefined ? item.createdDate : 
                      (item.CreatedDate !== undefined ? item.CreatedDate : ''))),
            modifiedOn: item.modifiedOn !== undefined ? item.modifiedOn : item.ModifiedOn,
            // SecondaryCustomerName - check multiple possible column names
            secondaryCustomerName: item.secondaryCustomerName !== undefined ? item.secondaryCustomerName :
                                 (item.SecondaryCustomerName !== undefined ? item.SecondaryCustomerName :
                                 (item.secondaryCustomer !== undefined ? item.secondaryCustomer :
                                 (item.SecondaryCustomer !== undefined ? item.SecondaryCustomer :
                                 (item.secondaryCustomerId !== undefined ? item.secondaryCustomerId :
                                 (item.SecondaryCustomerId !== undefined ? item.SecondaryCustomerId : ''))))),
            // DeviceFamily - check multiple possible column names
            deviceFamily: item.deviceFamily !== undefined ? item.deviceFamily :
                         (item.DeviceFamily !== undefined ? item.DeviceFamily :
                         (item.deviceFamilyName !== undefined ? item.deviceFamilyName :
                         (item.DeviceFamilyName !== undefined ? item.DeviceFamilyName : ''))),
            // Device - check multiple possible column names
            device: item.device !== undefined ? item.device :
                   (item.Device !== undefined ? item.Device :
                   (item.deviceName !== undefined ? item.deviceName :
                   (item.DeviceName !== undefined ? item.DeviceName : ''))),
            // DeviceAlias - check multiple possible column names
            deviceAlias: item.deviceAlias !== undefined ? item.deviceAlias :
                        (item.DeviceAlias !== undefined ? item.DeviceAlias :
                        (item.deviceAliasName !== undefined ? item.deviceAliasName :
                        (item.DeviceAliasName !== undefined ? item.DeviceAliasName : '')))
          };
          return normalizedItem;
        });
        console.log('Total records loaded:', this.originalData.length);
        
        if (this.originalData.length === 0) {
          console.warn('No records found. Check API response and filters.');
          this.showNotification('No records found matching the search criteria', 'info');
        }
        
        this.pageData();
      },
      error: (error) => {
        console.error('=== ProbeCard Search Error ===');
        console.error('Error loading probe cards:', error);
        console.error('Error status:', error?.status);
        console.error('Error message:', error?.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        this.showNotification('Error loading probe cards: ' + (error?.message || 'Unknown error'), 'error');
        this.gridDataResult = { data: [], total: 0 };
        this.originalData = [];
        this.cdr.detectChanges();
      }
    });
  }

  pageData(): void {
    const filteredData = this.filterData(this.originalData);
    console.log('=== pageData Debug ===');
    console.log('Original data count:', this.originalData.length);
    console.log('Filtered data count:', filteredData.length);
    console.log('Column definitions:', this.columnData.map(c => c.field));
    
    if (filteredData.length > 0) {
      console.log('First record fields:', Object.keys(filteredData[0]));
      console.log('First record values:', filteredData[0]);
      // Check if column fields exist in the data
      this.columnData.forEach(col => {
        const fieldExists = filteredData[0].hasOwnProperty(col.field) || 
                           filteredData[0].hasOwnProperty(col.field.charAt(0).toUpperCase() + col.field.slice(1)) ||
                           filteredData[0].hasOwnProperty(col.field.toUpperCase());
        console.log(`Column "${col.field}" exists: ${fieldExists}`);
        if (!fieldExists) {
          // Try to find matching field
          const matchingKey = Object.keys(filteredData[0]).find(key => 
            key.toLowerCase() === col.field.toLowerCase()
          );
          if (matchingKey) {
            console.log(`  -> Found matching field: "${matchingKey}"`);
          }
        }
      });
    } else {
      console.warn('No filtered data to display. Original data count:', this.originalData.length);
    }
    
    // Pass all filtered data to grid, let grid handle pagination
    this.gridDataResult = {
      data: filteredData || [],
      total: filteredData ? filteredData.length : 0
    };
    
    console.log('Grid data result:', {
      dataLength: this.gridDataResult.data.length,
      total: this.gridDataResult.total
    });
    
    // Trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();
  }

  filterData(data: any[]): any[] {
    // Additional client-side filtering for search text across all columns
    if (!this.searchText || this.searchText.trim() === '') {
      return data;
    }
    
    const searchLower = this.searchText.toLowerCase().trim();
    return data.filter(item => {
      // Search across all grid columns and all object properties
      // This includes both visible columns and any other fields in the data
      return Object.keys(item).some(key => {
        const value = item[key];
        if (value === null || value === undefined) {
          return false;
        }
        // Convert to string and search (handles numbers, dates, etc.)
        const stringValue = value.toString().toLowerCase();
        return stringValue.includes(searchLower);
      });
    });
  }

  onSearchTextChange(): void {
    // Reset to first page when search text changes
    this.skip = 0;
    // Re-filter the existing data without calling API
    // This allows real-time search across all grid columns
    this.pageData();
  }


  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.pageSize = event.take;
    // Grid handles pagination automatically with kendoGridBinding
  }

  onCellClick(event: CellClickEvent): void {
    this.selectedRowIndex = event.rowIndex;
  }


  // Dialog state
  public isDialogOpen: boolean = false;
  public isEditMode: boolean = false;
  public isViewMode: boolean = false;
  public selectedTabIndex: number = 0;
  public probeCardData: any = {};
  public probeCardDetails: any = null;

  // Sub-dialogs for Hardware Location, Pogo Tower, Correlation, External Equipment
  public isLocationDialogOpen: boolean = false;
  public isPogoTowerDialogOpen: boolean = false;
  public isCorrelationDialogOpen: boolean = false;
  public isExternalEquipmentDialogOpen: boolean = false;
  public isInterfaceBoardDialogOpen: boolean = false;
  
  // Flags for enabling/disabling buttons
  public enablePogoTower: boolean = false;
  public enableCorrelation: boolean = false;
  public enableExternalEquipment: boolean = false;
  public enableInterfaceBoard: boolean = false;

  // Location picker data
  public locationShelves: any[] = [];
  public locationSubSlots: any[] = [];
  public locationInfo: any[] = [];
  public selectedShelfId: number | null = null;
  public selectedSubSlotId: number | null = null;
  public selectedLocation: number | null = null;
  public selectedShelfName: string = '';
  public selectedSubSlotName: string = '';
  public locationMinSlot: number = 1;
  public locationMaxSlot: number = 100;
  public locationGrid: any[] = [];

  // Master data for dialog dropdowns
  public dialogCustomers: any[] = [];
  public dialogPlatforms: any[] = [];
  public dialogProbeCardTypes: any[] = [];
  public dialogProbers: any[] = [];
  public dialogBoardTypes: any[] = [];
  public dialogVendors: any[] = [];
  public dialogSecondaryCustomers: any[] = [];
  public dialogDimensions: any[] = [
    { id: '4"', name: '4"' },
    { id: '6"', name: '6"' },
    { id: '8"', name: '8"' },
    { id: '12"', name: '12"' }
  ];
  public dialogWaferDimensions: any[] = [
    { id: '4"', name: '4"' },
    { id: '6"', name: '6"' },
    { id: '8"', name: '8"' },
    { id: '12"', name: '12"' }
  ];

  // Attachments
  public attachments: any[] = [];
  public history: any[] = [];
  public deviceInfo: any = null;

  openAddDialog(): void {
    this.isEditMode = false;
    this.isViewMode = false;
    this.selectedTabIndex = 0;
    this.probeCardData = {
      masterId: -1,
      iseId: '',
      genISEId: '',
      customerId: null,
      customerHardwareId: '',
      probeCardTypeId: -1,
      probeCardTypeOthers: '',
      platformIds: [],
      equipmentIds: [],
      boardTypeId: -1,
      waferDimension: '',
      probeCardDimension: '',
      hardwareLocation: null,
      hardwareLocationText: '',
      pogoTowerId: null,
      pogoTowerISEId: '',
      interfaceBoardId: null,
      interfaceBoardISEId: '',
      externalEquipmentIds: [],
      externalEquipmentText: '',
      correlationIds: [],
      correlationText: '',
      vendorId: null,
      secondaryCustomerName: '',
      isITAR: false,
      isPowerCard: false,
      dtsId: '',
      comments: '',
      isActive: true
    };
    // Reset checkbox states for Add mode
    this.enablePogoTower = false;
    this.enableCorrelation = false;
    this.enableExternalEquipment = false;
    this.enableInterfaceBoard = false;
    this.attachments = [];
    this.history = [];
    this.deviceInfo = null;
    this.loadDialogMasterData();
    this.isDialogOpen = true;
  }

  onEdit(dataItem: any): void {
    if (dataItem && dataItem.masterId) {
      const masterId = dataItem.masterId || dataItem.MasterId;
      this.isEditMode = true;
      this.isViewMode = false;
      this.selectedTabIndex = 0;
      this.loadDialogMasterData();
      this.apiService.getProbeCardDetails(masterId).subscribe({
        next: (details: any) => {
          this.probeCardDetails = details;
          this.probeCardData = {
            masterId: details.masterId || details.MasterId,
            probeCardId: details.probeCardId || details.ProbeCardId,
            iseId: details.iseId || details.ISEId || '',
            genISEId: details.genISEID || details.GenISEID || '',
            customerId: details.customerId || details.CustomerId,
            customerName: details.customerName || details.CustomerName,
            customerHardwareId: details.customerHardwareId || details.CustomerHardwareId || '',
            probeCardTypeId: details.probeCardTypeId || details.ProbeCardTypeId || -1,
            probeCardTypeOthers: details.probeCardType_Others || details.ProbeCardType_Others || '',
            platformIds: details.platformIds || details.PlatformIds || [],
            equipmentIds: details.equipmentIds || details.EquipmentIds || [],
            boardTypeId: details.boardTypeId || details.BoardTypeId || -1,
            waferDimension: details.waferDimension || details.WaferDimension || '',
            probeCardDimension: details.probeCardDimension || details.ProbeCardDimension || '',
            hardwareLocation: details.hardwareLocation || details.HardwareLocation,
            hardwareLocationText: this.buildLocationText(details),
            pogoTowerId: details.pogoTowerId || details.PogoTowerId,
            pogoTowerISEId: details.pogoTowerISEId || details.PogoTowerISEId || '',
            pogoTowerIsIse: details.pogoTowerIsIse || details.PogoTowerIsIse || false,
            interfaceBoardId: details.interfaceBoardId || details.InterfaceBoardId,
            interfaceBoardISEId: details.interfaceBoardISEId || details.InterfaceBoardISEId || '',
            interfaceBoardIsIse: details.interfaceBoardIsIse || details.InterfaceBoardIsIse || false,
            externalEquipmentIds: details.externalEquipment?.map((e: any) => e.exEquipmentId || e.ExEquipmentId) || [],
            externalEquipmentText: this.getExternalEquipmentNamesFromDetails(details),
            correlationIds: details.correlations?.map((c: any) => c.exEquipmentId || c.ExEquipmentId) || [],
            correlationText: this.getCorrelationNamesFromDetails(details),
            vendorId: details.vendorId || details.VendorId,
            secondaryCustomerName: details.secondaryCustomerName || details.SecondaryCustomerName || '',
            isITAR: details.isITAR || details.IsITAR || false,
            isPowerCard: details.isPowerCard || details.IsPowerCard || false,
            dtsId: details.dtsId || details.DTSId || '',
            comments: details.comments || details.Comments || '',
            isActive: details.isActive !== undefined ? details.isActive : (details.IsActive !== undefined ? details.IsActive : true),
            status: details.status || details.Status || '',
            subSlotId: details.subSlotId || details.SubSlotId,
            shelfId: details.shelfId || details.ShelfId,
            shelf: details.shelf || details.Shelf || '',
            subSlot: details.subSlot || details.SubSlot || ''
          };
          // Initialize checkbox states based on existing data
          this.enablePogoTower = !!(details.pogoTowerId || details.PogoTowerId);
          this.enableCorrelation = !!(details.correlations && details.correlations.length > 0);
          this.enableExternalEquipment = !!(details.externalEquipment && details.externalEquipment.length > 0);
          this.enableInterfaceBoard = !!(details.interfaceBoardId || details.InterfaceBoardId);
          this.attachments = details.attachments || details.Attachments || [];
          this.history = []; // Will be loaded separately if API supports it
          this.deviceInfo = null; // Will be loaded separately if API supports it
          this.isDialogOpen = true;
        },
        error: (error) => {
          console.error('Error loading probe card details:', error);
          this.showNotification('Error loading probe card details', 'error');
        }
      });
    }
  }

  onView(dataItem: any): void {
    if (dataItem && dataItem.masterId) {
      const masterId = dataItem.masterId || dataItem.MasterId;
      this.isEditMode = false;
      this.isViewMode = true;
      this.selectedTabIndex = 0;
      this.loadDialogMasterData();
      this.apiService.getProbeCardDetails(masterId).subscribe({
        next: (details: any) => {
          this.probeCardDetails = details;
          this.probeCardData = {
            masterId: details.masterId || details.MasterId,
            probeCardId: details.probeCardId || details.ProbeCardId,
            iseId: details.iseId || details.ISEId || '',
            genISEId: details.genISEID || details.GenISEID || '',
            customerId: details.customerId || details.CustomerId,
            customerName: details.customerName || details.CustomerName,
            customerHardwareId: details.customerHardwareId || details.CustomerHardwareId || '',
            probeCardTypeId: details.probeCardTypeId || details.ProbeCardTypeId || -1,
            probeCardTypeOthers: details.probeCardType_Others || details.ProbeCardType_Others || '',
            platformIds: details.platformIds || details.PlatformIds || [],
            equipmentIds: details.equipmentIds || details.EquipmentIds || [],
            boardTypeId: details.boardTypeId || details.BoardTypeId || -1,
            waferDimension: details.waferDimension || details.WaferDimension || '',
            probeCardDimension: details.probeCardDimension || details.ProbeCardDimension || '',
            hardwareLocation: details.hardwareLocation || details.HardwareLocation,
            hardwareLocationText: this.buildLocationText(details),
            pogoTowerId: details.pogoTowerId || details.PogoTowerId,
            pogoTowerISEId: details.pogoTowerISEId || details.PogoTowerISEId || '',
            pogoTowerIsIse: details.pogoTowerIsIse || details.PogoTowerIsIse || false,
            interfaceBoardId: details.interfaceBoardId || details.InterfaceBoardId,
            interfaceBoardISEId: details.interfaceBoardISEId || details.InterfaceBoardISEId || '',
            interfaceBoardIsIse: details.interfaceBoardIsIse || details.InterfaceBoardIsIse || false,
            externalEquipmentIds: details.externalEquipment?.map((e: any) => e.exEquipmentId || e.ExEquipmentId) || [],
            externalEquipmentText: this.getExternalEquipmentNamesFromDetails(details),
            correlationIds: details.correlations?.map((c: any) => c.exEquipmentId || c.ExEquipmentId) || [],
            correlationText: this.getCorrelationNamesFromDetails(details),
            vendorId: details.vendorId || details.VendorId,
            secondaryCustomerName: details.secondaryCustomerName || details.SecondaryCustomerName || '',
            isITAR: details.isITAR || details.IsITAR || false,
            isPowerCard: details.isPowerCard || details.IsPowerCard || false,
            dtsId: details.dtsId || details.DTSId || '',
            comments: details.comments || details.Comments || '',
            isActive: details.isActive !== undefined ? details.isActive : (details.IsActive !== undefined ? details.IsActive : true),
            status: details.status || details.Status || '',
            subSlotId: details.subSlotId || details.SubSlotId,
            shelfId: details.shelfId || details.ShelfId,
            shelf: details.shelf || details.Shelf || '',
            subSlot: details.subSlot || details.SubSlot || ''
          };
          // Initialize checkbox states based on existing data
          this.enablePogoTower = !!(details.pogoTowerId || details.PogoTowerId);
          this.enableCorrelation = !!(details.correlations && details.correlations.length > 0);
          this.enableExternalEquipment = !!(details.externalEquipment && details.externalEquipment.length > 0);
          this.enableInterfaceBoard = !!(details.interfaceBoardId || details.InterfaceBoardId);
          this.attachments = details.attachments || details.Attachments || [];
          this.history = []; // Will be loaded separately if API supports it
          this.deviceInfo = null; // Will be loaded separately if API supports it
          this.isDialogOpen = true;
        },
        error: (error) => {
          console.error('Error loading probe card details:', error);
          this.showNotification('Error loading probe card details', 'error');
        }
      });
    }
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.isEditMode = false;
    this.isViewMode = false;
    this.selectedTabIndex = 0;
    this.probeCardData = {};
    this.probeCardDetails = null;
    this.attachments = [];
    this.history = [];
    this.deviceInfo = null;
  }

  loadDialogMasterData(): void {
    // Load customers
    if (this.appService.masterData && this.appService.masterData.entityMap && this.appService.masterData.entityMap.Customer) {
      this.dialogCustomers = this.appService.masterData.entityMap.Customer.map((c: any) => ({
        CustomerID: c.CustomerID || c.CustomerId,
        CustomerName: c.CustomerName
      }));
    }

    // Load platforms, probe card types, probers, board types
    this.apiService.getProbeCardPlatforms().subscribe({
      next: (data: any) => {
        this.dialogPlatforms = Array.isArray(data) ? data : [];
      }
    });

    this.apiService.getProbeCardTypes().subscribe({
      next: (data: any) => {
        this.dialogProbeCardTypes = Array.isArray(data) ? data : [];
      }
    });

    this.apiService.getProbeCardProbers().subscribe({
      next: (data: any) => {
        this.dialogProbers = Array.isArray(data) ? data : [];
      }
    });

    this.apiService.getProbeCardBoardTypes().subscribe({
      next: (data: any) => {
        this.dialogBoardTypes = Array.isArray(data) ? data : [];
      }
    });

    // Load vendors and secondary customers from masterData if available
    // Note: These may need separate API endpoints
  }

  onTabSelect(event: any): void {
    const index = (event && typeof event === 'object' && 'index' in event) ? event.index : event;
    this.selectedTabIndex = typeof index === 'number' ? index : 0;
  }

  saveProbeCard(): void {
    // TODO: Implement save functionality
    this.showNotification('Save functionality coming soon', 'info');
  }

  // Helper methods for dialog
  getCustomerName(customerId: number | null): string {
    if (!customerId || customerId === -1) return '';
    const customer = this.dialogCustomers.find((c: any) => c.CustomerID === customerId);
    return customer ? customer.CustomerName : '';
  }

  getProbeCardTypeName(typeId: number | null): string {
    if (!typeId || typeId === -1) return '';
    const type = this.dialogProbeCardTypes.find((t: any) => t.id === typeId);
    return type ? type.name : '';
  }

  getBoardTypeName(typeId: number | null): string {
    if (!typeId || typeId === -1) return '';
    const type = this.dialogBoardTypes.find((t: any) => t.id === typeId);
    return type ? type.name : '';
  }

  getPlatformNames(platformIds: number[]): string {
    if (!platformIds || platformIds.length === 0) return '';
    return platformIds.map((id: number) => {
      const platform = this.dialogPlatforms.find((p: any) => p.id === id);
      return platform ? platform.name : '';
    }).filter((name: string) => name !== '').join(', ');
  }

  getProberNames(equipmentIds: number[]): string {
    if (!equipmentIds || equipmentIds.length === 0) return '';
    return equipmentIds.map((id: number) => {
      const prober = this.dialogProbers.find((p: any) => p.id === id);
      return prober ? prober.name : '';
    }).filter((name: string) => name !== '').join(', ');
  }

  getVendorName(vendorId: number | null): string {
    if (!vendorId || vendorId === -1) return '';
    const vendor = this.dialogVendors.find((v: any) => v.id === vendorId);
    return vendor ? vendor.name : '';
  }

  getExternalEquipmentNames(): string {
    if (!this.probeCardDetails || !this.probeCardDetails.externalEquipment) return '';
    return this.probeCardDetails.externalEquipment.map((e: any) => e.exISEId || e.ExISEId || '').join(', ');
  }

  getCorrelationNames(): string {
    if (!this.probeCardDetails || !this.probeCardDetails.correlations) return '';
    return this.probeCardDetails.correlations.map((c: any) => c.exISEId || c.ExISEId || '').join(', ');
  }

  getCorrelationNamesFromDetails(details: any): string {
    if (!details || !details.correlations) return '';
    return details.correlations.map((c: any) => c.exISEId || c.ExISEId || '').join(', ');
  }

  getExternalEquipmentNamesFromDetails(details: any): string {
    if (!details || !details.externalEquipment) return '';
    return details.externalEquipment.map((e: any) => e.exISEId || e.ExISEId || '').join(', ');
  }

  buildLocationText(details: any): string {
    if (!details) return '';
    const shelf = details.shelf || details.Shelf || '';
    const subSlot = details.subSlot || details.SubSlot || '';
    const location = details.hardwareLocation || details.HardwareLocation || '';
    
    if (shelf && subSlot) {
      return `${shelf} ${subSlot} ${location}`;
    } else if (subSlot) {
      return `${subSlot} ${location}`;
    }
    return location;
  }

  onProbeCardTypeChange(): void {
    // Show/hide "Others" text field based on selection
    // This is handled in the template with *ngIf
  }

  uploadAttachment(): void {
    // TODO: Implement file upload
    this.showNotification('File upload functionality coming soon', 'info');
  }

  deleteAttachment(attachment: any): void {
    // TODO: Implement delete attachment
    this.showNotification('Delete attachment functionality coming soon', 'info');
  }

  // Hardware Location Dialog
  openLocationDialog(): void {
    if (!this.probeCardData.customerId || this.probeCardData.customerId === -1) {
      this.showNotification('Please select a customer first', 'warning');
      return;
    }
    // Load shelves for hardware type 4 (ProbeCard) and selected platform
    const hardwareTypeId = 4; // ProbeCard
    const platformId = this.probeCardData.platformIds && this.probeCardData.platformIds.length > 0 
      ? this.probeCardData.platformIds.join(',') 
      : null;
    
        this.apiService.getProbeCardSlots(hardwareTypeId, platformId).subscribe({
      next: (slots: any) => {
        // Normalize field names (handle both camelCase and PascalCase)
        this.locationShelves = (Array.isArray(slots) ? slots : []).map((s: any) => ({
          slotId: s.slotId !== undefined ? s.slotId : s.SlotId,
          slotName: s.slotName !== undefined ? s.slotName : s.SlotName || '',
          isMultipleHWAllowed: s.isMultipleHWAllowed !== undefined ? s.isMultipleHWAllowed : s.IsMultipleHWAllowed || false,
          hwLimit: s.hwLimit !== undefined ? s.hwLimit : s.HWLimit || 0
        }));
        
        if (this.locationShelves.length > 0) {
          // Add default "--Select--" option
          this.locationShelves = [{ slotId: -1, slotName: '--Select--' }, ...this.locationShelves];
          // Auto-select first real shelf (skip --Select--)
          if (this.locationShelves.length > 1) {
            this.selectedShelfId = this.locationShelves[1].slotId;
            this.selectedShelfName = this.locationShelves[1].slotName || '';
            this.onShelfSelected();
          }
        }
        this.isLocationDialogOpen = true;
      },
      error: (error) => {
        console.error('Error loading shelves:', error);
        this.showNotification('Error loading location data', 'error');
      }
    });
  }

  closeLocationDialog(): void {
    this.isLocationDialogOpen = false;
    this.selectedShelfId = null;
    this.selectedSubSlotId = null;
    this.selectedLocation = null;
    this.locationSubSlots = [];
    this.locationInfo = [];
    this.locationGrid = [];
  }

  onShelfSelected(): void {
    if (!this.selectedShelfId || this.selectedShelfId === -1) {
      this.locationSubSlots = [];
      this.locationGrid = [];
      return;
    }
    
    // Update shelf name
    const shelf = this.locationShelves.find((s: any) => s.slotId === this.selectedShelfId);
    if (shelf) {
      this.selectedShelfName = shelf.slotName || '';
    }
    
    this.apiService.getProbeCardSubSlots(this.selectedShelfId).subscribe({
      next: (subSlots: any) => {
        // Normalize field names (handle both camelCase and PascalCase)
        this.locationSubSlots = (Array.isArray(subSlots) ? subSlots : []).map((s: any) => ({
          subSlotId: s.subSlotId !== undefined ? s.subSlotId : s.SubSlotId,
          subSlotName: s.subSlotName !== undefined ? s.subSlotName : s.SubSlotName || '',
          minSlot: s.minSlot !== undefined ? s.minSlot : s.MinSlot || 1,
          maxSlot: s.maxSlot !== undefined ? s.maxSlot : s.MaxSlot || 100
        }));
        
        if (this.locationSubSlots.length > 0) {
          // Add default "--Select--" option
          this.locationSubSlots = [{ subSlotId: -1, subSlotName: '--Select--' }, ...this.locationSubSlots];
          // Auto-select first real subslot (skip --Select--)
          if (this.locationSubSlots.length > 1) {
            this.selectedSubSlotId = this.locationSubSlots[1].subSlotId;
            this.selectedSubSlotName = this.locationSubSlots[1].subSlotName || '';
            this.onSubSlotSelected();
          }
        } else {
          this.locationGrid = [];
        }
      },
      error: (error) => {
        console.error('Error loading subslots:', error);
        this.showNotification('Error loading subslots', 'error');
      }
    });
  }

  onSubSlotSelected(): void {
    if (!this.selectedSubSlotId || this.selectedSubSlotId === -1) {
      this.locationGrid = [];
      return;
    }
    
    // Update subslot name
    const subSlot = this.locationSubSlots.find((s: any) => s.subSlotId === this.selectedSubSlotId);
    
    if (subSlot) {
      this.selectedSubSlotName = subSlot.subSlotName || '';
      this.locationMinSlot = subSlot.minSlot || 1;
      this.locationMaxSlot = subSlot.maxSlot || 100;
    }
    
    this.apiService.getProbeCardLocationsInfo(this.selectedSubSlotId).subscribe({
      next: (locations: any) => {
        // Normalize field names (handle both camelCase and PascalCase)
        this.locationInfo = (Array.isArray(locations) ? locations : []).map((loc: any) => ({
          location: loc.location !== undefined ? loc.location : loc.Location,
          locationStatusId: loc.locationStatusId !== undefined ? loc.locationStatusId : loc.LocationStatusId || 0,
          iseID: loc.iseID !== undefined ? loc.iseID : (loc.ISEID !== undefined ? loc.ISEID : ''),
          subSlotId: loc.subSlotId !== undefined ? loc.subSlotId : loc.SubSlotId
        }));
        this.buildLocationGrid();
      },
      error: (error) => {
        console.error('Error loading locations info:', error);
        this.showNotification('Error loading locations info', 'error');
      }
    });
  }

  buildLocationGrid(): void {
    this.locationGrid = [];
    for (let i = this.locationMinSlot; i <= this.locationMaxSlot; i++) {
      const locationData = this.locationInfo.find((loc: any) => loc.location === i);
      
      let status = 'free'; // free, booked, blocked, selected
      let iseIds: string[] = [];
      
      if (locationData) {
        const statusId = locationData.locationStatusId || 0;
        // LocationStatus enum: 1=Booked, 2=Blocked, etc.
        if (statusId === 1) status = 'booked';
        else if (statusId === 2) status = 'blocked';
        
        if (locationData.iseID) {
          iseIds.push(locationData.iseID);
        }
      }
      
      // Check if this is the currently selected location
      if (this.selectedLocation === i) {
        status = 'selected';
      }
      
      this.locationGrid.push({
        location: i,
        status: status,
        iseIds: iseIds,
        tooltip: iseIds.length > 0 ? iseIds.join(', ') : ''
      });
    }
  }

  onLocationClick(location: number): void {
    // Only allow selection of free locations
    const gridItem = this.locationGrid.find((item: any) => item.location === location);
    if (gridItem) {
      if (gridItem.status === 'free') {
        // Deselect previous
        const prevItem = this.locationGrid.find((item: any) => item.status === 'selected');
        if (prevItem) {
          prevItem.status = 'free';
        }
        // Select new
        gridItem.status = 'selected';
        this.selectedLocation = location;
      } else if (gridItem.status === 'selected') {
        // Deselect if clicking on already selected
        gridItem.status = 'free';
        this.selectedLocation = null;
      }
      // Don't allow selection of booked or blocked locations
    }
  }

  getLocationStatusClass(status: string): string {
    switch (status) {
      case 'selected': return 'location-selected';
      case 'booked': return 'location-booked';
      case 'blocked': return 'location-blocked';
      default: return 'location-free';
    }
  }

  onLocationSelect(): void {
    if (!this.selectedShelfId || !this.selectedSubSlotId || !this.selectedLocation) {
      this.showNotification('Please select a shelf, subslot, and location', 'warning');
      return;
    }
    
    // Build location text similar to TFS format
    let locationText = '';
    if (this.selectedShelfName === this.selectedSubSlotName) {
      locationText = `${this.selectedShelfName} ${this.selectedLocation}`;
    } else {
      locationText = `${this.selectedShelfName} ${this.selectedSubSlotName} ${this.selectedLocation}`;
    }
    
    this.probeCardData.hardwareLocation = this.selectedLocation;
    this.probeCardData.hardwareLocationText = locationText;
    this.probeCardData.shelfId = this.selectedShelfId;
    this.probeCardData.subSlotId = this.selectedSubSlotId;
    this.probeCardData.shelf = this.selectedShelfName;
    this.probeCardData.subSlot = this.selectedSubSlotName;
    
    this.closeLocationDialog();
  }

  // Pogo Tower Dialog
  onPogoTowerCheckboxChange(checked: boolean): void {
    this.enablePogoTower = checked;
    if (!checked) {
      this.probeCardData.pogoTowerId = null;
      this.probeCardData.pogoTowerISEId = '';
    }
  }

  openPogoTowerDialog(): void {
    if (!this.probeCardData.customerId || this.probeCardData.customerId === -1) {
      this.showNotification('Please select a customer first', 'warning');
      return;
    }
    if (!this.enablePogoTower) {
      this.showNotification('Please enable Pogo Tower checkbox first', 'warning');
      return;
    }
    this.isPogoTowerDialogOpen = true;
  }

  closePogoTowerDialog(): void {
    this.isPogoTowerDialogOpen = false;
  }

  onPogoTowerSelected(pogoTower: any): void {
    if (pogoTower) {
      this.probeCardData.pogoTowerId = pogoTower.masterId || pogoTower.id;
      this.probeCardData.pogoTowerISEId = pogoTower.iseId || pogoTower.ISEId || '';
      this.probeCardData.pogoTowerIsIse = pogoTower.isIse || false;
    }
    this.closePogoTowerDialog();
  }

  // Correlation Dialog
  onCorrelationCheckboxChange(checked: boolean): void {
    this.enableCorrelation = checked;
    if (!checked) {
      this.probeCardData.correlationIds = [];
    }
  }

  openCorrelationDialog(): void {
    if (!this.probeCardData.customerId || this.probeCardData.customerId === -1) {
      this.showNotification('Please select a customer first', 'warning');
      return;
    }
    if (!this.enableCorrelation) {
      this.showNotification('Please enable Correlation checkbox first', 'warning');
      return;
    }
    this.isCorrelationDialogOpen = true;
  }

  closeCorrelationDialog(): void {
    this.isCorrelationDialogOpen = false;
  }

  onCorrelationSelected(correlations: any[]): void {
    if (correlations && correlations.length > 0) {
      this.probeCardData.correlationIds = correlations.map((c: any) => c.masterId || c.id);
      // Update correlation display text
      const correlationText = correlations.map((c: any) => c.iseId || c.ISEId || '').join(', ');
      this.probeCardData.correlationText = correlationText;
    }
    this.closeCorrelationDialog();
  }

  // External Equipment Dialog
  onExternalEquipmentCheckboxChange(checked: boolean): void {
    this.enableExternalEquipment = checked;
    if (!checked) {
      this.probeCardData.externalEquipmentIds = [];
    }
  }

  openExternalEquipmentDialog(): void {
    if (!this.probeCardData.customerId || this.probeCardData.customerId === -1) {
      this.showNotification('Please select a customer first', 'warning');
      return;
    }
    if (!this.enableExternalEquipment) {
      this.showNotification('Please enable External Equipment checkbox first', 'warning');
      return;
    }
    this.isExternalEquipmentDialogOpen = true;
  }

  closeExternalEquipmentDialog(): void {
    this.isExternalEquipmentDialogOpen = false;
  }

  onExternalEquipmentSelected(equipment: any[]): void {
    if (equipment && equipment.length > 0) {
      this.probeCardData.externalEquipmentIds = equipment.map((e: any) => e.masterId || e.id);
      // Update external equipment display text
      const equipmentText = equipment.map((e: any) => e.iseId || e.ISEId || '').join(', ');
      this.probeCardData.externalEquipmentText = equipmentText;
    }
    this.closeExternalEquipmentDialog();
  }

  // Interface Board Dialog
  onInterfaceBoardCheckboxChange(checked: boolean): void {
    this.enableInterfaceBoard = checked;
    if (!checked) {
      this.probeCardData.interfaceBoardId = null;
      this.probeCardData.interfaceBoardISEId = '';
      this.probeCardData.interfaceBoardIsIse = false;
    }
  }

  openInterfaceBoardDialog(): void {
    if (!this.probeCardData.customerId || this.probeCardData.customerId === -1) {
      this.showNotification('Please select a customer first', 'warning');
      return;
    }
    if (!this.enableInterfaceBoard) {
      this.showNotification('Please enable Interface Board checkbox first', 'warning');
      return;
    }
    this.isInterfaceBoardDialogOpen = true;
  }

  closeInterfaceBoardDialog(): void {
    this.isInterfaceBoardDialogOpen = false;
  }

  onInterfaceBoardSelected(interfaceBoard: any): void {
    if (interfaceBoard) {
      this.probeCardData.interfaceBoardId = interfaceBoard.masterId || interfaceBoard.id;
      this.probeCardData.interfaceBoardISEId = interfaceBoard.iseId || interfaceBoard.ISEId || '';
      this.probeCardData.interfaceBoardIsIse = interfaceBoard.isIse || false;
    }
    this.closeInterfaceBoardDialog();
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.notificationService.show({
      content: message,
      hideAfter: 3000,
      position: { horizontal: 'center', vertical: 'top' },
      animation: { type: 'fade', duration: 400 },
      type: { style: type, icon: true }
    });
  }
}

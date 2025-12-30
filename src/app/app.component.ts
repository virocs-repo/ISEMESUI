import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';
import { AppService } from './services/app.service';
import { DrawerItem, DrawerSelectEvent } from '@progress/kendo-angular-layout';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { Address, Category, Coo, DeviceFamily, Hardware, ICON, LotCategory, LotOwners, Others, PackageCategory, PurchaseOrder, Quotes, ReceiptStatus, ServiceCategory, TrayPart, TrayVendor } from './services/app.interface';
import { Subscription } from 'rxjs';

interface DrawerItemExtra extends DrawerItem {
  routerLink?: string;
  items?: Array<DrawerItemExtra>;
  expanded?: boolean;
  id?: number;
  parentId?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ISEMES';

  public expanded = false;
  // Use selectedTabIndex from appService to sync with header
  public get selectedTabIndex(): number {
    return this.appService.selectedTabIndex;
  }
  
  // Expansion state for hierarchical drawer items (using IDs)
  public expandedIndices: number[] = [];
  
  // Cached inventory items that update when submenu state changes
  public inventoryDrawerItems: Array<DrawerItemExtra> = [];

  public ticketingItems: Array<DrawerItemExtra> = [
    { text: 'ICR Dashboard', svgIcon: ICON.windowRestoreIcon, routerLink: '/ticketing/icrdashboard' },
    { text: 'Ticket', svgIcon: ICON.clipboardTextIcon, routerLink: '/ticketing/ticket', selected: true },
  ];
  
  // Cached ticketing items that update when submenu state changes
  public ticketingDrawerItems: Array<DrawerItemExtra> = [];
  
  // Cached device master items
  public deviceMasterDrawerItems: Array<DrawerItemExtra> = [];
  
  // Callback to determine if an item is expanded (for hierarchical drawer)
  public isItemExpanded = (item: DrawerItemExtra): boolean => {
    return item.id !== undefined && this.expandedIndices.indexOf(item.id) >= 0;
  };

  // Current drawer items based on selected tab - with dynamic submenu
  public get currentDrawerItems(): Array<DrawerItemExtra> {
    if (this.appService.selectedTabIndex === 0) {
      return this.inventoryDrawerItems;
    } else if (this.appService.selectedTabIndex === 1) {
      return this.ticketingDrawerItems;
    } else {
      return this.deviceMasterDrawerItems;
    }
  }
  
  // Build inventory drawer items with hierarchical structure using id/parentId
  private buildInventoryDrawerItems(): void {
    const items: Array<DrawerItemExtra> = [];
    
    // Define IDs
    const ID_RECEIVING = 1;
    const ID_RECEIVING_INTERNAL = 11;
    const ID_RECEIVING_CUSTOMER = 12;
    const ID_RECEIVING_MAIL = 13;
    const ID_RECEIVING_SEARCH = 14;
    const ID_RECEIVING_TRANSFER = 15;
    
    const ID_HOLD = 2;
    
    const ID_INVENTORY_MOVE = 3;
    const ID_INVENTORY_MOVE_MAIN = 31;
    const ID_INVENTORY_MOVE_CHECKIN = 32;
    
    const ID_SHIPPING = 4;
    const ID_SHIPPING_MAIN = 41;
    const ID_SHIPPING_OTHER = 42;
    const ID_SHIPPING_COMBINED = 43;
    
    const ID_INVENTORY = 5;
    const ID_CUSTOMER_ORDER = 6;
    const ID_REPORTS = 7;
    const ID_DEVICE_MASTER = 8;
    const ID_DEVICE_MASTER_FAMILY = 81;
    const ID_DEVICE_MASTER_DEVICE = 82;
    
    // Add Receiving (parent)
    items.push({
      id: ID_RECEIVING,
      text: 'Receiving',
      svgIcon: ICON.selectBoxIcon
    });
    
    // Add Receiving sub-items
    items.push({ id: ID_RECEIVING_INTERNAL, parentId: ID_RECEIVING, text: 'Receiver Form(Internal)', svgIcon: ICON.selectBoxIcon, routerLink: '/inventory/receiver-form-internal' });
    items.push({ id: ID_RECEIVING_CUSTOMER, parentId: ID_RECEIVING, text: 'Receiver Form(Customer)', svgIcon: ICON.selectBoxIcon, routerLink: '/inventory/receiver-form-customer' });
    items.push({ id: ID_RECEIVING_MAIL, parentId: ID_RECEIVING, text: 'Mail Room', svgIcon: ICON.selectBoxIcon, routerLink: '/inventory/mail-room' });
    items.push({ id: ID_RECEIVING_SEARCH, parentId: ID_RECEIVING, text: 'Receiving', svgIcon: ICON.selectBoxIcon, routerLink: '/inventory/search-receiving' });
    items.push({ id: ID_RECEIVING_TRANSFER, parentId: ID_RECEIVING, text: 'Internal Transfer Receiving', svgIcon: ICON.selectBoxIcon, routerLink: '/inventory/int-transfer-receiving' });
    
    // Add Hold (no submenu)
    items.push({
      id: ID_HOLD,
      text: 'Hold',
      svgIcon: ICON.pauseIcon,
      routerLink: '/inventory/inventory-hold'
    });
    
    // Add Inventory Move (parent)
    items.push({
      id: ID_INVENTORY_MOVE,
      text: 'Inventory Move',
      svgIcon: ICON.exportIcon
    });
    
    // Add Inventory Move sub-items
    items.push({ id: ID_INVENTORY_MOVE_MAIN, parentId: ID_INVENTORY_MOVE, text: 'Inventory Move', svgIcon: ICON.exportIcon, routerLink: '/inventory/inventory-move' });
    items.push({ id: ID_INVENTORY_MOVE_CHECKIN, parentId: ID_INVENTORY_MOVE, text: 'Checkin/Checkout', svgIcon: ICON.cartIcon, routerLink: '/inventory/inventory-checkinCheckout' });
    
    // Add Shipping (parent)
    items.push({
      id: ID_SHIPPING,
      text: 'Shipping',
      svgIcon: ICON.exportIcon
    });
    
    // Add Shipping sub-items
    items.push({ id: ID_SHIPPING_MAIN, parentId: ID_SHIPPING, text: 'Shipping', svgIcon: ICON.exportIcon, routerLink: '/inventory/shipping' });
    items.push({ id: ID_SHIPPING_OTHER, parentId: ID_SHIPPING, text: 'Other Inventory Shipment', svgIcon: ICON.exportIcon, routerLink: '/inventory/another-shipping' });
    items.push({ id: ID_SHIPPING_COMBINED, parentId: ID_SHIPPING, text: 'Combined Lot Shipment', svgIcon: ICON.exportIcon, routerLink: '/inventory/combined-lot' });
    
    // Add Inventory (no submenu)
    items.push({
      id: ID_INVENTORY,
      text: 'Inventory',
      svgIcon: ICON.windowRestoreIcon,
      routerLink: '/inventory/inventory'
    });
    
    // Add Customer Order/Request (no submenu)
    items.push({
      id: ID_CUSTOMER_ORDER,
      text: 'Customer Order/Request',
      svgIcon: ICON.jsIcon,
      routerLink: '/inventory/customer-order'
    });
    
    // Add Reports (no submenu)
    items.push({
      id: ID_REPORTS,
      text: 'Reports',
      svgIcon: ICON.clipboardTextIcon,
      routerLink: '/inventory/reports'
    });
    
    // Update the array reference to trigger change detection
    this.inventoryDrawerItems = [...items];
  }
  
  // Build ticketing drawer items with hierarchical structure using id/parentId
  private buildTicketingDrawerItems(): void {
    const items: Array<DrawerItemExtra> = [];
    
    // Define IDs
    const ID_ICR_DASHBOARD = 100;
    const ID_TRAVELLER = 101;
    const ID_TRAVELLER_SPLIT_MERGE = 1011;
    const ID_TICKET = 102;
    
    // Add ICR Dashboard
    items.push({
      id: ID_ICR_DASHBOARD,
      text: 'ICR Dashboard',
      svgIcon: ICON.windowRestoreIcon,
      routerLink: '/ticketing/icrdashboard'
    });
    
    // Add Traveller (parent) - no routerLink so it can expand
    items.push({
      id: ID_TRAVELLER,
      text: 'Traveller',
      svgIcon: ICON.selectBoxIcon
    });
    
    // Add Traveller sub-items
    const ID_TRAVELLER_CHECKIN_CHECKOUT = 1010;
    items.push({
      id: ID_TRAVELLER_CHECKIN_CHECKOUT,
      parentId: ID_TRAVELLER,
      text: 'Check-In/Check-Out',
      svgIcon: ICON.cartIcon,
      routerLink: '/ticketing/traveller'
    });
    items.push({
      id: ID_TRAVELLER_SPLIT_MERGE,
      parentId: ID_TRAVELLER,
      text: 'Split & Merge Request',
      svgIcon: ICON.selectBoxIcon,
      routerLink: '/ticketing/searchsplitmerge'
    });
    
    // Add Ticket
    items.push({
      id: ID_TICKET,
      text: 'Ticket',
      svgIcon: ICON.clipboardTextIcon,
      routerLink: '/ticketing/ticket'
    });
    
    // Update the array reference to trigger change detection
    this.ticketingDrawerItems = [...items];
  }
  
  // Build device master drawer items
  private buildDeviceMasterDrawerItems(): void {
    const items: Array<DrawerItemExtra> = [];
    
    // Add Device Family (default/selected)
    items.push({
      id: 1,
      text: 'Device Family',
      svgIcon: ICON.gearIcon,
      routerLink: '/devicemaster/device-family',
      selected: true
    });
    
    // Add Device
    items.push({
      id: 2,
      text: 'Device',
      svgIcon: ICON.gearIcon,
      routerLink: '/devicemaster/device'
    });
    
    // Update the array reference to trigger change detection
    this.deviceMasterDrawerItems = [...items];
  }
  
  readonly subscription = new Subscription()

  constructor(public authService: AuthService, public appService: AppService, private router: Router, private apiService: ApiService, private cdr: ChangeDetectorRef, private titleService: Title) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public toggleDrawer(): void {
    this.expanded = !this.expanded;
  }

  onSelect(ev: DrawerSelectEvent): void {
    // Immediately set drawer to stay open
    this.appService.isDrawerExpanded = true;
    
    const item = ev.item as DrawerItemExtra;
    
    // If item has no routerLink and has children (parent item), toggle expansion
    if (item.id !== undefined && !item.routerLink) {
      // Check if it's a parent item (has children by checking if any items have this as parentId)
      const currentItems = this.appService.selectedTabIndex === 0 ? this.inventoryDrawerItems : 
                          this.appService.selectedTabIndex === 1 ? this.ticketingDrawerItems : 
                          this.deviceMasterDrawerItems;
      const hasChildren = currentItems.some(i => (i as DrawerItemExtra).parentId === item.id);
      
      if (hasChildren) {
        // Toggle expansion
        const index = this.expandedIndices.indexOf(item.id);
        if (index >= 0) {
          this.expandedIndices = this.expandedIndices.filter(id => id !== item.id);
        } else {
          this.expandedIndices.push(item.id);
        }
        this.cdr.detectChanges();
        return; // Don't navigate for parent items (except special case above)
      }
    }
    
    // If clicking on a child item, ensure parent is expanded
    if (item.parentId !== undefined) {
      if (this.expandedIndices.indexOf(item.parentId) < 0) {
        this.expandedIndices.push(item.parentId);
        this.cdr.detectChanges();
      }
    }
    
    if (ev.item.routerLink) {
      // Update selection state
      const resetSelection = (items: Array<DrawerItemExtra>) => {
        items.forEach(item => {
          item.selected = false;
        });
      };
      
      // Find and select the clicked item (works with hierarchical structure)
      const findAndSelect = (items: Array<DrawerItemExtra>, routerLink: string): boolean => {
        for (const item of items) {
          if (item.routerLink === routerLink) {
            item.selected = true;
            return true;
          }
        }
        return false;
      };
      
      if (this.appService.selectedTabIndex === 0) {
        // Reset all inventory drawer items first
        resetSelection(this.inventoryDrawerItems);
        // Then select the clicked item
        findAndSelect(this.inventoryDrawerItems, ev.item.routerLink);
      } else if (this.appService.selectedTabIndex === 1) {
        // Reset all ticketing drawer items first
        resetSelection(this.ticketingDrawerItems);
        // Then select the clicked item
        findAndSelect(this.ticketingDrawerItems, ev.item.routerLink);
      } else if (this.appService.selectedTabIndex === 2) {
        // Reset all device master drawer items first
        resetSelection(this.deviceMasterDrawerItems);
        // Then select the clicked item
        findAndSelect(this.deviceMasterDrawerItems, ev.item.routerLink);
      }
      
      // Navigate
      this.router.navigate([ev.item.routerLink]);
    }
    
    // Force drawer to stay open multiple times to override any default behavior
    this.appService.isDrawerExpanded = true;
    setTimeout(() => {
      this.appService.isDrawerExpanded = true;
    }, 0);
    setTimeout(() => {
      this.appService.isDrawerExpanded = true;
    }, 100);
    setTimeout(() => {
      this.appService.isDrawerExpanded = true;
    }, 300);
    
    console.log(ev.item.text + ' selected');
  }

  // Tab selection is now handled in header component
  // This method can be removed or kept for backward compatibility

  private updateDrawerSelection(): void {
    // Reset all items selection
    const resetAll = (items: Array<DrawerItemExtra>) => {
      items.forEach(item => {
        item.selected = false;
      });
    };
    
    resetAll(this.inventoryDrawerItems);
    resetAll(this.ticketingDrawerItems);
    
    // Set first item as selected for current tab
    if (this.appService.selectedTabIndex === 0 && this.inventoryDrawerItems.length > 0) {
      // Find first item with routerLink (Receiver Form Internal)
      const firstItem = this.inventoryDrawerItems.find(item => item.routerLink === '/inventory/receiver-form-internal');
      if (firstItem) {
        firstItem.selected = true;
      }
    } else if (this.appService.selectedTabIndex === 1) {
      // For ticketing, find and select "Ticket" item (default) in the drawer items
      const ticketItem = this.ticketingDrawerItems.find(item => item.routerLink === '/ticketing/ticket');
      if (ticketItem) {
        ticketItem.selected = true;
      }
    }
  }
  
  private updatePageTitle(): void {
    if (this.appService.selectedTabIndex === 1) {
      // Ticketing System selected
      this.titleService.setTitle('ISEMES Ticketing');
    } else if (this.appService.selectedTabIndex === 2) {
      // Device Master selected
      this.titleService.setTitle('ISEMES Device Master');
    } else {
      // Inventory selected
      this.titleService.setTitle('ISEMES Inventory');
    }
  }

  ngOnInit(): void {
    // Ensure drawer is expanded by default
    this.appService.isDrawerExpanded = true;
    
    // Check current route to set correct tab
    const currentPath = this.router.url;
    if (currentPath.startsWith('/ticketing')) {
      this.appService.selectedTabIndex = 1;
      // Build ticketing drawer items on initialization if on ticketing tab
      this.buildTicketingDrawerItems();
      this.updatePageTitle(); // Update title for ticketing
    } else if (currentPath.startsWith('/devicemaster')) {
      this.appService.selectedTabIndex = 2;
      // Build device master drawer items on initialization if on device master tab
      this.buildDeviceMasterDrawerItems();
      this.updatePageTitle(); // Update title for device master
    } else {
      this.appService.selectedTabIndex = 0;
      // Build inventory drawer items on initialization if on inventory tab
      this.buildInventoryDrawerItems();
      this.updatePageTitle(); // Update title for inventory
    }
    
    // Force change detection after building items
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
    
    // Update drawer selection based on initial tab
    this.updateDrawerSelection();
    
    // Subscribe to route changes to update tab index
    this.subscription.add(
      this.router.events.subscribe(() => {
        const path = this.router.url;
        const previousTabIndex = this.appService.selectedTabIndex;
        if (path.startsWith('/ticketing')) {
          this.appService.selectedTabIndex = 1;
        } else if (path.startsWith('/devicemaster')) {
          this.appService.selectedTabIndex = 2;
        } else if (path.startsWith('/inventory') || path === '/' || path === '') {
          this.appService.selectedTabIndex = 0;
        }
        // Update drawer selection if tab changed
        if (previousTabIndex !== this.appService.selectedTabIndex) {
          if (this.appService.selectedTabIndex === 1) {
            this.buildTicketingDrawerItems(); // Rebuild when switching to ticketing
          } else if (this.appService.selectedTabIndex === 2) {
            this.buildDeviceMasterDrawerItems(); // Rebuild when switching to device master
          } else {
            this.buildInventoryDrawerItems(); // Rebuild when switching to inventory
          }
          this.updateDrawerSelection();
          this.updatePageTitle(); // Update title when tab changes
        }
      })
    );
    
    this.initMasterData();
    this.getAllEntityData();
    this.getAddresses();
    this.fetchHardwareTypes();
    this.getReceiverStatus();
    this.getServiceCategory();
    this.getCoo();
    this.getLotOwners();
    this.getTrayVendor();
    this.getTrayPart();
    this.getPackageCategoryList();
    this.getOthersList();
    this.getPackageCategoryHardwareList();
    this.getQuotes();
    this.getLotCategory();
    this.getReceivingTypes();
    this.getTravellerlist();

    this.subscription.add(this.appService.eventEmitter.subscribe((e) => {
      console.log(e);

      switch (e.action) {
        case 'refreshVendors':
          if (this.appService.refreshVendors) {
            this.appService.refreshVendors = false;
            this.getAllEntityData();
          }
          break;
        default:
          break;
      }
    }))
  }
  private initMasterData() {
    this.apiService.getMasterData().subscribe({
      next: (v: any) => {
        const masterData = v.root[0];
        if (masterData) {
          delete masterData.customer;
        }
        this.appService.masterData = Object.assign(this.appService.masterData, masterData);
        this.appService.eventEmitter.emit({ action: 'updates', data: { m: 'masterData' } })
      },
      error: (v) => {
        console.error(v)
      }
    })
  }
  private getAllEntityData() {
    this.getEntity('Customer');
    this.getEntity('Vendor');
    this.getEntity('Employee');
  }
  private getEntity(entityType: 'Customer' | 'Vendor' | 'Employee') {
    // if (this.appService.masterData.entityMap[entityType].length > 0) {
    //   return;
    // }
    this.apiService.getEntitiesName(entityType).subscribe({
      next: (value: any) => {
        this.appService.masterData.entityMap[entityType] = value;
      },
      error(err) { }
    })
  }
  private getAddresses() {
    this.apiService.getAddresses().subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.addresses = value.map((a: Address) => {
            let props = [a.address1, a.address2, a.city, a.state, a.country]
            props = props.filter(a => a)
            a.fullAddress = props.join(', ')
            return a;
          })
        }
      }
    });
  }

  private getReceiverStatus() {
    this.apiService.ReceiverStatus().subscribe({
      next: (value: any) => {
        this.appService.masterData.receiptStatus = value;
      }
    })
  }
        
  private getServiceCategory() {
    this.apiService.ServiceCategory("GoodsType").subscribe({
      next: (value: any) => {
        this.appService.masterData.serviceCategory = value;
      }
    })
  }

  private getLotOwners() {
    this.apiService.LotOwners().subscribe({
      next: (value: any) => {
        this.appService.masterData.lotOwners = value;
      }
    })
   }

  private getTravellerlist() {
    this.apiService.getTravellerStatuses().subscribe({
      next: (value: any) => {
        this.appService.masterData.Travellerlist = value;
      }
    })
  }

  private getCoo() {
    this.apiService.ServiceCategory("CountryOfOrigin").subscribe({
      next: (value: any) => {
        this.appService.masterData.coo = value;
      }
    })
  }

  private getTrayVendor() {
    this.apiService.TrayVendor(775).subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.trayVendor = value.map((a: TrayVendor) => {
            let props = [a.trayVendorId, a.vendorName]
            props = props.filter(a => a)
            return a;
          })
        }
          this.appService.masterData.trayVendor = value;
      },
      error: (err: any) => {
        console.error('Error loading tray vendors:', err);
        console.error('Error details:', err.error, err.status, err.message);
        // Set empty array on error to prevent UI issues
        this.appService.masterData.trayVendor = [];
      }
    })
  }
  private getTrayPart() {
    this.apiService.TrayPart(775,2).subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.trayPart = value.map((a: TrayPart) => {
            let props = [a.trayPartId, a.trayNumber]
            props = props.filter(a => a)
            return a;
          })
        }
      },
      error: (err: any) => {
        console.error('Error loading tray parts:', err);
        this.appService.masterData.trayPart = [];
      }
    })
  }

  private fetchHardwareTypes() {
    // getHardwareTypes
    this.apiService.getHardwareTypes().subscribe({
      next: (hardwareTypes: any) => {
        this.appService.hardwareTypes = hardwareTypes;
      }
    })
  }
  private getPackageCategoryList() {
    this.apiService.getPackageCategoryList("PackageCategory").subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.PackageCategory = value.map((a: PackageCategory) => {
            let props = [a.id, a.categoryName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }
  private getPackageCategoryHardwareList() {
    this.apiService.getPackageCategoryList("Hardware").subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.hardware = value.map((a: Hardware) => {
            let props = [a.Id, a.CategoryName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }
  private getQuotes() {
    this.apiService.Quotes(775).subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.Quotes = value.map((a: Quotes) => {
            let props = [a.quoteId, a.quote]
            props = props.filter(a => a)
            return a;
          })
        }
      },
      error: (err: any) => {
        console.error('Error loading quotes:', err);
        this.appService.masterData.Quotes = [];
      }
    });
  }
  private getOthersList() {
    this.apiService.getPackageCategoryList("Others").subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.Others = value.map((a:Others) => {
            let props = [a.id, a.categoryName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }
  
  private getLotCategory() {
    this.apiService.getServiceCaetgory().subscribe({
      next: (value: any) => {
        if (value) {
          this.appService.masterData.Category = value.map((a:Category) => {
            let props = [a.serviceCategoryId, a.serviceCategoryName]
            props = props.filter(a => a)
            return a;
          })
        }
      }
    });
  }
  private getReceivingTypes() {
    this.apiService.ServiceCategory("ReceivingTypes").subscribe({
      next: (value: any) => {
        this.appService.masterData.receivingTypes = value;
      }
    })
  }
  
}

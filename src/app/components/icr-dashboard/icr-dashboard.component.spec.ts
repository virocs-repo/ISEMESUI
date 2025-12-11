import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcrDashboardComponent } from './icr-dashboard.component';

describe('IcrDashboardComponent', () => {
  let component: IcrDashboardComponent;
  let fixture: ComponentFixture<IcrDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IcrDashboardComponent]
    });
    fixture = TestBed.createComponent(IcrDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

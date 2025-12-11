import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSplitComponent } from './add-split.component';

describe('AddSplitComponent', () => {
  let component: AddSplitComponent;
  let fixture: ComponentFixture<AddSplitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSplitComponent]
    });
    fixture = TestBed.createComponent(AddSplitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

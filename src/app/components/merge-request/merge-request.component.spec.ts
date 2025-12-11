import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeRequestComponent } from './merge-request.component';

describe('MergeRequestComponent', () => {
  let component: MergeRequestComponent;
  let fixture: ComponentFixture<MergeRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MergeRequestComponent]
    });
    fixture = TestBed.createComponent(MergeRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

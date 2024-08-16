import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnConfirmComponent } from './on-confirm.component';

describe('OnConfirmComponent', () => {
  let component: OnConfirmComponent;
  let fixture: ComponentFixture<OnConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OnConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

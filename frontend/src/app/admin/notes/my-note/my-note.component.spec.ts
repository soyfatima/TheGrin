import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyNoteComponent } from './my-note.component';

describe('MyNoteComponent', () => {
  let component: MyNoteComponent;
  let fixture: ComponentFixture<MyNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyNoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

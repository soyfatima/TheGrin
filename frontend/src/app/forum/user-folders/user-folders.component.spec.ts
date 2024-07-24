import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFoldersComponent } from './user-folders.component';

describe('UserFoldersComponent', () => {
  let component: UserFoldersComponent;
  let fixture: ComponentFixture<UserFoldersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserFoldersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

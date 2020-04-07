import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeChoiceComponent } from './tree-choice.component';

describe('TreeChoiceComponent', () => {
  let component: TreeChoiceComponent;
  let fixture: ComponentFixture<TreeChoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeChoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

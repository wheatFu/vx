import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotEffectComponent } from './not-effect.component';

describe('NotEffectComponent', () => {
  let component: NotEffectComponent;
  let fixture: ComponentFixture<NotEffectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotEffectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotEffectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

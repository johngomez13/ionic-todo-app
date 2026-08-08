import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import TasksPage from './tasks.page';

describe('TasksPage (zoneless)', () => {
  let fixture: ComponentFixture<TasksPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksPage);
    await fixture.whenStable();
  });

  it('should create without zone.js', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render Ionic custom elements', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('ion-header')).not.toBeNull();
    expect(host.querySelector('ion-content')).not.toBeNull();
    expect(host.querySelector('ion-title')?.textContent).toContain('Tareas');
  });
});

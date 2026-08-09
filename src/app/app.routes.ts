import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@ui/todo/view/todo-tabs.page'),
    children: [
      {
        path: 'tasks',
        loadComponent: () => import('@ui/todo/tasks/view/tasks.page'),
      },
      {
        path: 'categories',
        loadComponent: () => import('@ui/todo/categories/view/categories.page'),
      },
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
    ],
  },
];

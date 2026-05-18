import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'pilot',
        loadComponent: () => import('../tab1/tab1.page').then((m) => m.Tab1Page)
      },
      {
        path: 'umpires',
        loadComponent: () => import('../tab2/tab2.page').then((m) => m.Tab2Page)
      },
      {
        path: 'stats',
        loadComponent: () => import('../tab3/tab3.page').then((m) => m.Tab3Page)
      },
      {
        path: '',
        redirectTo: '/tabs/pilot',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/pilot',
    pathMatch: 'full'
  }
];

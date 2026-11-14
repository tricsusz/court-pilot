import {
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { environment } from './environments/environment';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideAppInitializer(async () => {
      if (
        !environment.production &&
        new URLSearchParams(window.location.search).get('demo') === '1'
      ) {
        const { seedDemoData } = await import('./app/services/demo-data');
        await seedDemoData();
      }
    }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules))
  ]
}).catch((error: unknown) =>
  console.error('Application bootstrap failed:', error)
);

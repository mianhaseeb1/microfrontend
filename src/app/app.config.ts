import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { metaReducers, reducers } from './store/reducers';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { ChatEffects } from './store/effects/chat.effects';
import { AuthEffects } from './store/effects/auth.effects';
import { PageEffects } from './store/effects/pages.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    provideStore(reducers, { metaReducers }),
    provideEffects([ChatEffects, AuthEffects, PageEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
      connectInZone: true,
    }),
  ],
};

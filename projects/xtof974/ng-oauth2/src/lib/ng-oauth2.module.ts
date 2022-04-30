import { ModuleWithProviders, NgModule } from '@angular/core';
import { Config } from './models/auth.model';
import { RedirectComponent } from './pages/redirect/redirect.component';
import {
  AuthService,
  NgOauth2Service,
  ResourcesService,
  StorageService,
} from './services';
import { AuthUtilService } from './services/auth.util.service';

@NgModule({
  declarations: [RedirectComponent],
  imports: [],
  exports: [RedirectComponent],
  providers: [
    AuthService,
    AuthUtilService,
    ResourcesService,
    StorageService,
    NgOauth2Service,
  ],
})
export class NgOauth2Module {
  public static forRoot(
    environment: Config
  ): ModuleWithProviders<NgOauth2Module> {
    return {
      ngModule: NgOauth2Module,
      providers: [
        {
          provide: 'config',
          useValue: environment,
        },
      ],
    };
  }
}

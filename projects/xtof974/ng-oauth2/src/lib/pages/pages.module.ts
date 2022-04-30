import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Config } from '../models/auth.model';
import { AuthService } from '../services';
import { RedirectComponent } from './redirect/redirect.component';

@NgModule({
  declarations: [RedirectComponent],
  imports: [CommonModule],
  exports: [RedirectComponent],
  providers: [AuthService],
})
export class PagesModule {
  public static forRoot(environment: Config): ModuleWithProviders<PagesModule> {
    return {
      ngModule: PagesModule,
      providers: [
        {
          provide: 'config',
          useValue: environment,
        },
      ],
    };
  }
}

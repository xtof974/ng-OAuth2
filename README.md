## Installing

Run the following commands :

```sh
npm i @xtof974/ng-oauth2
```

## How to Use It ?

### Importing the NgModule

```TypeScript
import { APP_INITIALIZER } from  '@angular/core';
import {AuthInterceptor,
	AuthService,
	FlowType,
	NgOauth2Module,
	NgOauth2Service,
	RedirectComponent,
} from  '@xtof974/ng-oauth2';
// etc.

@NgModule({
  imports: [
    // etc.
    NgOauth2Module.forRoot({
		flowType:  'IMPLICIT_GRANT', //IMPLICIT_GRANT, PKCE
		rsURL:  environment.rsURL, //e.g. Resource Server URL
		asURL:  environment.asURL, //e.g. Authorization Server URL
		clientID:  environment.clientID,
		redirectInfos:  {
			redirectURI: environment.redirectURI,
			home:  '/home', //where to go after redirect
		},
		extras: {
			saveNavigation:  false, //available only if No refresh Token
			delayBeforeRefreshToken: 5 //number in seconds > 0
		},
		scopes: {			//optionnal
			scopes: ['READ', 'WRITE'], //list of scopes
		}
}),
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    // etc.
  ],
  providers: [
	NgOauth2Service,
	{
	   provide:  APP_INITIALIZER,
	   useFactory:  initOauth2Service,
	   deps: [NgOauth2Service],
	   multi:  true,
	},
	{
	   provide:  HTTP_INTERCEPTORS,
       useClass:  AuthInterceptor,
	   multi:  true,
	},
	// etc. others interceptors
  ]
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
export  function  initOauth2Service(config: NgOauth2Service) {
	return (): Promise<any> => {
	return  config.init();
	};
}
```

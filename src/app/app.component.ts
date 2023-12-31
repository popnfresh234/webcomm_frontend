import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth/auth.service';
import { LocalStorageService } from './services/local_storage/local-storage.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { catchError, Observable, of } from 'rxjs';
import { ErrorResponse } from './models/responses/error-response';
import { WebauthService } from './services/webauth/webauth.service';
import { Router } from '@angular/router';

declare function preformatMakeCredReq(responseBody: any): any;
declare function publicKeyCredentialToJSON(credential: any): any;

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
  ],
})
export class AppComponent {
  authService = inject(AuthService);
  webAuthService = inject(WebauthService);
  localStorageService = inject(LocalStorageService);
  router = inject(Router);
  title = 'frontend';
  account = '';
  isOpen = false;

  constructor() {
    try {
      if (this.localStorageService.getData('token')) {
        this.account = this.authService.getAccountFromToken(
          this.localStorageService.getData('token')
        );
      }
    } catch (error) {
      this.localStorageService.clearData();
      this.router.navigateByUrl('/login');
    }
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.isOpen) {
          this.isOpen = !this.isOpen;
        }
      }
    });

    //Listen for clicks outside the nav drawer
  }

  handleNavDrawer() {
    this.isOpen = !this.isOpen;
    console.log(this.isOpen);
  }

  submitLogout() {
    this.authService.submitLogout();
  }

  useQuickLogin() {
    this.webAuthService
      .requestReg()
      .pipe(
        catchError((errorResponse: ErrorResponse): Observable<any> => {
          console.log(errorResponse);
          // this.error = errorResponse.error.message;
          return of();
        })
      )
      .subscribe((requestRegResp) => {
        if (requestRegResp.header.code == 1200) {
          this.doReg(requestRegResp);
        }
      });
  }

  doReg(requestRegResp: any) {
    console.log('=== Start do register ===');

    var publicKeyCredentialCreationOptions = preformatMakeCredReq(
      requestRegResp.body
    );

    console.log('publicKeyCredentialCreationOptions:');
    console.log(JSON.stringify(publicKeyCredentialCreationOptions));

    navigator.credentials
      .create({
        publicKey: publicKeyCredentialCreationOptions,
      })
      .then((credential) => {
        console.log('credential:');
        console.log(credential);

        var newCredentialInfo = publicKeyCredentialToJSON(credential);

        console.log('newCredentialInfo:');
        console.log(JSON.stringify(newCredentialInfo));

        var fido2DoRegReq = {
          header: {
            appVersion: 'v8',
            channelCode: 'channel-webcomm',
            deviceBrand: 'google',
            deviceType: 'chrome',
            deviceUuid: '550e8400-e29b-41d4-a716-446655440000',
            deviceVersion: '92.0.4515.107',
            userIp: '127.0.0.1',
          },
          body: {
            regPublicKeyCredential: newCredentialInfo,
          },
        };
        console.log('fido2DoRegReq:');
        console.log(JSON.stringify(fido2DoRegReq));
        this.webAuthService
          .doReg(fido2DoRegReq)
          .pipe(
            catchError((errorResponse: ErrorResponse): Observable<any> => {
              console.log(errorResponse);
              // this.error = errorResponse.error.message;
              return of();
            })
          )
          .subscribe((doRegResp) => {
            console.log('fido2DoRegResp');
            console.log(JSON.stringify(doRegResp));
            if (doRegResp.header.code == 1200) {
              alert('Webauthn 啟用成功');
            } else {
              alert('Webauthn 啟用失敗');
            }
          });
      })
      .catch(function (error) {
        if (!error.exists) {
          console.error(error);
          alert('Webauthn 啟用失敗');
        }
        return;
      });
  }

  listenForClose() {
    if (this.isOpen) {
      this.isOpen = !this.isOpen;
    }
  }
}

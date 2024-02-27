import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LocalStorageModule } from 'angular-2-local-storage';
import { TimepickerModule } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';
import { MaterialModule } from './modules/material/material.module';
import { SharedModule } from './shared/shared.module';
import { DataService } from './core/services/data.service';
import { NavigationService } from './shared/components/navigation/navigation.service';
import { ExcelService } from './core/services/excel.service';
import { CommunicationService } from './core/services/app.communication.service';
import { UtilService } from './core/services/util.service';
import { PipesModule } from './pipes/pipes.module';
import { TextMaskModule } from 'angular2-text-mask';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { DynamicComponentModalComponent } from './dynamic-component-modal/dynamic-component-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfirmModalComponent,
    UserProfileComponent,
    DynamicComponentModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    AppRoutes,
    CoreModule.forRoot(),
    MaterialModule,
    SharedModule,
    TextMaskModule,
    ModalModule.forRoot(),
    TimepickerModule.forRoot(),
    FormsModule, ReactiveFormsModule,
    MatSlideToggleModule,
    LocalStorageModule.withConfig({
      prefix: 'my-app',
      storageType: 'localStorage'
    }),
    NgxSpinnerModule,
    PipesModule
  ],
  entryComponents:[ConfirmModalComponent,DynamicComponentModalComponent],
  providers: [DataService, NavigationService, ExcelService, CommunicationService, UtilService],
  bootstrap: [AppComponent]
})
export class AppModule { }

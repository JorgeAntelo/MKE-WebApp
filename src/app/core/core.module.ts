import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
//import { AuthenticationService } from './services/authentication.service';
import { DataService } from './services/data.service';
import { VersionCheckService } from './services/version-check.service';



@NgModule({
    imports: [
        CommonModule
    ]
})

export class CoreModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule, 
            providers: [               
                DataService,
                VersionCheckService
                //AuthenticationService                
            ]
        };
    }
}

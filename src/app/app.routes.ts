import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { UserProfileComponent } from '../app/user-profile/user-profile.component';
export const routes: Routes = [
    {
        path: 'tows',
        loadChildren: './tow/tow.module#TowModule'
    },
    {
        path: 'vehicle-info',
        loadChildren: './vehicle-info/vehicle-info.module#VehicleInfoModule'
    },
    {
        path: 'mpd',
        loadChildren: './mpdtransfers/mpdtransfers.module#MpdtransfersModule'
    },
    {
        path: 'aban',
        loadChildren: './aban/aban.module#AbanModule'
    },
    {
        path: 'release',
        loadChildren: './release/release.module#ReleaseModule'
    },
    {
        path: 'scrap',
        loadChildren: './scrap/scrap.module#ScrapModule'
    },
    {
        path: 'terminal',
        loadChildren: './terminal/terminal.module#TerminalModule'
    },
    {
        path: 'deviceprompt',
        loadChildren: './device-prompt/device-prompt.module#DevicePromptModule'
    },
    {
        path:'home',component:AppComponent
    },
    {
        path:'notificationsetting',component:UserProfileComponent
    },
    {
        path: 'payment-gateway',
        loadChildren: './payment-gateway/payment-gateway.module#PaymentGatewayModule'
    },
    {
        path: 'map',
        loadChildren: './maps/maps.module#MapsModule'
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];

export const AppRoutes = RouterModule.forRoot(routes, { useHash: false });

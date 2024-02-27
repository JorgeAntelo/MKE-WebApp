import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicePromptComponent } from './device-prompt/device-prompt.component';
import { DevicePromptRoutes } from './device-prompt.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    DevicePromptRoutes
  ],
  declarations: [DevicePromptComponent]
})
export class DevicePromptModule { }

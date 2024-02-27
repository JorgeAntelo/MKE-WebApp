import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalManageComponent } from './terminal-manage/terminal-manage.component';
import { TerminalRoutes } from './terminal.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TerminalListComponent } from './terminal-list/terminal-list.component';
import { MaterialModule } from '../modules/material/material.module';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [TerminalManageComponent, TerminalListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TerminalRoutes,
    MaterialModule,
    PipesModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents:[TerminalManageComponent]
})
export class TerminalModule { }

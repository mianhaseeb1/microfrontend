import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
@NgModule({
  declarations: [ClickOutsideDirective],
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  exports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ClickOutsideDirective,
  ],
})
export class SharedModule {}

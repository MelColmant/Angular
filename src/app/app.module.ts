import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LogInComponent } from './log-in/log-in.component';
import { TreeChoiceComponent } from './tree-choice/tree-choice.component';
import { TreeComponent } from './tree/tree.component';
import { CanvasComponent } from './canvas/canvas.component';
import { UpdateComponent } from './update/update.component';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    LogInComponent,
    TreeChoiceComponent,
    TreeComponent,
    CanvasComponent,
    UpdateComponent,
    ConfirmationDialogComponent,
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],

  entryComponents: [
    ConfirmationDialogComponent
  ],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WhiteboardComponent } from './whiteboard/whiteboard.component';

@NgModule({
  declarations: [
    AppComponent,
    WhiteboardComponent  // Declarado aquí
  ],
  imports: [
    BrowserModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

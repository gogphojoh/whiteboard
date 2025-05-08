// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WhiteboardComponent } from './whiteboard/whiteboard.component';

const routes: Routes = [
  { path: '', component: WhiteboardComponent }, // Ruta por defecto
  // otras rutas...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

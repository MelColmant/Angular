import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component'
import { LogInComponent } from './log-in/log-in.component'
import { TreeChoiceComponent } from './tree-choice/tree-choice.component';
import { TreeComponent } from './tree/tree.component';
import { CanvasComponent } from './canvas/canvas.component';
import { UpdateComponent } from './update/update.component';

const routes: Routes = [
  { path: '', component: SignInComponent, pathMatch: 'full' },
  { path: 'login', component: LogInComponent },
  { path: 'tree', component: TreeChoiceComponent },
  { path: 'tree/:treeId', component: TreeComponent },
  { path: 'canvas', component: CanvasComponent },
  { path: 'tree/:treeId/person/:personId', component: UpdateComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

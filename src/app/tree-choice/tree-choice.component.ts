import { Component, OnInit } from '@angular/core';
import { Tree } from '../tree';
import { TreeService } from '../tree.service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-tree-choice',
  templateUrl: './tree-choice.component.html',
  styleUrls: ['./tree-choice.component.css']
})
export class TreeChoiceComponent implements OnInit {

  isAdmin : boolean;
  openCreate : boolean;
  trees : Tree [];

  constructor(
    private treeService: TreeService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getAllTrees();
  }

  start(comp: string){
    if (comp === 'true')
    {
      this.isAdmin=true;
    }
    else this.isAdmin=false;
  }

  createTree(TreeName : string, Description: string){
    let UserId = +localStorage.getItem("UserId") 
    //the + allows to cast localStorage string into number
    this.treeService.addTree({ TreeName, Description, UserId } as Tree)
      .subscribe(treeId => {
        localStorage.setItem('TreeId', treeId.toString());
        this.router.navigate(['/tree/'+ treeId]);
      });
  }

  getAllTrees() {
    this.treeService.getTrees()
      .subscribe(trees => {
        this.trees = trees;
        this.start(localStorage.getItem("IsAdmin"));
        this.openCreate = false;
      });
  }

  onSelect(tree : Tree){
    this.router.navigate(['/tree/'+ tree.TreeId]);
    localStorage.setItem('TreeId', tree.TreeId.toString());
  }
}

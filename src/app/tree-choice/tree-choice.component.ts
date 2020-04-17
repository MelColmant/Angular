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
  trees : Tree [];
  tree : Tree;
  isLoaded: boolean;

  constructor(
    private treeService: TreeService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.isLoaded = false;
    this.isAdmin = false;
    this.getAllTrees();
  }

  getAllTrees() {
    this.treeService.getTrees()
      .subscribe(trees => {
        this.trees = trees;
        this.start(localStorage.getItem("IsAdmin"));
        this.isLoaded = true;
      });
  }

  start(comp: string){
    if (comp === 'true')
    {
      this.isAdmin=true;
    };
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

  onSelect(){
    this.router.navigate(['/tree/'+ this.tree.TreeId]);
    localStorage.setItem('TreeId', this.tree.TreeId.toString());
  }

}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Tree } from '../tree';
import { TreeService } from '../tree.service';

import { Person } from '../person';
import { PersonService } from '../person.service';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {

  treeId : number;
  tree : Tree;
  // need to wait for the tree object to be filled before
  // passing it through the canvas element in the html
  isLoaded: boolean;
  // for the forms
  radioData: string;

  constructor(
    private route: ActivatedRoute,
    private treeService: TreeService,
    private personService: PersonService,
  ) { }

  ngOnInit(): void {
    this.isLoaded = false;
    this.route.paramMap.subscribe(params => {
    this.treeId = +params.get('treeId');
    this.getTreeFromId(this.treeId);
    });
  }

  getTreeFromId(treeId: number){
    this.treeService.getTree(treeId)
      .subscribe(tree => {
        this.tree = tree;
        this.isLoaded = true;
      });
  }

  addPerson(FirstName : string, LastName: string, Gender: string,
            BirthDate: Date, DeathDate?: Date){
    let TreeId = this.treeId;
    let Generation = 0;
    this.personService.addPerson({ FirstName, LastName, Gender,
                                  BirthDate, DeathDate, TreeId, Generation } as Person)
      .subscribe();
  }



}

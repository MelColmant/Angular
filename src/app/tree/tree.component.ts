import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Tree } from '../tree';
import { TreeService } from '../tree.service';

import { Person } from '../person';
import { PersonService } from '../person.service';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {

  treeId : number;
  tree : Tree;
  people: Person [];
  // need to wait for the tree object to be filled before
  // passing it through the canvas element in the html
  isLoaded: boolean;
  // for the forms
  radioData: string;
  // to reload the child component (canvas) on new input
  eventsSubject: Subject<void> = new Subject<void>();
  // items needed when adding a person
  selectedPerson: Person;
  listRel: Array<object>;
  selectedRel: any;
  firstname: string;
  lastname: string;

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
        this.getAllFromTree();
      });
  }

  addPerson(FirstName : string, LastName: string, Gender: string,
            BirthDate: Date, Generation: number, DeathDate?: Date){
    let TreeId = this.treeId;
    this.personService.addPerson({ FirstName, LastName, Gender,
                                  BirthDate, DeathDate, TreeId, Generation } as Person)
      .subscribe(data =>{
        this.reloadChild();
      });
  }

  getAllFromTree(){
    let TreeId = this.treeId;
    this.personService.getPersonsByTree(TreeId)
      .subscribe(people => {
        this.people = people;
        this.listRel = [];
        this.listRel.push({rel: 'Father', gen: 1}, {rel: 'Mother', gen: 1}, {rel: 'Partner', gen: 0},
        {rel: 'Fiancé', gen: 0}, {rel: 'Husband/Spouse', gen: 0}, 
        {rel: 'Brother', gen: 0}, {rel: 'Sister', gen: 0}, {rel: 'Child', gen: -1});
        this.isLoaded = true;
      });
  }

  reloadChild() {
    this.eventsSubject.next();
  }

  onSelect(person : Person){
    this.selectedPerson = person;
  }

  onSelectRel(relation : object) {
    this.selectedRel = relation;

  }
}

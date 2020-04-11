import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Tree } from '../tree';
import { TreeService } from '../tree.service';

import { Person } from '../person';
import { PersonService } from '../person.service';

import { ParentChild } from '../parentchild';
import { ParentchildService } from '../parentchild.service';

import { Relationship } from '../relationship';
import { RelationshipService } from '../relationship.service';

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
  parents: Person [];
  parents2: Person [];
  newPersonId: number;
  // need to wait for the tree object to be filled before
  // passing it through the canvas element in the html
  isLoaded: boolean;
  // items needed when adding a new person via form
  radioData: string;
  selectedPerson: Person;
  selectedPerson1: Person;
  selectedPerson2: Person;
  listRel: Array<object>;
  selectedRel: any;
  selectedRel2: any;
  firstname: string;
  lastname: string;
  startDate: any;
  endDate?: any;
  // to reload the child component (canvas) on new input
  eventsSubject: Subject<void> = new Subject<void>();
  

  constructor(
    private route: ActivatedRoute,
    private treeService: TreeService,
    private personService: PersonService,
    private parentchildService: ParentchildService,
    private relationshipService: RelationshipService,
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
      .subscribe(personId =>{
        this.newPersonId = personId;
        if (this.selectedRel.rel == "Parent"){
          this.addParentChild(personId, this.selectedPerson.PersonId, false);
        }
        else if (this.selectedRel.rel == "Child"){
          this.addParentChild(this.selectedPerson.PersonId, personId, false);
        }
        else if (this.selectedRel.rel == "Sibling"){
          this.getParents(this.selectedPerson.PersonId);
        }
        else if (this.selectedRel.code == "m" && this.selectedPerson.Gender == "m"){
          this.addRelationship(this.selectedPerson.PersonId, personId, this.startDate,
                              false, this.selectedRel.code, this.endDate)
        }
        else if (this.selectedRel.code == "f" && this.selectedPerson.Gender == "m"){
          this.addRelationship(this.selectedPerson.PersonId, personId, this.startDate,
                              false, this.selectedRel.code, this.endDate)
        }
        else if (this.selectedRel.code == "p" && this.selectedPerson.Gender == "m"){
          this.addRelationship(this.selectedPerson.PersonId, personId, this.startDate,
                              false, this.selectedRel.code, this.endDate)
        }
        else if (this.selectedRel.code == "m" && this.selectedPerson.Gender == "f"){
          this.addRelationship(personId, this.selectedPerson.PersonId, this.startDate,
                              false, this.selectedRel.code, this.endDate)
        }
        else if (this.selectedRel.code == "f" && this.selectedPerson.Gender == "f"){
          this.addRelationship(personId, this.selectedPerson.PersonId, this.startDate,
                              false, this.selectedRel.code, this.endDate)
        }
        else if (this.selectedRel.code == "p" && this.selectedPerson.Gender == "f"){
          this.addRelationship(personId, this.selectedPerson.PersonId, this.startDate,
                              false, this.selectedRel.code, this.endDate)
        }

      });
  }

  addParentChild(Person1Id : number, Person2Id: number, IsAdopted: boolean){
    let TreeId = this.treeId;
    this.parentchildService.addParentChild({ Person1Id, Person2Id, IsAdopted,
                                          TreeId } as ParentChild)
      .subscribe(data =>{
      this.reloadChild();
      });
  }

  addRelationship(Person1Id : number, Person2Id: number, StartDate: Date,
                  IsUnisex: boolean, RelationshipTypeCode: string, EndDate?: Date){
    let TreeId = this.treeId;
    this.relationshipService.addRelationship({ Person1Id, Person2Id, StartDate, EndDate,
                                          IsUnisex, RelationshipTypeCode, TreeId } as Relationship)
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
        this.listRel.push({rel: 'Parent', gen: 1}, {rel: 'Partner', gen: 0, code: 'p'},
        {rel: 'Fiancé', gen: 0, code: 'f'}, {rel: 'Spouse', gen: 0, code: 'm'}, 
        {rel: 'Sibling', gen: 0}, {rel: 'Child', gen: -1});
        this.isLoaded = true;
      });
  }

  getParents(personId: number){
    this.personService.getParents(personId)
      .subscribe(parents => {
        this.parents = parents;
        if (this.parents.length == 0){
          this.reloadChild();
          return;
        }
        for (var i=0; i<this.parents.length; i++){
          this.addParentChild(this.parents[i].PersonId, this.newPersonId, false);
        }
      })
  }

  getParents2(person1Id: number, person2Id: number){
    this.personService.getParents(person1Id)
      .subscribe(parents => {
        this.parents = parents;
        this.personService.getParents(person2Id)
          .subscribe(parents2 =>{
            this.parents2 = parents2;
            if (this.parents == this.parents2){
              return;
            }
            else if (this.parents.length > this.parents2.length){
              let newArray = this.parents.filter(({PersonId: id1}) => !(this.parents2.some(({ PersonId: id2 }) => id2 == id1)));
              console.log("new Array :"+ newArray.length)
              for (var i=0; i<newArray.length; i++){
                this.addParentChild(newArray[i].PersonId, person2Id, false);
              }
            }
            else {
              let newArray = this.parents2.filter(({PersonId: id1}) => !(this.parents.some(({ PersonId: id2 }) => id2 == id1)));
              for (var i=0; i<newArray.length; i++){
                this.addParentChild(newArray[i].PersonId, person1Id, false);
              }
            }
          })
        })  
  }

  storeDates(startDate, endDate){
    this.startDate = startDate;
    this.endDate = endDate;
  }

  reloadChild() {
    this.eventsSubject.next();
  }

  onSelect(person : Person){
    this.selectedPerson = person;
  }

  onSelectP1(person : Person){
    this.selectedPerson1 = person;
  }

  onSelectP2(person : Person){
    this.selectedPerson2 = person;
  }

  onSelectRel(relation : object) {
    this.selectedRel = relation;
  }

  onSelectRel2(relation : object) {
    this.selectedRel2 = relation;
  }
}

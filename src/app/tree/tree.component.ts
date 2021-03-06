import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component'

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
  //Need to wait for the tree object to be filled before
  //passing it through the canvas element in the html
  isLoaded: boolean;
  //Is the current user owning the tree?
  isOwner: boolean;
  //Is the tree empty at the moment?
  isEmpty: boolean;
  //Items needed when adding a new person via form
  addStartVal: boolean;
  relStartVal: boolean;
  addStartValFirst: boolean;
  radioData: string;
  selectedPerson: Person;
  selectedPerson1: Person;
  selectedPerson2: Person;
  defaultChoice: string;
  listRel: Array<object>;
  selectedRel: any;
  selectedRel2: any;
  firstname: string;
  lastname: string;
  startDate: any;
  endDate?: any;
  //Allows to reload the child component (canvas) on new input
  reloadCanvas: Subject<void> = new Subject<void>();
  //Performs a Y translation when adding a person on top of the tree
  yTranslation: Subject<void> = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private treeService: TreeService,
    private personService: PersonService,
    private parentchildService: ParentchildService,
    private relationshipService: RelationshipService,
    public dialog: MatDialog,
  ) { }
  //Loading start here
  ngOnInit(): void {
    this.isLoaded = false;
    this.route.paramMap.subscribe(params => {
    this.treeId = +params.get('treeId');
    this.getTreeFromId(this.treeId);
    });
  }
  //Load the tree
  getTreeFromId(treeId: number){
    this.treeService.getTree(treeId)
      .subscribe(tree => {
        this.tree = tree;
        this.getAllFromTree();
      });
  }
  //Load people from the tree
  getAllFromTree(){
    let TreeId = this.treeId;
    this.personService.getPersonsByTree(TreeId)
      .subscribe(people => {
        this.people = people;
        this.listRel = [];
        this.listRel.push({rel: 'Parent', gen: 1}, {rel: 'Partner', gen: 0, code: 'p'},
        {rel: 'Fiancé', gen: 0, code: 'f'}, {rel: 'Spouse', gen: 0, code: 'm'}, 
        {rel: 'Sibling', gen: 0}, {rel: 'Child', gen: -1});
        this.addStartVal = false;
        this.relStartVal = false;
        this.addStartValFirst = false;
        if(this.tree.UserId == +localStorage.getItem("UserId")){
          this.isOwner = true;
        }else this.isOwner = false;
        if(this.people.length == 0){
          this.isEmpty = true;
        }else this.isEmpty = false;
        this.isLoaded = true;
      });
  }
  //Loading finishes here

  //Adding a person logic start here
  addStartFirst(){
    this.addStartValFirst = !this.addStartValFirst;
  }

  addStart(){
    this.addStartVal = !this.addStartVal;
  }

  addFirstPerson(FirstName : string, LastName: string, Gender: string,
    BirthDate: Date, Generation: number, DeathDate?: Date){
    let TreeId = this.treeId;
    let PositionX = 20;
    let PositionY = 20;
    this.personService.addPerson({ FirstName, LastName, Gender,
                                    BirthDate, DeathDate, TreeId, Generation,
                                    PositionX, PositionY } as Person)
      .subscribe(() =>{
        this.isEmpty = false;
        this.reloadChild();
      });
  }

  addPerson(FirstName : string, LastName: string, Gender: string,
            BirthDate: Date, Generation: number, DeathDate?: Date){
    let TreeId = this.treeId;
    if (this.selectedRel.rel == "Parent"){
      var PositionX= this.selectedPerson.PositionX; 
      var PositionY= this.selectedPerson.PositionY - 80;
      //Can't go above the canvas
      if (PositionY < 40){
        PositionY = 40;
        this.canvasTranslation();
      } 
    }
    else if (this.selectedRel.rel == "Child"){
      var PositionX= this.selectedPerson.PositionX; 
      var PositionY= this.selectedPerson.PositionY + 80; 
    }
    else {
      var PositionX= this.selectedPerson.PositionX + 160; 
      var PositionY= this.selectedPerson.PositionY; 
    }
    this.personService.addPerson({ FirstName, LastName, Gender,
                                  BirthDate, DeathDate, TreeId, Generation,
                                  PositionX, PositionY } as Person)
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
      this.reloadPeople();
      this.reloadChild();
      });
  }

  addRelationship(Person1Id : number, Person2Id: number, StartDate: Date,
                  IsUnisex: boolean, RelationshipTypeCode: string, EndDate?: Date){
    let TreeId = this.treeId;
    this.relationshipService.addRelationship({ Person1Id, Person2Id, StartDate, EndDate,
                                          IsUnisex, RelationshipTypeCode, TreeId } as Relationship)
      .subscribe(data =>{
      this.reloadPeople();
      this.reloadChild();
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
  //Adding a person logic end here

  //Adding a relationshiop logic start here
  relStart(){
    this.relStartVal = !this.relStartVal;
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

  storeDates(startDate: any, endDate: any){
    this.startDate = startDate;
    this.endDate = endDate;
  }
  //Adding a relationshiop logic end here

  //Updating a person logic start here
  update(person: Person){
    this.router.navigate(['/tree/'+ this.treeId + '/person/'+ person.PersonId]);
  }
  //Updating a person logic end here

  //Removing a person logic start here
  openDialog(person: Person): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: `Are you sure you want to delete ${person.FirstName} ${person.LastName}
              and all of its relationships?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.deleteRelationship(person.PersonId);
      }
    });
  }

  deleteRelationship(id: number){
    this.relationshipService.deleteRelationshipId(id)
      .subscribe(() => {
        this.deleteParentChild(id);
      });
  }

  deleteParentChild(id: number){
    this.parentchildService.deleteParentChildId(id)
      .subscribe(() => {
        this.deletePerson(id);
      });
  }

  deletePerson(id: number){
    this.personService.deletePerson(id)
      .subscribe(() => {
        this.reloadPeople();
        this.reloadChild();
      });
  }
  //Removing a person logic end here

  //Reload the people array after a change
  reloadPeople() {
    let TreeId = this.treeId;
    this.personService.getPersonsByTree(TreeId)
      .subscribe(people => {
        this.people = people;
      });
  }

  //Reload the canvas after a change
  reloadChild() {
    this.reloadCanvas.next();
  }

  //Push a Y translation on the canvas
  canvasTranslation() {
    this.yTranslation.next();
  }
}

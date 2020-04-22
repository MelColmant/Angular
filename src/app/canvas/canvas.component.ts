import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Person } from '../person';
import { PersonService } from '../person.service';

import { Relationship } from '../relationship';
import { RelationshipService } from '../relationship.service';

import { ParentChild } from '../parentchild';
import { ParentchildService } from '../parentchild.service';

import { Tree } from '../tree';
import { Subscription, Observable } from 'rxjs';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  private reloadSubscription: Subscription;
  @Input() reloadCanvas: Observable<void>;
  private yTranslationSubscription: Subscription;
  @Input() yTranslation: Observable<void>;
  @Input() tree: Tree;
  @ViewChild('canvas', { static: true})
  canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;
  offsetX: number;
  offsetY: number;
  isDown: boolean;
  dragTarget: any;
  boxes: Array<any>;
  connectorsRel: Array<any>;
  connectorsPC: Array<any>;
  cloneConnectorsPC: Array<any>;
  familyArray: Array<any>;
  pcArray: Array<any>;
  drawSimpleArray: Array<any>;
  draw1parentArray: Array<any>;
  draw2parentsArray: Array<any>;
  startX : number;
  startY : number;
  mouseX : number;
  mouseY : number;

  people : Person [];
  relationships : Relationship [];
  parentchilds : ParentChild [];
  isLoaded : boolean;
  //setting up canvas related variables
  canvasWidth: number;
  canvasHeight: number;
  boxWidth: number;
  spaceWidth: number;
  boxHeight: number;
  spaceHeight: number;
  maxX: number;
  maxY: number;
  couldResizeX: boolean;
  couldResizeY: boolean;
  //Default value of a boolean is false
  //Use canSkip to skip methods when not needed
  canSkip: boolean;

  constructor(
    private personService: PersonService,
    private relationshipService: RelationshipService,
    private parentchildService: ParentchildService,
    private router: Router,
  ) { }

  ngOnInit() : void {
    //Setting up initial width and height
    this.canvasWidth=0;
    this.canvasHeight=0;
    this.couldResizeX = false;
    this.couldResizeY = false;
    //Listening to parent events to reload canvas when needed
    this.reloadSubscription = this.reloadCanvas.subscribe(() => this.reload());
    this.yTranslationSubscription = this.yTranslation.subscribe(() => this.yTranslate());
    this.isLoaded = true;
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.getAllFromTree();
  }

  reload(){
    this.ngOnInit();
  }

  yTranslate(){
    console.log("it works");
  }

  ngOnDestroy() {
    this.reloadSubscription.unsubscribe();
    this.yTranslationSubscription.unsubscribe();
  }
  //Get all people from this tree
  getAllFromTree(){
    let TreeId = this.tree.TreeId;
    this.personService.getPersonsByTree(TreeId)
      .subscribe(people => {
        this.people = people;
        //Hide the canvas if there aren't any people in the tree
        if (this.people === undefined || this.people.length == 0){
          this.isLoaded = false;
          return;
        }
        //Set up canvas size based on maxX, box height and space height (canvas height)
        //as well as maxY, box width and space width (canvas width)
        this.setCanvas(110, 20, 55, 20, this.getMaxX(), this.getMaxY());
        //Skip other methods if the goal is just to resize then draw
        if (this.canSkip){
          this.canSkip = false;
          this.draw();
        }
        this.getAllRelFromTree(TreeId);
      });
  }
  //Get all relationships from this tree (partners/fiance/married)
  getAllRelFromTree(id : number){
    let TreeId = this.tree.TreeId;
    this.relationshipService.getAllByTree(id)
      .subscribe(relationships => {
        this.relationships = relationships;
        this.getAllPCFromTree(TreeId);
      });
  }
  //Get all parent-children relationships from this tree
  getAllPCFromTree(id : number){
    this.parentchildService.getAllByTree(id)
      .subscribe(parentchilds => {
        this.parentchilds = parentchilds;
        this.init();
      });
  }

  //Get the maximum box position in X
  getMaxX() {
    this.maxX = 0;
    for (var i = 0; i<this.people.length; i++){
      if (this.people[i].PositionX > this.maxX){
        this.maxX = this.people[i].PositionX;
      }
    }
    return this.maxX;
  }

  //Get the maximum box position in Y
  getMaxY() {
    this.maxY = 0;
    for (var i = 0; i<this.people.length; i++){
      if (this.people[i].PositionY > this.maxY){
        this.maxY = this.people[i].PositionY;
      }
    }
    return this.maxY;
  }

  //Set up the canvas dimension
  setCanvas(boxWidth: number, spaceWidth: number, boxHeight: number, spaceHeight: number,
            maxX: number, maxY: number){
    //initialize the global variables related to the canvas
    this.boxWidth = boxWidth;
    this.spaceWidth = spaceWidth;
    this.boxHeight = boxHeight;
    this.spaceHeight = spaceHeight;
    var width = maxX + boxWidth + 2 * spaceWidth;
    this.canvasWidth = width;
    var height = maxY + boxHeight + 2 * spaceHeight;
    this.canvasHeight = height;
  }

  init() {
    //Set up the initial offset
    this.offsetX = this.canvas.nativeElement.getBoundingClientRect().left;
    this.offsetY = this.canvas.nativeElement.getBoundingClientRect().top;
    //Position the boxes on the canvas
    this.boxes = [];
    for (var i=0; i < this.people.length; i++) {
      var posX = this.people[i].PositionX;
      var posY = this.people[i].PositionY;
      var val = this.people[i].PersonId;
      this.boxes.push({
        x: posX, y: posY, w: this.boxWidth, h: this.boxHeight, personId: val
      });
    }

    //Creating the relationships array
    this.connectorsRel = [];
    for (var i =0; i < this.relationships.length; i++) {
      var val1 = this.relationships[i].Person1Id;
      var val2 = this.relationships[i].Person2Id;
      var relType = this.relationships[i].RelationshipTypeCode;
      this.connectorsRel.push({
        person1Id : val1, person2Id : val2, relType : relType
      });
    }

    //Creating the parent child array
    this.connectorsPC = [];
    for (var i =0; i < this.parentchilds.length; i++) {
      var val1 = this.parentchilds[i].Person1Id;
      var val2 = this.parentchilds[i].Person2Id;
      var isAdopted = this.parentchilds[i].IsAdopted;
      this.connectorsPC.push({
        person1Id : val1, person2Id : val2, isAdopted : isAdopted
      });
    }

    //Initialize temporary arrays
    this.familyArray = [];
    this.cloneConnectorsPC = [...this.connectorsPC];
    this.pcArray = [];
    this.drawSimpleArray = [];
    this.draw1parentArray = [];
    this.draw2parentsArray = [];
    //Loop on relationships array & parentchild array to find relationships with children
    for (var i = 0; i < this.connectorsRel.length; i++) {
      for (var j = 0; j < this.cloneConnectorsPC.length; j++) {
        if (this.connectorsRel[i].person1Id == this.cloneConnectorsPC[j].person1Id){
          //Push children from person1 of the relationship in familyArray
          this.familyArray.push(this.cloneConnectorsPC[j].person2Id);
        }
        if (this.connectorsRel[i].person2Id == this.cloneConnectorsPC[j].person1Id){
          //Push children from person2 of the relationship in familyArray
          this.familyArray.push(this.cloneConnectorsPC[j].person2Id);
        }
      }
      //Act on the familyArray
      if (this.familyArray.length == 0){
        //This relationship has no children => draw a simple relationship
        this.drawSimpleArray.push({1: this.connectorsRel[i].person1Id,
                                    2: this.connectorsRel[i].person2Id})
      }
      else if (!this.hasDuplicate(this.familyArray)){
        //There aren't any common children in that relationship => draw a simple relationship
        this.drawSimpleArray.push({1: this.connectorsRel[i].person1Id,
                                    2: this.connectorsRel[i].person2Id})
        //Then reinitialize familyArray
        this.familyArray = [];
      }
      else if (this.hasDuplicate(this.familyArray)){
        //There are common children in that relationship =>
        //Just keep one of each duplicated children (they are the common children in that relationship)
        this.familyArray = this.findDuplicates(this.familyArray);
        //Remove these children from cloneConnectorsPC since both parents have been found =>
        var tempArray = [];
        for (var k = 0; k < this.familyArray.length; k++){
          for (var l = 0; l < this.cloneConnectorsPC.length; l++){
            if(this.cloneConnectorsPC[l].person2Id == this.familyArray[k]){
            //Push all common children in tempArray
            tempArray.push(this.cloneConnectorsPC[l]);
            }
          }   
        }
        //Filter cloneConnectorsPC from common children
        this.cloneConnectorsPC = this.cloneConnectorsPC.filter(x => !tempArray.includes(x));
        this.draw2parentsArray.push({1: this.connectorsRel[i].person1Id, 
                                      2: this.connectorsRel[i].person2Id,
                                      3: this.familyArray});
        //Reinitialize familyArray for the next relationship in the loop
        this.familyArray = []; 
      }
    }  
    
    //cloneConnectorsPC now only contains 1 parent/childs relationships, 
    //which are sorted by ParentId, as per API request 
    for (var i = 0; i < this.cloneConnectorsPC.length; i++) {
      if (i+1 == this.cloneConnectorsPC.length) {
        //Got to the end of the array => push last element before drawing that relationship 
        this.pcArray.push(this.cloneConnectorsPC[i].person2Id);
        this.draw1parentArray.push({1: this.cloneConnectorsPC[i].person1Id, 2: this.pcArray})
        //Then empty pcArray
        this.pcArray = [];
      }
      if (i+1 != this.cloneConnectorsPC.length &&
        this.cloneConnectorsPC[i].person1Id != this.cloneConnectorsPC[i+1].person1Id){
        //Next element hasn't the same parent as this element => push and draw
        this.pcArray.push(this.cloneConnectorsPC[i].person2Id);
        this.draw1parentArray.push({1: this.cloneConnectorsPC[i].person1Id, 2: this.pcArray})
        //Then empty pcArray
        this.pcArray = [];
      }
      else if (i+1 != this.cloneConnectorsPC.length &&
        this.cloneConnectorsPC[i].person1Id == this.cloneConnectorsPC[i+1].person1Id){
        //Next element has the same parent as  this element => push
        this.pcArray.push(this.cloneConnectorsPC[i].person2Id);
      }
    }
    //Draw on canvas
    this.draw();
  }

  //Check if an array has duplicates or not
  hasDuplicate(array: any[]){
    return (new Set(array)).size != array.length;
  }

  //Find duplicates in an array & return an array with single values of them
  findDuplicates(array: any[]){
    const object = {};
    const result = [];
    array.forEach((item: string | number) => {
      if(!object[item])
        object[item] = 0;
      object[item] += 1;
    })
    for (const prop in object) {
      if(object[prop] >= 2){
        result.push(prop);
      }
    }
    return result;
  }

  draw() {
    //Clear the canvas
    //this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    //Draw the boxes
    for (var i =0; i < this.boxes.length; i++) {
      var box = this.boxes[i];
      if (this.people[i].Gender == "m")
      {
        this.ctx.fillStyle = "LightBlue";
      }
      else this.ctx.fillStyle = "LightPink";
      this.ctx.fillRect(box.x, box.y, box.w, box.h);
      this.ctx.fillStyle = "Black";
      this.ctx.font = "14px Calibri";
      this.ctx.fillText(this.people[i].FirstName + " " + this.people[i].LastName, 
      box.x + 5, box.y + (0.55*this.boxHeight));
    }
    //Draw the relationships
    for (var j = 0; j < this.draw2parentsArray.length; j++){
      this.draw2Parents(this.draw2parentsArray[j][1], this.draw2parentsArray[j][2],
                        this.draw2parentsArray[j][3] )
    }
    for (var k = 0; k < this.draw1parentArray.length; k++){
      this.draw1Parent(this.draw1parentArray[k][1], this.draw1parentArray[k][2])
    }
    for (var l = 0; l < this.drawSimpleArray.length; l++){
      this.drawSimple(this.drawSimpleArray[l][1], this.drawSimpleArray[l][2])
    }
  }
  //Draw a simple relationship between 2 people
  drawSimple(id1: any, id2: any) {
    var box1 = this.boxes.find(x => x.personId == id1);
    var box2 = this.boxes.find(x => x.personId == id2);
    this.ctx.globalCompositeOperation = "destination-over";
    this.ctx.beginPath();
    this.ctx.moveTo(box1.x + box1.w / 2, box1.y + box1.h / 2);
    this.ctx.lineTo(box2.x + box2.w / 2, box2.y + box2.h / 2);
    this.ctx.strokeStyle = "Black";
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = "source-over";
  }
  //Draw a one parent relationship
  draw1Parent(idP: any, arrayC: string | any[]) {
    var box1 = this.boxes.find(x => x.personId == idP);
    //Set up the parent box array
    var boxesP = [];
    boxesP.push(box1);
    //Set up the children boxes array
    var boxesC = [];
    for (var i=0; i < arrayC.length; i++){
      var box = this.boxes.find(x => x.personId == arrayC[i]);
      boxesC.push(box);
    }
    //There is no relative position of the inflection point in X for 1 parent
    //Relative position of the inflection point in Y
    var relInflectionPointY = (Math.abs((boxesC[0].y + ((boxesC[0].h)/2)) - 
                              (boxesP[0].y + ((boxesP[0].h)/2))))/2;
    var pMinBox = boxesP[0];
    var cMinBox = boxesC[0];
    for (var i = 0; i < boxesC.length; i++) {
      var childBox = boxesC[i];
      var tempMin = (Math.abs((childBox.y + ((childBox.h)/2)) - 
                      (pMinBox.y + ((pMinBox.h)/2))))/2;
      if (tempMin < relInflectionPointY) {
          relInflectionPointY = tempMin;
          cMinBox = childBox;
      }
    }
    //Find the absolute minimum in X and Y
    var absMinX = boxesP[0].x + (boxesP[0].w)/2;
    var absMinY = Math.min((cMinBox.y + ((cMinBox.h)/2)), (pMinBox.y + ((pMinBox.h)/2)));
    //Calculare the absolute inflection point in X and Y
    var absInflectionPointX = absMinX;
    var absInflectionPointY = absMinY + relInflectionPointY;
    //Draw the relationship
    var box = boxesP[0];
    this.ctx.globalCompositeOperation = "destination-over";
    this.ctx.beginPath();
    this.ctx.moveTo(box.x + box.w / 2, box.y + box.h / 2);
    this.ctx.lineTo(box.x + box.w / 2, absInflectionPointY);
    this.ctx.strokeStyle = "Black";
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(box.x + box.w / 2, absInflectionPointY);
    this.ctx.lineTo(absInflectionPointX, absInflectionPointY);
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = "source-over";

    for (var i = 0; i < boxesC.length; i++){
      var box = boxesC[i];
      this.ctx.globalCompositeOperation = "destination-over";
      this.ctx.beginPath();
      this.ctx.moveTo(box.x + box.w / 2, box.y + box.h / 2);
      this.ctx.lineTo(box.x + box.w / 2, absInflectionPointY);
      this.ctx.strokeStyle = "Black";
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(box.x + box.w / 2, absInflectionPointY);
      this.ctx.lineTo(absInflectionPointX, absInflectionPointY);
      this.ctx.stroke();
      this.ctx.globalCompositeOperation = "source-over";
    }
  }
  //Draw a 2 parents relationship
  draw2Parents(idP1: any, idP2: any, arrayC: string | any[]) {
    var box1 = this.boxes.find(x => x.personId == idP1);
    var box2 = this.boxes.find(x => x.personId == idP2);
    //Set up the parents boxes array
    var boxesP = [];
    boxesP.push(box1, box2);
    //Set up the children boxes array
    var boxesC = [];
    for (var i=0; i < arrayC.length; i++){
      var box = this.boxes.find(x => x.personId == arrayC[i]);
      boxesC.push(box);
    }
    //Relative position of the inflection point in X
    var relInflectionPointX = (Math.abs((boxesP[1].x + ((boxesP[1].w)/2)) - 
                              (boxesP[0].x + ((boxesP[0].w)/2))))/2;
    //Relative position of the inflection point in Y
    var relInflectionPointY = (Math.abs((boxesC[0].y + ((boxesC[0].h)/2)) - 
                              (boxesP[0].y + ((boxesP[0].h)/2))))/2;
    var pMinBox = boxesP[0];
    var cMinBox = boxesC[0];
    for (var i = 0; i < boxesC.length; i++) {
      var childBox = boxesC[i];
      for (var j = 0; j < boxesP.length; j++) {
        var parentBox = boxesP[j];
        var tempMin = (Math.abs((childBox.y + ((childBox.h)/2)) - 
                      (parentBox.y + ((parentBox.h)/2))))/2;
        if (tempMin < relInflectionPointY) {
          relInflectionPointY = tempMin;
          pMinBox = parentBox;
          cMinBox = childBox;
        }
      }
    }
    //Find the absolute minimum in X and Y
    var absMinX = Math.min((boxesP[0].x + ((boxesP[0].w)/2)), (boxesP[1].x + ((boxesP[1].w)/2)));
    var absMinY = Math.min((cMinBox.y + ((cMinBox.h)/2)), (pMinBox.y + ((pMinBox.h)/2)));
    //Calculate the absolute inflection point in X and Y
    var absInflectionPointX = absMinX + relInflectionPointX;
    var absInflectionPointY = absMinY + relInflectionPointY;
    //Draw the relationship
    for (var i = 0; i < boxesP.length; i++){
      var box = boxesP[i];
      this.ctx.globalCompositeOperation = "destination-over";
      this.ctx.beginPath();
      this.ctx.moveTo(box.x + box.w / 2, box.y + box.h / 2);
      this.ctx.lineTo(box.x + box.w / 2, absInflectionPointY);
      this.ctx.strokeStyle = "Black";
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(box.x + box.w / 2, absInflectionPointY);
      this.ctx.lineTo(absInflectionPointX, absInflectionPointY);
      this.ctx.stroke();
      this.ctx.globalCompositeOperation = "source-over";
    }

    for (var i = 0; i < boxesC.length; i++){
      var box = boxesC[i];
      this.ctx.globalCompositeOperation = "destination-over";
      this.ctx.beginPath();
      this.ctx.moveTo(box.x + box.w / 2, box.y + box.h / 2);
      this.ctx.lineTo(box.x + box.w / 2, absInflectionPointY);
      this.ctx.strokeStyle = "Black";
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(box.x + box.w / 2, absInflectionPointY);
      this.ctx.lineTo(absInflectionPointX, absInflectionPointY);
      this.ctx.stroke();
      this.ctx.globalCompositeOperation = "source-over";
    }

  }
  //Set up the dragTarget
  hit(x: number, y: number) {
    for (var i = 0; i < this.boxes.length; i ++) {
      var box = this.boxes[i];
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
        this.dragTarget = box;
        return true;
      }
    }
    //Allows to only update DB via MouseUp when dragTarget is a box
    this.dragTarget = null;
    return false;
  }
  //Geet the dragTarget personId
  hitBox(x: number, y: number) {
    for (var i = 0; i < this.boxes.length; i ++) {
      var box = this.boxes[i];
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
        return box.personId;
      }
    }
    return null;
  }
  //Navigate to person update page when double clicking on box
  handleMouseClick(e: { clientX: string | number; clientY: string | number; }) {
    this.startX = +e.clientX - this.offsetX;
    this.startY = +e.clientY - this.offsetY;
    var PersonId = this.hitBox(this.startX, this.startY);
    //Only naviagate when clicking on a box and user owns the tree
    if (PersonId != null && this.tree.UserId == +localStorage.getItem("UserId")){
      this.router.navigate(['/tree/'+ this.tree.TreeId + '/person/'+ PersonId]);
    } 
  }

  handleMouseDown(e: { clientX: string | number; clientY: string | number; }) {
    //Update the offset if the user did scroll his page
    this.offsetX = this.canvas.nativeElement.getBoundingClientRect().left;
    this.offsetY = this.canvas.nativeElement.getBoundingClientRect().top;
    this.startX = +e.clientX - this.offsetX;
    this.startY = +e.clientY - this.offsetY;
    this.isDown = this.hit(this.startX, this.startY);
    //Update couldResizeX if the dragTarget is the MaxX
    if (this.dragTarget != null && this.dragTarget.x == this.maxX) {
      this.couldResizeX = true;
    }
    //Update couldResizeY if the dragTarget is the MaxY
    if (this.dragTarget != null && this.dragTarget.y == this.maxY) {
      this.couldResizeY = true;
    }
  }

  handleMouseUp(e: { clientX: string | number; clientY: string | number; }) {
    //Update dragTarget position change in Database 
    if(this.dragTarget != null){
      this.updatePos(this.dragTarget.personId, this.dragTarget.x, this.dragTarget.y);
    }
    this.dragTarget = null;
    this.isDown = false;
  }

  handleMouseOut(e: { clientX: string | number; clientY: string | number; }) {
    this.handleMouseUp(e);
  }
  //Update dragTarget position on canvas
  handleMouseMove(e: { clientX: string | number; clientY: string | number; }) {
    if (!this.isDown) {
      return;
    }

    this.mouseX = +e.clientX - this.offsetX;
    this.mouseY = +e.clientY - this.offsetY;

    var dx = this.mouseX - this.startX;
    var dy = this.mouseY - this.startY;
    this.startX = this.mouseX;
    this.startY = this.mouseY;
    this.dragTarget.x += dx;
    this.dragTarget.y += dy;
    this.draw();
  }

  //update dragTarget position in DB on MouseUp
  updatePos(id : number, posX : number, posY : number){
    var personToUpdate = this.people.find(x => x.PersonId == id);
    var PersonId = personToUpdate.PersonId;
    var FirstName = personToUpdate.FirstName;
    var LastName = personToUpdate.LastName;
    var Gender = personToUpdate.Gender;
    var BirthDate = personToUpdate.BirthDate;
    var DeathDate = personToUpdate.DeathDate;
    var TreeId = personToUpdate.TreeId;
    var Generation = personToUpdate.Generation;
    var PositionX = posX;
    var PositionY = posY;
    this.personService.updatePosition(id, { PersonId, FirstName, LastName, Gender,
      BirthDate, DeathDate, TreeId, Generation, PositionX, PositionY } as Person )
      .subscribe(data => {
        //Reload canvas if user wants more space
        if (PositionX > this.maxX || PositionY > this.maxY){
          //Skip over unneeded calls/methods 
          this.canSkip = true;
          this.reload();
        }
        //Reload the canvas if user needs less space in X
        else if (((PositionX + this.boxWidth) < this.maxX) && this.couldResizeX){ 
          //Skip over unneeded calls/methods 
          this.canSkip = true;
          this.reload();
        }
        //Reload the canvas if user needs less space in Y
        else if (((PositionY + (1.5*this.boxHeight)) < this.maxY) && this.couldResizeY){ 
          //Skip over unneeded calls/methods 
          this.canSkip = true;
          this.reload();
        }else {
          this.couldResizeX = false;
          this.couldResizeY = false;
        }
      });
  }
}

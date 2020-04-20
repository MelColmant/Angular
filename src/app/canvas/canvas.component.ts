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

  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;


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
  connectorsRel2: Array<any>;
  connectorsPC2: Array<any>;
  cloneConnectorsPC2: Array<any>;
  familyArray: Array<any>;
  pcArray: Array<any>;
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

  constructor(
    private personService: PersonService,
    private relationshipService: RelationshipService,
    private parentchildService: ParentchildService,
    private router: Router,
  ) { }

  ngOnInit() : void {
    //setting up initial width and height
    this.canvasWidth=1;
    this.canvasHeight=1;
    this.couldResizeX = false;
    this.couldResizeY = false;
    //listening to parent events to reload canvas when needed
    this.eventsSubscription = this.events.subscribe(() => this.reload());
    this.isLoaded = true;
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.getAllFromTree();
  }

  reload(){
    this.ngOnInit();
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }
  //get all people from this tree
  getAllFromTree(){
    let TreeId = this.tree.TreeId;
    //the + allows to cast localStorage string into number
    this.personService.getPersonsByTree(TreeId)
      .subscribe(people => {
        this.people = people;
        //want  to hide the canvas if there aren't any people in the tree
        if (this.people === undefined || this.people.length == 0){
          this.isLoaded = false;
          return;
        }
        //Set up canvas size based on maxX, box height and space height (canvas height)
        //as well as maxY, box width and space width (canvas width)
        this.setCanvas(100, 20, 50, 20, this.getMaxX(), this.getMaxY());
        this.getAllRelFromTree(TreeId);
      });
  }
  //get all relationships from this tree (partners/fiance/married)
  getAllRelFromTree(id : number){
    let TreeId = this.tree.TreeId;
    this.relationshipService.getAllByTree(id)
      .subscribe(relationships => {
        this.relationships = relationships;
        this.getAllPCFromTree(TreeId)
      });
  }
  //get all parent-children relationships from this tree
  getAllPCFromTree(id : number){
    this.parentchildService.getAllByTree(id)
      .subscribe(parentchilds => {
        this.parentchilds = parentchilds;
        this.init();
      });
  }
  
  //get the maximum box position in X
  getMaxX() {
    this.maxX = 0;
    for (var i = 0; i<this.people.length; i++){
      if (this.people[i].PositionX > this.maxX){
        this.maxX = this.people[i].PositionX;
      }
    }
    return this.maxX;
  }
  //get the maximum box position in Y
  getMaxY() {
    this.maxY = 0;
    for (var i = 0; i<this.people.length; i++){
      if (this.people[i].PositionY > this.maxY){
        this.maxY = this.people[i].PositionY;
      }
    }
    return this.maxY;
  }

  //set up the canvas dimension, based on getMaxX & getMaxY
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
    this.boxes = [];
    //Position the boxes on the canvas
    for (var i=0; i < this.people.length; i++) {
      var posX = this.people[i].PositionX;
      var posY = this.people[i].PositionY;
      var val = this.people[i].PersonId;

      this.boxes.push({
        x: posX, y: posY, w: this.boxWidth, h: this.boxHeight, personId: val
      });
    }

    this.connectorsRel = [];
    
    for (var i =0; i < this.relationships.length; i++) {
      var val1 = this.relationships[i].Person1Id;
      var val2 = this.relationships[i].Person2Id;
      var relType = this.relationships[i].RelationshipTypeCode;
      this.connectorsRel.push({
        person1Id : val1, person2Id : val2, relType : relType
      });
    }

    this.connectorsPC = [];
    
    for (var i =0; i < this.parentchilds.length; i++) {
      var val1 = this.parentchilds[i].Person1Id;
      var val2 = this.parentchilds[i].Person2Id;
      var isAdopted = this.parentchilds[i].IsAdopted;
      this.connectorsPC.push({
        person1Id : val1, person2Id : val2, isAdopted : isAdopted
      });
    }

    //working on my tests
    this.connectorsRel2 = [];
    
    for (var i =0; i < this.relationships.length; i++) {
      var val1 = this.relationships[i].Person1Id;
      var val2 = this.relationships[i].Person2Id;
      var relType = this.relationships[i].RelationshipTypeCode;
      this.connectorsRel2.push({
        person1Id : val1, person2Id : val2, relType : relType
      });
    }

    this.connectorsPC2 = [];
    
    for (var i =0; i < this.parentchilds.length; i++) {
      var val1 = this.parentchilds[i].Person1Id;
      var val2 = this.parentchilds[i].Person2Id;
      var isAdopted = this.parentchilds[i].IsAdopted;
      this.connectorsPC2.push({
        person1Id : val1, person2Id : val2, isAdopted : isAdopted
      });
    }
    
    //this.draw();
    this.newDraw();
  }

  //check if array has duplicates or not
  hasDuplicate(array){
    return (new Set(array)).size != array.length;
  }
  //find duplicates in an array
  findDuplicates(array){
    const object = {};
    const result = [];
    array.forEach(item => {
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

  newDraw() {

    // clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    for (var i =0; i < this.boxes.length; i++) {
      var box = this.boxes[i];
      if (this.people[i].Gender == "m")
      {
        this.ctx.fillStyle = "LightBlue";
      }
      else this.ctx.fillStyle = "LightPink";
      this.ctx.fillRect(box.x, box.y, box.w, box.h);
      this.ctx.fillStyle = "Black";
      this.ctx.font = "13px Roboto";
      this.ctx.fillText(this.people[i].FirstName + " " + this.people[i].LastName, 
      box.x + 5, box.y + (this.boxHeight/2));
    }

    this.familyArray = [];
    this.cloneConnectorsPC2 = [...this.connectorsPC2];
    //loop on relationships & parentchild to find relationships with children
    for (var i = 0; i < this.connectorsRel2.length; i++) {
      for (var j = 0; j < this.cloneConnectorsPC2.length; j++) {
        if (this.connectorsRel2[i].person1Id == this.cloneConnectorsPC2[j].person1Id){
          //push kids from P1 of Rel in array
          this.familyArray.push(this.cloneConnectorsPC2[j].person2Id);
        }
        if (this.connectorsRel2[i].person2Id == this.cloneConnectorsPC2[j].person1Id){
          //push kids from P2 of Rel in array
          this.familyArray.push(this.cloneConnectorsPC2[j].person2Id);
        }
      }
      //TEST OK
      //for (var z = 0; z < this.familyArray.length; z++){
      //  console.log("we were there: " + i);
      //  console.log(this.familyArray[z]);
      //}
      //END TEST
      //ended the loop on PC rels
      if (this.familyArray.length == 0){
        //draw simple relation for that rel (this.connectorsRel2[i])
        this.drawSimple(this.connectorsRel2[i].person1Id, this.connectorsRel2[i].person1Id);
      }
      else if (!this.hasDuplicate(this.familyArray)){
        //there are kids but not common kids
        //draw simple relation for that rel (this.connectorsRel2[i])
        this.drawSimple(this.connectorsRel2[i].person1Id, this.connectorsRel2[i].person1Id);
        //THEN reinitialize the array
        this.familyArray = [];
      }
      else if (this.hasDuplicate(this.familyArray)){
        //remove kids that are NOT duplicated (they are NOT from that relationship) & should stay in PC
        //remove 1 of the 2 of duplicated kids (to clean for drawing) 
        this.familyArray = this.findDuplicates(this.familyArray);
        //TEST OK
        //console.log("we were there!" + i);
        //for (var z = 0; z < this.familyArray.length; z++){
        //    console.log(this.familyArray[z]);
        //  }
        //END OF TEST
        //& remove all from PC
        
        // THE ISSUE IS IN THE SPLICE THEN!
        var tempArray = [];
        for (var k = 0; k < this.familyArray.length; k++){
          for (var l = 0; l < this.cloneConnectorsPC2.length; l++){
            if(this.cloneConnectorsPC2[l].person2Id == this.familyArray[k]){
            //  this.connectorsPC2.splice(l, 1);
            tempArray.push(this.cloneConnectorsPC2[l]);
            }

          }   
        }
        this.cloneConnectorsPC2 = this.cloneConnectorsPC2.filter(x => !tempArray.includes(x));
        
      
        //draw 2 parents rel for that rel with kids (this.connectorsRel2[i]) & this.familArray
        this.draw2Parents(this.connectorsRel2[i].person1Id, this.connectorsRel2[i].person2Id,
                          this.familyArray);
        //THEN reinitialize the array
        this.familyArray = [];
        
      }
    }  

  this.pcArray = [];
  //now connectorsPC2 only contains 1 parent/childs rel, which are sorted by parent id!
  for (var i = 0; i < this.cloneConnectorsPC2.length; i++) {
    console.log(this.cloneConnectorsPC2[i]);
    if (i+1 == this.cloneConnectorsPC2.length) {
      this.pcArray.push(this.cloneConnectorsPC2[i].person2Id);
      // draw from this.pcArray as children and the father/mother
      this.draw1Parent(this.cloneConnectorsPC2[i].person1Id, this.pcArray);
      //THEN empty
      this.pcArray = [];
    }
    if (i+1 != this.cloneConnectorsPC2.length &&
        this.cloneConnectorsPC2[i].person1Id != this.cloneConnectorsPC2[i+1].person1Id){
      this.pcArray.push(this.cloneConnectorsPC2[i].person2Id);
      //draw from this.pcArray as children and the father/mother
      this.draw1Parent(this.cloneConnectorsPC2[i].person1Id, this.pcArray);
      //THEN empty
      this.pcArray = [];
    }
    else if (i+1 != this.cloneConnectorsPC2.length &&
      this.cloneConnectorsPC2[i].person1Id == this.cloneConnectorsPC2[i+1].person1Id){
      this.pcArray.push(this.cloneConnectorsPC2[i].person2Id);
    }
  
  }
}

  drawSimple(id1, id2) {
    var box1 = this.boxes.find(x => x.personId == id1);
    var box2 = this.boxes.find(x => x.personId == id2);
    this.ctx.globalCompositeOperation = "destination-over";
    this.ctx.beginPath();
    this.ctx.moveTo(box1.x + box1.w / 2, box1.y + box1.h / 2);
    this.ctx.lineTo(box2.x + box2.w / 2, box2.y + box2.h / 2);
    this.ctx.strokeStyle = "Green";
    this.ctx.stroke();
    //getting back to drawing on top of the rest
    this.ctx.globalCompositeOperation = "source-over";
  }

  draw1Parent(idP, arrayC) {
    var box1 = this.boxes.find(x => x.personId == idP);
    //set up the parent box array
    var boxesP = [];
    boxesP.push(box1);
    //set up the children box array
    var boxesC = [];
    for (var i=0; i < arrayC.length; i++){
      var box = this.boxes.find(x => x.personId == arrayC[i]);
      boxesC.push(box);
    }
    // no relative position of the inflection point in X!

    //relative position of the inflection point in Y > need to loop!
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

    var absMinX = boxesP[0].x + (boxesP[0].w)/2;
    var absMinY = Math.min((cMinBox.y + ((cMinBox.h)/2)), (pMinBox.y + ((pMinBox.h)/2)));
    // get the absolute inflection points
    var absInflectionPointX = absMinX;
    var absInflectionPointY = absMinY + relInflectionPointY;

    var box = boxesP[0];
    this.ctx.globalCompositeOperation = "destination-over";
    this.ctx.beginPath();
    this.ctx.moveTo(box.x + box.w / 2, box.y + box.h / 2);
    this.ctx.lineTo(box.x + box.w / 2, absInflectionPointY);
    this.ctx.strokeStyle = "Green";
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(box.x + box.w / 2, absInflectionPointY);
    this.ctx.lineTo(absInflectionPointX, absInflectionPointY);
    this.ctx.stroke();
    //getting back to drawing on top of the rest
    this.ctx.globalCompositeOperation = "source-over";

    for (var i = 0; i < boxesC.length; i++){
      var box = boxesC[i];
      this.ctx.globalCompositeOperation = "destination-over";
      this.ctx.beginPath();
      this.ctx.moveTo(box.x + box.w / 2, box.y + box.h / 2);
      this.ctx.lineTo(box.x + box.w / 2, absInflectionPointY);
      this.ctx.strokeStyle = "Green";
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(box.x + box.w / 2, absInflectionPointY);
      this.ctx.lineTo(absInflectionPointX, absInflectionPointY);
      this.ctx.stroke();
      //getting back to drawing on top of the rest
      this.ctx.globalCompositeOperation = "source-over";
    }
  }

  draw2Parents(idP1, idP2, arrayC) {
    var box1 = this.boxes.find(x => x.personId == idP1);
    var box2 = this.boxes.find(x => x.personId == idP2);
    //set up the parents box array
    var boxesP = [];
    boxesP.push(box1, box2);
    //set up the children box array
    var boxesC = [];
    for (var i=0; i < arrayC.length; i++){
      var box = this.boxes.find(x => x.personId == arrayC[i]);
      boxesC.push(box);
    }
    //relative position of the inflection point in X
    var relInflectionPointX = (Math.abs((boxesP[1].x + ((boxesP[1].w)/2)) - 
                              (boxesP[0].x + ((boxesP[0].w)/2))))/2;
    //relative position of the inflection point in Y > need to loop!
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

    var absMinX = Math.min((boxesP[0].x + ((boxesP[0].w)/2)), (boxesP[1].x + ((boxesP[1].w)/2)));
    var absMinY = Math.min((cMinBox.y + ((cMinBox.h)/2)), (pMinBox.y + ((pMinBox.h)/2)));
    // get the absolute inflection points
    var absInflectionPointX = absMinX + relInflectionPointX;
    var absInflectionPointY = absMinY + relInflectionPointY;

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
      //getting back to drawing on top of the rest
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
      //getting back to drawing on top of the rest
      this.ctx.globalCompositeOperation = "source-over";
    }

  }

  draw() {
    // clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    for (var i =0; i < this.boxes.length; i++) {
      var box = this.boxes[i];
      if (this.people[i].Gender == "m")
      {
        this.ctx.fillStyle = "LightBlue";
      }
      else this.ctx.fillStyle = "LightPink";
      this.ctx.fillRect(box.x, box.y, box.w, box.h);
      this.ctx.fillStyle = "Black";
      this.ctx.font = "13px Roboto";
      this.ctx.fillText(this.people[i].FirstName + " " + this.people[i].LastName, 
      box.x + 5, box.y + (this.boxHeight/2));
    }
    
    for (var i = 0; i < this.connectorsRel.length; i++) {
      for (var j = 0; j < this.boxes.length; j++) {
      
      if (this.connectorsRel[i].person1Id == this.boxes[j].personId)
        {
          var box1 = this.boxes[j];
        }
      if (this.connectorsRel[i].person2Id == this.boxes[j].personId)
        {
          var box2 = this.boxes[j];
        }

      } 

      this.ctx.globalCompositeOperation = "destination-over";
      if (this.connectorsRel[i].relType == 'p'){
        this.ctx.strokeStyle = "LightSkyBlue";
      }
      else if (this.connectorsRel[i].relType == 'f'){
        this.ctx.strokeStyle = "SkyBlue";
      }
      else this.ctx.strokeStyle = "DeepSkyBlue";
      
      this.ctx.beginPath();
      this.ctx.moveTo(box1.x + box1.w / 2, box1.y + box1.h / 2)
      this.ctx.lineTo(box2.x + box2.w / 2, box2.y + box2.h / 2)
      this.ctx.stroke();
      //getting back to drawing on top of the rest
      this.ctx.globalCompositeOperation = "source-over";

    }

    for (var i = 0; i < this.connectorsPC.length; i++) {
      for (var j = 0; j < this.boxes.length; j++) {
      
      if (this.connectorsPC[i].person1Id == this.boxes[j].personId)
        {
          var box1 = this.boxes[j];
        }
      if (this.connectorsPC[i].person2Id == this.boxes[j].personId)
        {
          var box2 = this.boxes[j];
        }

      } 

      this.ctx.globalCompositeOperation = "destination-over";
      if (this.connectorsPC[i].isAdopted == false){
        this.ctx.strokeStyle = "Bisque";
      }
      else this.ctx.strokeStyle = "PeachPuff";
      
      this.ctx.beginPath();
      this.ctx.moveTo(box1.x + box1.w / 2, box1.y + box1.h / 2)
      this.ctx.lineTo(box2.x + box2.w / 2, box2.y + box2.h / 2)
      this.ctx.stroke();
      //getting back to drawing on top of the rest
      this.ctx.globalCompositeOperation = "source-over";
    }
  }

  hit(x, y) {
    for (var i = 0; i < this.boxes.length; i ++) {
      var box = this.boxes[i];
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
        this.dragTarget = box;
        return true;
      }
    }
    //added dragTarget = null to only update MouseUp when from dragTarget
    this.dragTarget = null;
    return false;
  }

  hitBox(x, y) {
    for (var i = 0; i < this.boxes.length; i ++) {
      var box = this.boxes[i];
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
        return box.personId;
      }
    }
    return null;
  }

  handleMouseClick(e) {
    this.startX = +e.clientX - this.offsetX;
    this.startY = +e.clientY - this.offsetY;
    var PersonId = this.hitBox(this.startX, this.startY);
    // make sure to navigate only when clicking on box and if it is the owner of the tree
    if (PersonId != null && this.tree.UserId == +localStorage.getItem("UserId")){
      this.router.navigate(['/tree/'+ this.tree.TreeId + '/person/'+ PersonId]);
    } 
  }

  handleMouseDown(e) {

    // need to update the offset if the user did scroll
    this.offsetX = this.canvas.nativeElement.getBoundingClientRect().left;
    this.offsetY = this.canvas.nativeElement.getBoundingClientRect().top;
    this.startX = +e.clientX - this.offsetX;
    this.startY = +e.clientY - this.offsetY;
    this.isDown = this.hit(this.startX, this.startY);
    // update the boolean if the dragTarget has MaxX
    if (this.dragTarget != null && this.dragTarget.x == this.maxX) {
      this.couldResizeX = true;
    }
    // update the boolean if the dragTarget has MaxY
    if (this.dragTarget != null && this.dragTarget.y == this.maxY) {
      this.couldResizeY = true;
    }
  }

  handleMouseUp(e) {
    //update position change in DB
    if(this.dragTarget != null){
      this.updatePos(this.dragTarget.personId, this.dragTarget.x, this.dragTarget.y);
    }
    this.dragTarget = null;
    this.isDown = false;
  }

  handleMouseOut(e) {
    this.handleMouseUp(e);
  }

  handleMouseMove(e) {
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
    //this.draw();
    this.newDraw();
  }

  //update elements position in DB on MouseUp
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
        //reload the canvas if user wants more space
        if (PositionX > this.maxX || PositionY > this.maxY){
          this.reload();
        }
        //reload the canvas if user needs less space in X
        if (((PositionX + this.boxWidth) < this.maxX) && this.couldResizeX){ 
          this.reload();
        }
        //reload the canvas if user needs less space in Y
        if (((PositionY + (1.5*this.boxHeight)) < this.maxY) && this.couldResizeY){ 
          this.reload();
        }
      });
  }
}

import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

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
  startX : number;
  startY : number;
  mouseX : number;
  mouseY : number;

  people : Person [];
  relationships : Relationship [];
  parentchilds : ParentChild [];
  isLoaded : boolean;

  constructor(
    private personService: PersonService,
    private relationshipService: RelationshipService,
    private parentchildService: ParentchildService
  ) { }

  ngOnInit() : void {
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
  //get the starting point for boxes of a specified generation
  getStartPosition(boxLength: number, boxDistance: number, gen: number){
    //-4 because of canvas element borders
    var canvasWidth = (this.canvas.nativeElement.getBoundingClientRect().width) - 4;
    var countGen = this.people.filter(item => item.Generation == gen).length;
    var startBox = (canvasWidth/2) - (boxLength/2);

    for (var i = 1; i < countGen; i++) {
      startBox-= (boxDistance/2) + (boxLength)/2 ;
    }
    return startBox;
  }

  init() {
    //Set up the initial offset
    this.offsetX = this.canvas.nativeElement.getBoundingClientRect().left;
    this.offsetY = this.canvas.nativeElement.getBoundingClientRect().top;
    
    this.boxes = [];
    var j = 0;
    var k = 0;
    var gen = this.people[0].Generation;
    var startBox = this.getStartPosition(100, 20, gen)

    for (var i =0; i < this.people.length; i++) {
      var val = this.people[i].PersonId;
      if (this.people[i].Generation == gen){
        this.boxes.push({
        x: startBox + k, y: 25 + j, w: 100, h:50, personId: val
        });
        k+= 120;
      }
      else {
        gen = this.people[i].Generation;
        startBox = this.getStartPosition(100, 20, gen)
        k = 0;
        this.boxes.push({
          x: startBox + k , y: 95 + j, w: 100, h:50, personId: val
          });
          k+= 120;
          j+= 70;
      }
      
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

    this.draw();
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
      this.ctx.font = "12px Arial";
      this.ctx.fillText(this.people[i].FirstName + " " + this.people[i].LastName, 
      box.x + 5, box.y + 18);
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
    return false;
  }

  handleMouseClick(e) {
    this.startX = +e.clientX - this.offsetX;
    this.startY = +e.clientY - this.offsetY;
    if (this.hit(this.startX, this.startY)){
      console.log("clicked");
    }  
  }

  handleMouseDown(e) {

    // need to update the offset if the user did scroll
    this.offsetX = this.canvas.nativeElement.getBoundingClientRect().left;
    this.offsetY = this.canvas.nativeElement.getBoundingClientRect().top;

    this.startX = +e.clientX - this.offsetX;
    this.startY = +e.clientY - this.offsetY;

    this.isDown = this.hit(this.startX, this.startY);
  }

  handleMouseUp(e) {
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
    this.draw();
  }

}

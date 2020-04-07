import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Person } from '../person';
import { PersonService } from '../person.service';

import { Relationship } from '../relationship';
import { RelationshipService } from '../relationship.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  @ViewChild('canvas', { static: true})
  canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;
  offsetX: number;
  offsetY: number;
  isDown: boolean;
  dragTarget: any;
  boxes: Array<any>;
  connectors: Array<any>;
  startX : number;
  startY : number;
  mouseX : number;
  mouseY : number;

  people : Person [];
  relationships : Relationship [];

  constructor(
    private personService: PersonService,
    private relationshipService: RelationshipService,
  ) { }

  ngOnInit() : void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.getAllFromTree();
  }

  getAllFromTree(){
    let TreeId = +localStorage.getItem("TreeId")
    //the + allows to cast localStorage string into number
    this.personService.getPersonsByTree(TreeId)
      .subscribe(people => {
        this.people = people;
        this.getAllRel();
      });
  }

  getAllRel(){
    this.relationshipService.getAll()
      .subscribe(relationships => {
        this.relationships = relationships;
        this.init();
      });

  }

  init() {
    this.offsetX = this.getElementOffset(this.canvas.nativeElement).left;
    this.offsetY = this.getElementOffset(this.canvas.nativeElement).top;
    this.boxes = [];
    
    var j = 0;
    for (var i =0; i < this.people.length; i++) {
      var val = this.people[i].PersonId;
      this.boxes.push({
      x: 100, y: 25 + j, w: 100, h:50, personId: val
      });
      j+= 70;
    }

    this.connectors = [];
    
    for (var i =0; i < this.relationships.length; i++) {
      var val1 = this.relationships[i].Person1Id;
      var val2 = this.relationships[i].Person2Id;
      this.connectors.push({
        person1Id : val1, person2Id : val2
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
    
    for (var i = 0; i < this.connectors.length; i++) {
      for (var j = 0; j < this.boxes.length; j++) {
      
      if (this.connectors[i].person1Id == this.boxes[j].personId)
        {
          var box1 = this.boxes[j];
        }
      if (this.connectors[i].person2Id == this.boxes[j].personId)
        {
          var box2 = this.boxes[j];
        }

      } 

      this.ctx.globalCompositeOperation = "destination-over";
      this.ctx.strokeStyle = "LightBlue";
      this.ctx.beginPath();
      this.ctx.moveTo(box1.x + box1.w / 2, box1.y + box1.h / 2)
      this.ctx.lineTo(box2.x + box2.w / 2, box2.y + box2.h / 2)
      this.ctx.stroke();
      //getting back to drawing on top of the rest
      this.ctx.globalCompositeOperation = "source-over";

    }

    //for (var i = 0; i < this.connectors.length; i++) {
      //var connector = this.connectors[i];
      //var box1 = this.boxes[this.connectors[i]];
      //var box2 = this.boxes[this.connectors[i+1]];
      //the lines should stay under the text
      //this.ctx.globalCompositeOperation = "destination-over";
      //this.ctx.strokeStyle = "LightBlue";
      //this.ctx.beginPath();
      //this.ctx.moveTo(box1.x + box1.w / 2, box1.y + box1.h / 2)
      //this.ctx.lineTo(box2.x + box2.w / 2, box2.y + box2.h / 2)
      //this.ctx.stroke();
      //getting back to drawing on top of the rest
      //this.ctx.globalCompositeOperation = "source-over";
    //}
  }

  getElementOffset(element) {
    var de = document.documentElement;
    var box = element.getBoundingClientRect();
    var top = box.left + window.pageXOffset - de.clientTop;
    var left = box.left + window.pageXOffset - de.clientLeft;
    return { top: top, left: left};
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

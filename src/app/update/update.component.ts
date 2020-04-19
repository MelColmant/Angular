import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router'

import { Person } from '../person';
import { PersonService } from '../person.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {

  treeId : number;
  personId : number;
  person : Person;
  isLoaded: boolean;
  birthDate: Date;
  deathDate: Date;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personService: PersonService,
  ) { }

  ngOnInit(): void {
    this.isLoaded = false;
    this.route.paramMap.subscribe(params => {
      this.treeId = +params.get('treeId');
      this.personId = +params.get('personId');
      this.getPersonFromId(this.personId);
      });
  }

  getPersonFromId(personId: number){
    this.personService.getPerson(personId)
      .subscribe(person => {
        this.person = person;
        this.birthDate = this.person.BirthDate;
        this.deathDate = this.person.DeathDate;
        this.isLoaded = true;
      });
  }

  backToTree(){
    this.router.navigate(['/tree/'+ this.treeId]);
  }

  update(){
    let PersonId = this.person.PersonId
    let FirstName = this.person.FirstName;
    let LastName = this.person.LastName;
    let Gender = this.person.Gender;
    let BirthDate = this.birthDate;
    let DeathDate = this.deathDate;
    let TreeId = this.person.TreeId;
    let Generation = this.person.Generation;
    let PositionX = this.person.PositionX;
    let PositionY = this.person.PositionY;

    this.personService.updatePerson({ PersonId, FirstName, LastName, Gender,
      BirthDate, DeathDate, TreeId, Generation, PositionX, PositionY } as Person)
      .subscribe(() => this.backToTree());
  }

}

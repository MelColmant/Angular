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
    var PersonId = this.person.PersonId
    var FirstName = this.person.FirstName;
    var LastName = this.person.LastName;
    var Gender = this.person.Gender;
    var BirthDate = this.birthDate;
    var DeathDate = this.deathDate;
    var TreeId = this.person.TreeId;
    var Generation = this.person.Generation;

    this.personService.updatePerson({ PersonId, FirstName, LastName, Gender,
      BirthDate, DeathDate, TreeId, Generation } as Person)
      .subscribe(() => this.backToTree());
  }

}

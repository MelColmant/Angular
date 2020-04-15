import { Component, OnInit, Input } from '@angular/core';

import { Person } from '../person';
import { PersonService } from '../person.service';

import { Tree } from '../tree';

@Component({
  selector: 'app-delete-person',
  templateUrl: './delete-person.component.html',
  styleUrls: ['./delete-person.component.css']
})
export class DeletePersonComponent implements OnInit {

  @Input() tree: Tree;
  people: Person[];
  isLoaded: boolean;

  constructor(
    private personService: PersonService,
  ) { }

  ngOnInit(): void {
    this.isLoaded = false;
    this.getAllFromTree();
  }

  getAllFromTree(){
    let TreeId = this.tree.TreeId;
    this.personService.getPersonsByTree(TreeId)
      .subscribe(people => {
        this.people = people;
        this.isLoaded = true;
      });
  }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Person } from './person'; 

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private personUrl = 'http://localhost:57102/API/Person';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient
  ) { }

  getPersonsByTree(id: number): Observable<Person[]> {
    const treeId = id;
    const url = `${this.personUrl}/AllTree/${treeId}`;
    return this.http.get<Person[]>(url)
  }

  getPerson(id: number): Observable<Person> {
    const personId = id;
    const url = `${this.personUrl}/${personId}`;
    return this.http.get<Person>(url)
  }

  addPerson(person: Person): Observable<number> {
    const url = `${this.personUrl}WithId`;
    return this.http.post<number>(url, person, this.httpOptions)
  }

  deletePerson(id: number): Observable<any> {
    const personId = id;
    const url = `${this.personUrl}/${personId}`;
    return this.http.delete<any>(url, this.httpOptions)
  }

  updatePerson(person: Person): Observable<any> {
    const personId = person.PersonId;
    const url = `${this.personUrl}/${personId}`;
    return this.http.put<any>(url, person, this.httpOptions)
  }

  getParents(personId: number): Observable<Person[]> {
    const url = `${this.personUrl}/Parents/${personId}`;
    return this.http.get<Person[]>(url)
  }
}

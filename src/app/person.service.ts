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
}

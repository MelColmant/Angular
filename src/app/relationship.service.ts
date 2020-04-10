import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Relationship } from './relationship'; 

@Injectable({
  providedIn: 'root'
})
export class RelationshipService {

  private relationshipUrl = 'http://localhost:57102/API/Relationship';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient
  ) { }

  getAllByTree(id : number): Observable<Relationship[]> {
    const treeId = id;
    const url = `${this.relationshipUrl}/FromTree/${treeId}`;
    return this.http.get<Relationship[]>(url)
  }

  addRelationship(relationship: Relationship): Observable<number> {
    return this.http.post<number>(this.relationshipUrl, relationship, this.httpOptions)
  }
}

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

  getAll(): Observable<Relationship[]> {
    return this.http.get<Relationship[]>(this.relationshipUrl)
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { ParentChild } from './parentchild'; 

@Injectable({
  providedIn: 'root'
})
export class ParentchildService {

  private parentchildUrl = 'http://localhost:57102/API/ParentChild';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient
  ) { }

  getAllByTree(id : number): Observable<ParentChild[]> {
    const treeId = id;
    const url = `${this.parentchildUrl}/FromTree/${treeId}`;
    return this.http.get<ParentChild[]>(url)
  }
}

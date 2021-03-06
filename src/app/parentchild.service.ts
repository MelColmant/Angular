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

  addParentChild(parentchild: ParentChild): Observable<number> {
    return this.http.post<number>(this.parentchildUrl, parentchild, this.httpOptions)
  }

  deleteParentChildId(id: number): Observable<any> {
    const personId = id;
    const url = `${this.parentchildUrl}Id/${personId}`;
    return this.http.delete<any>(url, this.httpOptions)
  }
}

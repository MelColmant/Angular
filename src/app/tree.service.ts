import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Tree } from './tree'; 

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  private treeUrl = 'http://localhost:57102/API/Tree';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient
  ) { }

  addTree(tree: Tree): Observable<number> {
    const url = `${this.treeUrl}WithId`;
    return this.http.post<number>(url, tree, this.httpOptions)
  }
}

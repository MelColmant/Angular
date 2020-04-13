import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Tree } from './tree'; 

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  private treeUrl = 'http://localhost:57102/API/Tree';

  private token = localStorage.getItem('JWTToken')

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 
    'Authorization': 'Bearer ' + this.token})
  };

  constructor(
    private http: HttpClient
  ) { }

  addTree(tree: Tree): Observable<number> {
    const url = `${this.treeUrl}WithId`;
    return this.http.post<number>(url, tree, this.httpOptions)
  }

  getTrees(): Observable<Tree []> {
    return this.http.get<Tree []>(this.treeUrl)
  }

  getTree(treeId: number): Observable<Tree> {
    const url = `${this.treeUrl}/${treeId}`;
    return this.http.get<Tree>(url)
  }
}

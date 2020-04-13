import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { User } from './user'; 

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userUrl = 'http://localhost:57102/API/User';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient
  ) { }

  deleteUser(id : number) : Observable<User> {
    const userId = id;
    const url =  `${this.userUrl}/${userId}`;

    return this.http.delete<User>(url)
  }

  addUser(user: User): Observable<boolean> {
    return this.http.post<boolean>(this.userUrl, user, this.httpOptions)
  }

  checkUser(user: User): Observable<User> {
    const url = `${this.userUrl}/check`;
    return this.http.post<User>(url, user, this.httpOptions)
  }

  checkUser2(user: User): Observable<string> {
    const url = 'http://localhost:57102/API/login';
    return this.http.post<string>(url, user, this.httpOptions)
  }


}

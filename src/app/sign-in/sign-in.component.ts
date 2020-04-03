import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { UserService } from '../user.service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  //users: User[];
  radioData: boolean;
  
  constructor(
    private userService: UserService,
    private router: Router
  ) { }
    
  ngOnInit(): void {
    this.radioData = false;
  }

  delete(id: number): void {
    this.userService.deleteUser(id)
    .subscribe();
  }

  add(userName : string, password : string, isAdmin : boolean){
    this.userService.addUser({ userName, password, isAdmin } as User )
      .subscribe();
    this.router.navigate(['/login'])
  }

}

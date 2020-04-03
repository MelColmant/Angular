import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../user';
import { Router } from '@angular/router'

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  check(userName : string, password : string){
    this.userService.checkUser({ userName, password } as User)
      .subscribe(result => {
        if (result !== 0)
        {
          this.router.navigate([''])
        } 
      });
  }
}

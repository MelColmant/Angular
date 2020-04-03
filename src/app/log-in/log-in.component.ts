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
  isRegistered : boolean;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isRegistered = true;
  }

  check(UserName : string, Password : string){
    this.userService.checkUser({ UserName, Password } as User)
      .subscribe(user => {
        if (user.UserId != 0)
        {
          localStorage.setItem('UserId', user.UserId.toString())
          localStorage.setItem('UserName', user.UserName);
          if (user.IsAdmin)
          {
            localStorage.setItem('IsAdmin', 'true');
          }
          else 
          {
            localStorage.setItem('IsAdmin', 'false');
          }
        }
        else 
        {
          this.isRegistered = false;
        }
      });
  }

}

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
  alreadyExist : boolean;
  radioData: boolean;
  
  constructor(
    private userService: UserService,
    private router: Router
  ) { }
    
  ngOnInit(): void {
    this.alreadyExist = false;
    this.radioData = false;
  }

  add(UserName : string, Password : string, IsAdmin : boolean){
    this.userService.addUser({ UserName, Password, IsAdmin } as User )
      .subscribe(res => {
        if (!res)
        {
          this.alreadyExist = true;
        }
        else 
        {
          this.router.navigate(['/login'])
        }
      });
  }

  loginPage(){
    this.router.navigate(['/login']);
  }

}

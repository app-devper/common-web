import {Component, OnInit} from '@angular/core';

import {User} from '@app/_models';
import {AccountService, AlertService} from '@app/_services';
import {first} from 'rxjs/operators';

@Component({templateUrl: 'home.component.html'})
export class HomeComponent implements OnInit {
  user: User;

  constructor(
    private accountService: AccountService,
    private alertService: AlertService
  ) {
    this.accountService.user.subscribe(x => this.user = x);
  }

  ngOnInit() {
    this.accountService.getInfo()
      .pipe(first())
      .subscribe(user => this.user = user, error => {
        this.alertService.error(error);
      });
  }
}

import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '@environments/environment';
import {User} from '@app/_models';
import {Login} from '@app/_models/login';

@Injectable({providedIn: 'root'})
export class AccountService {
  private userSubject: BehaviorSubject<User>;
  private tokenSubject: BehaviorSubject<Login>;
  public user: Observable<User>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.tokenSubject = new BehaviorSubject<Login>(null);
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  public get tokenValue(): Login {
    return this.tokenSubject.value;
  }

  login(username, password) {
    return this.http.post<Login>(`${environment.apiUrl}api/v1/auth/login`, {username, password})
      .pipe(map(token => {
        this.tokenSubject.next(token);
      }));
  }

  logout() {
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  register(user: User) {
    return this.http.post(`${environment.apiUrl}api/v1/auth/sign-up`, user);
  }

  getInfo() {
    return this.http.get<User>(`${environment.apiUrl}api/v1/user/info`).pipe(map(user => {
      localStorage.setItem('user', JSON.stringify(user));
      this.userSubject.next(user);
      return user
    }));
  }

  addUser(user: User) {
    return this.http.post(`${environment.apiUrl}api/v1/user`, user);
  }

  getAll() {
    return this.http.get<User[]>(`${environment.apiUrl}api/v1/user`);
  }

  getById(id: string) {
    return this.http.get<User>(`${environment.apiUrl}api/v1/user/${id}`);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}api/v1/user/${id}`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        if (id == this.userValue.id) {
          // update local storage
          const user = {...this.userValue, ...params};
          localStorage.setItem('user', JSON.stringify(user));

          // publish updated user to subscribers
          this.userSubject.next(user);
        }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}api/v1/user/${id}`)
      .pipe(map(x => {
        // auto logout if the logged in user deleted their own record
        if (id == this.userValue.id) {
          this.logout();
        }
        return x;
      }));
  }
}

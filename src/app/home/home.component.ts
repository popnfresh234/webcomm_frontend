import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { News } from '../models/news';
import { UserService as UserService } from '../services/user/user.service';
import { NewsService } from '../services/news/news.service';
import { CommonModule } from '@angular/common';
import { catchError, Observable, of } from 'rxjs';
import { ErrorResponse } from '../models/error-response';
@Component({
  selector: 'app-home',
  standalone: true,
  imports:
    [
      CommonModule,
      RouterModule,
    ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  newsArray: News[] = [];
  httpSerivce: UserService = inject(UserService);
  newsService: NewsService = inject(NewsService);
  error: String = '';


  constructor() {
    this.getAllNewss();
  }

  getAllNewss() {
    this.newsService.getAllNews()
      .pipe(catchError((errorResponse: ErrorResponse): Observable<any> => {
        console.log(errorResponse);
        this.error = errorResponse.error.message;
        return of();
      }))
      .subscribe((newsArray) => {
        this.error = '';
        this.newsArray = newsArray;
      })
  }
}

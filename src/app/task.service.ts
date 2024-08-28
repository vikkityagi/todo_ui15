import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  baseUrl: string = 'http://localhost:8080/api/v1';

  constructor(private httpClient: HttpClient) { }

  createTasks(formValue: any): Observable<any[]>{
    return this.httpClient.post<any>(`${this.baseUrl}/add_task`,formValue);
  }

  getTasks(): Observable<any[]>{
    return this.httpClient.get<any>(`${this.baseUrl}/add_tasks`);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Observable, tap, map } from 'rxjs';
import { TaskService } from '../task.service';

declare var $: any;
@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit{

  todoFormGroup: FormGroup;
  taskList: any[] = [
    { id: 1, name: 'English Practice' },
    { id: 2, name: 'Exercise' },
    { id: 3, name: 'Learn new Skill' },
    { id: 4, name: 'Start Business' },
    { id: 5, name: 'Read a book' }
  ];
  alertMessage: any;
  tasks$!: Observable<any[]>; // Observable for tasks
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalTasks: number = 0;
  selectedTask: any;

  constructor(private _fb: FormBuilder, private taskService: TaskService) {
    this.todoFormGroup = this._fb.group({
      tasks: this._fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.addTask();

    
  }

  get tasks() {
    return this.todoFormGroup.get('tasks') as FormArray;
  }

  loadTasks() {
    this.tasks$ = this.taskService.getTasks().pipe(
      tap(tasks => {
        this.totalTasks = tasks.length; // Update total tasks
      }),
      map(tasks => this.paginateTasks(tasks))
    );
  }

  paginateTasks(tasks: any[]): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return tasks.slice(start, end);
  }

  totalPagesArray() {
    return Array(Math.ceil(this.totalTasks / this.itemsPerPage)).fill(0).map((_, i) => i + 1);
  }

  setPage(page: number) {
    this.currentPage = page;
    this.loadTasks(); // Reload tasks with new page
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTasks(); // Reload tasks with new page
    }
  }

  nextPage() {
    if (this.currentPage < Math.ceil(this.totalTasks / this.itemsPerPage)) {
      this.currentPage++;
      this.loadTasks(); // Reload tasks with new page
    }
  }

  addTask() {
    if (this.tasks.length < 5) {
      const task = this._fb.group({
        task_id: [, [Validators.required]],
        progress: [, [Validators.required]],
        date: [, [Validators.required]],
        start_time: [{ value: '', disabled: true }, [Validators.required]],
        end_time: [{ value: '', disabled: true }, [Validators.required]]
      });

      task.get('start_time')?.valueChanges.subscribe(data => {
        if (data) {
          task.get('end_time')?.enable();
        } else {
          task.get('end_time')?.disable();
        }
      });

      this.tasks.push(task);
    }
  }

  openModal() {
    $('#myModal').modal('show');
  }

  closeModal() {
    $('#myModal').modal('hide');
  }

  openReport(task: any) {
    this.selectedTask = task;
    $('#myReport').modal('show');
  }

  closeReport() {
    $('#myReport').modal('hide');
  }

  // onProgress(event: any) {
  //   const task = this.tasks.at(this.tasks.length - 1) as FormGroup;
  //   if (task.get('progress')?.value != 2) {
  //     task.get('start_time')?.setValidators([Validators.required]);
  //     task.get('end_time')?.setValidators([Validators.required]);
  //     task.get('start_time')?.enable();
  //   } else {
  //     task.get('start_time')?.clearValidators();
  //     task.get('end_time')?.clearValidators();
  //     task.get('start_time')?.disable();
  //   }
  //   task.get('start_time')?.updateValueAndValidity();
  //   task.get('end_time')?.updateValueAndValidity();
  // }

  onProgress(event: any) {
    const task = this.tasks.at(this.tasks.length - 1) as FormGroup;
    const progress = task.get('progress')?.value;

    if (progress == 2) {
      // When progress is 2, start_time and end_time should not be required
      task.get('start_time')?.clearValidators();
      task.get('end_time')?.clearValidators();
      task.get('start_time')?.disable();
    } else {
      // When progress is not 2, start_time and end_time should be required
      task.get('start_time')?.enable();
      task.get('start_time')?.setValidators([Validators.required]);
      task.get('end_time')?.setValidators([Validators.required]);
    }

    // Update the form validation status
    task.get('start_time')?.updateValueAndValidity();
    task.get('end_time')?.updateValueAndValidity();
  }


  removeTask(index: number) {
    this.tasks.removeAt(index);
  }

  onSubmit() {
    if (this.todoFormGroup.valid) {
      this.taskService.createTasks(this.tasks.value).subscribe({
        next: data => {
          this.showAlert('success', 'Tasks submitted successfully!');
          this.todoFormGroup.reset();
          this.loadTasks(); // Refresh task list
        },
        error: err => {
          this.showAlert('danger', 'There was an error submitting the tasks.');
        }
      });
    } else {
      this.showAlert('warning', 'Please fill out all required fields.');
    }
  }

  showAlert(type: string, message: string) {
    this.alertMessage = { type, message };

    // Hide alert after 5 seconds
    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }

  


}



import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

interface Task {
  id: string;
  title: string;
  description: string;
  color: string;
  labels: string[];
  createdAt: Date;
  dueDate?: Date;
  assignedTo?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

interface Board {
  id: string;
  title: string;
  columns: Column[];
}

@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule]
})
export class WhiteboardComponent implements OnInit {
  // Board state
  board: Board = {
    id: 'main-board',
    title: 'Mi Tablero de Tareas',
    columns: []
  };

  // Task editing
  editingColumnId: string | null = null;
  editingColumnTitle: string = '';
  addingNewColumn: boolean = false;
  newColumnTitle: string = '';

  // Task creation/editing
  selectedColumn: Column | null = null;
  editingTask: Task | null = null;
  newTask: Task = this.createEmptyTask();
  showTaskModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';

  // Form fields for task editing
  taskTitle: string = '';
  taskDescription: string = '';
  taskDueDate: Date | null = null;
  taskAssignee: string = '';

  // Label colors
  labelColors = [
    { name: 'Verde', value: '#4CAF50' },
    { name: 'Amarillo', value: '#FFC107' },
    { name: 'Rojo', value: '#F44336' },
    { name: 'Azul', value: '#2196F3' },
    { name: 'Morado', value: '#9C27B0' },
    { name: 'Naranja', value: '#FF9800' },
  ];

  // Selected labels for new/edited task
  selectedLabels: string[] = [];

  ngOnInit() {
    // Initialize sample data
    this.initializeBoard();
  }

  initializeBoard() {
    // Add default columns
    this.board.columns = [
      {
        id: this.generateId(),
        title: 'Por hacer',
        tasks: [
          {
            id: this.generateId(),
            title: 'Planificar proyecto',
            description: 'Definir objetivos y alcance',
            color: '#ffffff',
            labels: ['#4CAF50', '#2196F3'],
            createdAt: new Date(),
            dueDate: this.getDateInFuture(7)
          },
          {
            id: this.generateId(),
            title: 'Crear bocetos',
            description: 'Diseñar la interfaz de usuario',
            color: '#ffffff',
            labels: ['#9C27B0'],
            createdAt: new Date(),
            dueDate: this.getDateInFuture(5)
          }
        ]
      },
      {
        id: this.generateId(),
        title: 'En progreso',
        tasks: [
          {
            id: this.generateId(),
            title: 'Implementar autenticación',
            description: 'Integrar sistema de login',
            color: '#ffffff',
            labels: ['#F44336'],
            createdAt: new Date(),
            dueDate: this.getDateInFuture(2),
            assignedTo: 'María'
          }
        ]
      },
      {
        id: this.generateId(),
        title: 'Finalizado',
        tasks: [
          {
            id: this.generateId(),
            title: 'Configurar entorno',
            description: 'Instalar dependencias',
            color: '#ffffff',
            labels: ['#4CAF50'],
            createdAt: new Date(Date.now() - 86400000 * 3),
            assignedTo: 'Carlos'
          }
        ]
      }
    ];
  }

  // Create a new column
  addColumn() {
    if (this.newColumnTitle.trim() === '') {
      return;
    }

    const newColumn: Column = {
      id: this.generateId(),
      title: this.newColumnTitle.trim(),
      tasks: []
    };

    this.board.columns.push(newColumn);
    this.addingNewColumn = false;
    this.newColumnTitle = '';
  }

  // Begin editing a column title
  startEditingColumn(column: Column) {
    this.editingColumnId = column.id;
    this.editingColumnTitle = column.title;
  }

  // Save column title changes
  saveColumnTitle(column: Column) {
    if (this.editingColumnTitle.trim() !== '') {
      column.title = this.editingColumnTitle.trim();
    }
    this.editingColumnId = null;
  }

  // Cancel column title edit
  cancelColumnEdit() {
    this.editingColumnId = null;
  }

  // Delete a column and its tasks
  deleteColumn(columnId: string) {
    if (confirm('¿Estás seguro de querer eliminar esta columna y todas sus tareas?')) {
      const columnIndex = this.board.columns.findIndex(col => col.id === columnId);
      if (columnIndex !== -1) {
        this.board.columns.splice(columnIndex, 1);
      }
    }
  }

  // Open modal to add a new task to a column
  openAddTaskModal(column: Column) {
    this.selectedColumn = column;
    this.newTask = this.createEmptyTask();
    this.selectedLabels = [];
    this.showTaskModal = true;
    this.modalMode = 'create';

    // Initialize the form fields
    this.taskTitle = '';
    this.taskDescription = '';
    this.taskDueDate = null;
    this.taskAssignee = '';
  }

  // Open modal to edit an existing task
  openEditTaskModal(task: Task, column: Column) {
    this.selectedColumn = column;
    this.editingTask = { ...task };
    this.selectedLabels = [...task.labels];
    this.showTaskModal = true;
    this.modalMode = 'edit';

    // Set the form fields with the task values
    this.taskTitle = task.title;
    this.taskDescription = task.description;
    this.taskDueDate = task.dueDate || null;
    this.taskAssignee = task.assignedTo || '';
  }

  // Close task modal
  closeTaskModal() {
    this.showTaskModal = false;
    this.selectedColumn = null;
    this.editingTask = null;
  }

  // Save a new task
  saveNewTask() {
    if (!this.selectedColumn || this.taskTitle.trim() === '') {
      return;
    }

    const taskToAdd: Task = {
      ...this.newTask,
      id: this.generateId(),
      title: this.taskTitle.trim(),
      description: this.taskDescription,
      dueDate: this.taskDueDate || undefined,
      assignedTo: this.taskAssignee || undefined,
      labels: [...this.selectedLabels],
      createdAt: new Date()
    };

    this.selectedColumn.tasks.push(taskToAdd);
    this.closeTaskModal();
  }

  // Save changes to an existing task
  saveTaskChanges() {
    if (!this.selectedColumn || !this.editingTask || this.taskTitle.trim() === '') {
      return;
    }

    const taskIndex = this.selectedColumn.tasks.findIndex(task => task.id === this.editingTask!.id);
    if (taskIndex !== -1) {
      this.selectedColumn.tasks[taskIndex] = {
        ...this.editingTask,
        title: this.taskTitle.trim(),
        description: this.taskDescription,
        dueDate: this.taskDueDate || undefined,
        assignedTo: this.taskAssignee || undefined,
        labels: [...this.selectedLabels]
      };
    }

    this.closeTaskModal();
  }

  // Delete a task
  deleteTask(taskId: string, column: Column) {
    if (confirm('¿Estás seguro de querer eliminar esta tarea?')) {
      const taskIndex = column.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        column.tasks.splice(taskIndex, 1);
      }
      this.closeTaskModal();
    }
  }

  // Toggle selection of a label
  toggleLabel(color: string) {
    const index = this.selectedLabels.indexOf(color);
    if (index === -1) {
      this.selectedLabels.push(color);
    } else {
      this.selectedLabels.splice(index, 1);
    }
  }

  // Check if a label is selected
  isLabelSelected(color: string): boolean {
    return this.selectedLabels.includes(color);
  }

  // Handle drag and drop between columns
  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // Reordering within the same column
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Moving to another column
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  // Create an empty task object
  private createEmptyTask(): Task {
    return {
      id: '',
      title: '',
      description: '',
      color: '#ffffff',
      labels: [],
      createdAt: new Date(),
    };
  }

  // Generate a unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Get a date in the future (for due dates)
  private getDateInFuture(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  // Format date for display
  formatDate(date: Date): string {
    if (!date) return '';
    return date.toLocaleDateString();
  }

  // Check if a task is overdue
  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
  }

  // Check if a task is due soon (in next 2 days)
  isDueSoon(task: Task): boolean {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= twoDaysFromNow;
  }
}

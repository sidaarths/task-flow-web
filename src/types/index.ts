// Core entity interfaces
export interface List {
  _id: string;
  title: string;
  boardId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  listId: string;
  createdBy: string;
  assignedTo: string[];
  labels: string[];
  dueDate?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  _id: string;
  title: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Composite interfaces
export interface BoardWithListsAndTasks {
  board: Board;
  lists: List[];
  tasks: Task[];
}

// Request interfaces
export interface CreateBoardRequest {
  title: string;
  description: string;
}

export interface UpdateBoardRequest {
  title?: string;
  description?: string;
}

export interface CreateListRequest {
  title: string;
}

export interface UpdateListRequest {
  title: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  labels?: string[];
  dueDate?: string;
}

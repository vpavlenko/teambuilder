export interface User {
  id: string;
  name: string;
  description: string;
  celebratedProjects: string[]; // Array of project IDs where celebration was shown
}

export interface Project {
  id: string;
  authorId: string;
  title: string;
  description: string;
  createdAt: number;
  applications: string[]; // array of user IDs who applied
  acceptedUsers: string[]; // array of accepted user IDs
  rejectedUsers: string[]; // array of rejected user IDs
}

// src/types/index.ts

// Define your interfaces or types here

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
}

// Export additional interfaces or types as needed
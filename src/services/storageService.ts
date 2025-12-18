/**
 * Local Storage Service for User Data
 * 
 * This service handles persistent storage of user data
 * using localStorage as a simple database replacement.
 */

import { User } from './authService';

export interface StoredUser extends User {
  password: string; // Hashed password
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  USERS: 'edufleet_users',
  CURRENT_USER: 'edufleet_current_user',
  SESSION_TOKEN: 'edufleet_session_token',
};

export const storageService = {
  /**
   * Get all users
   */
  getUsers(): StoredUser[] {
    try {
      const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  },

  /**
   * Save users
   */
  saveUsers(users: StoredUser[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  },

  /**
   * Find user by email
   */
  findUserByEmail(email: string): StoredUser | null {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  /**
   * Find user by ID
   */
  findUserById(id: string): StoredUser | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  },

  /**
   * Create new user
   */
  createUser(userData: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt'>): StoredUser {
    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    const newUser: StoredUser = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    
    return newUser;
  },

  /**
   * Update user
   */
  updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      return null;
    }

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveUsers(users);
    return users[index];
  },

  /**
   * Delete user
   */
  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== id);

    if (filteredUsers.length === users.length) {
      return false; // User not found
    }

    this.saveUsers(filteredUsers);
    return true;
  },

  /**
   * Set current user session
   */
  setCurrentUser(user: User, token: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
  },

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    try {
      const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  /**
   * Get session token
   */
  getSessionToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  },

  /**
   * Clear session
   */
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
  },

  /**
   * Hash password (simple implementation - use bcrypt in production)
   */
  hashPassword(password: string): string {
    // Simple hash for demo - use proper bcrypt in production
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash).toString(36)}`;
  },

  /**
   * Verify password
   */
  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  },
};

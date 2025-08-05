import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SelectedRoleService {
  private selectedRole: string | null = null;

  setRole(role: string) {
    this.selectedRole = role;
    localStorage.setItem('selectedRole', role);
  }

  getRole(): string | null {
    return this.selectedRole || localStorage.getItem('selectedRole');
  }

  clearRole() {
    this.selectedRole = null;
    localStorage.removeItem('selectedRole');
  }
}
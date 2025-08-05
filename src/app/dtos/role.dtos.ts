// src/app/dtos/role.dtos.ts

// Backend'deki RoleModel'e karşılık gelen DTO
export interface RoleDto {
  id: number;
  name: string;
}

// Yeni rol oluşturmak için kullanılacak DTO
export interface RoleCreateDto {
  name: string;
}

// Rol güncellemek için kullanılacak DTO
export interface RoleUpdateDto {
  id: number; // Güncellenecek rolün ID'si
  name: string; // Yeni rol adı
}

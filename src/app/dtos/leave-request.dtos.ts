export interface LeaveRequestResponseDto {
  id: number;
  leaveTypeId: number;
  leaveTypeName: string;
  leaveStatusId: number;
  leaveStatusName: string;
  startDate: string;    // ISO string formatında tarih
  endDate: string;      // ISO string formatında tarih
  reason: string;
  userId: number;
  userName: string;
  approvedById: number | null;
  approvedByName: string | null;
  createdAt: string;    // ISO string formatında tarih
}

export interface LeaveRequestCreateDto {
  typeId: number;
  statusId: number;
  startDate: Date | string;
  endDate: Date | string;
  reason: string;
  userId: number;
  approvedById: number | null;
}

export interface LeaveRequestDetailDto {
    id: number;
    userId: number;
    userName: string;
    type: string; // Type ID yerine adını göstereceğiz
    status: string; // Status ID yerine adını göstereceğiz
    startDate: Date;
    endDate: Date;
    reason: string;
    approvedBy?: string; // Onaylayan kişinin adı
}

export const LEAVE_TYPES = [
  { id: 1, name: 'Yıllık İzin' },
  { id: 2, name: 'Hastalık İzni' },
  { id: 3, name: 'Ücretsiz İzin' },
  { id: 4, name: 'Doğum İzni' },
  { id: 5, name: 'Diğer' },
];

export const LEAVE_STATUSES = [
  { id: 1, name: 'Onay Bekliyor' },
  { id: 2, name: 'Onaylandı' },
  { id: 3, name: 'Reddedildi' },
];


// src/app/components/confirm-dialog/confirm-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog'; // MatDialogModule import edildi

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule // MatDialogModule import edildi
  ],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.scss']
})
export class ConfirmDialogComponent {
  constructor(
    // MatDialogRef: Dialogu kapatmak için kullanılır.
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    // MAT_DIALOG_DATA: Dialoga dışarıdan veri aktarmak için kullanılır (örn. başlık, mesaj).
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  /**
   * Onayla butonuna tıklandığında dialogu kapatır ve 'true' değeri döndürür.
   */
  onConfirm(): void {
    this.dialogRef.close(true); // Onaylandı
  }

  /**
   * İptal butonuna tıklandığında dialogu kapatır ve 'false' değeri döndürür.
   */
  onCancel(): void {
    this.dialogRef.close(false); // İptal edildi
  }
}

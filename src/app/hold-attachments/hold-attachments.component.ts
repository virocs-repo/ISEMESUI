import { Component } from '@angular/core';

@Component({
  selector: 'app-hold-attachments',
  templateUrl: './hold-attachments.component.html',
  styleUrls: ['./hold-attachments.component.scss']
})
export class HoldAttachmentsComponent{
  uploadedFiles: any[] = [];
  selectedFile: File | null = null;

  // Capture selected file but do not upload immediately
  onFileSelect(event: any): void {
    this.selectedFile = event.files[0].rawFile;
  }

  // Attach file details to the grid
  attachFile(): void {
    if (this.selectedFile) {
      const newFile = {
        fileName: this.selectedFile.name,
        attachedBy: 'Current User',
        attachedOn: new Date().toLocaleDateString()
      };
      this.uploadedFiles.push(newFile);
      this.selectedFile = null;
    } else {
      alert("Please select a file before attaching.");
    }
  }

  deleteFile(file: any): void {
    this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
  }

  viewFile(file: any): void {
    alert('Viewing file: ' + file.fileName);
  }
  saveAttachments(): void {
    alert('Saving attachments: ' + JSON.stringify(this.uploadedFiles));
  }

  cancelAttachments(): void {
    this.uploadedFiles = [];
  }
}
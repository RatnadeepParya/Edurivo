# Firebase Storage Architecture

## Storage Buckets & Directory Structure

```
gs://<bucket-name>/
├── photos/
│   ├── students/{studentId}/profile.jpg
│   └── teachers/{teacherId}/profile.jpg
├── documents/
│   ├── admissions/{studentId}/birth_certificate.pdf
│   └── faculty/{teacherId}/degree.pdf
├── homework/
│   └── {homeworkId}/assignment_prompt.pdf
├── receipts/
│   └── {year}/{receiptNumber}.pdf
└── exports/
    └── reports/{timestamp}_report.csv
```

## Upload Validation & Constraints
- **Images**: Max 5 MB. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- **Documents**: Max 15 MB. Allowed MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.*`.
- Arbitrary executable uploads (`.exe`, `.sh`, `.bat`, `.js`) are strictly rejected.
- Signed URLs are generated with short-lived expiration for private records or long-lived CDN tokens for public student ID photos.

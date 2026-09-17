# RESTful API Reference (v1)

All API endpoints are prefixed with `/api/v1`. Requests and responses are JSON encoded.

## Base URL
`http://localhost:3000/api/v1` or `https://school.edurivo.edu/api/v1`

## Standard Response Envelope
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "meta": null
}
```

## Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | ERROR",
    "message": "Detailed error explanation",
    "fields": {}
  }
}
```

## Endpoints

### Authentication
- `POST /api/v1/auth/login`
  - Body: `{ "email": "admin@edurivo.edu", "password": "..." }`
  - Returns: `{ "token": "...", "user": { ... } }`

### Students
- `GET /api/v1/students`
  - Query: `?classId=...&sectionId=...&q=...`
- `GET /api/v1/students/:id`
- `POST /api/v1/students`
  - Body: `{ "firstName": "...", "lastName": "...", "dateOfBirth": "...", "classId": "...", "sectionId": "..." }`

### Attendance
- `POST /api/v1/attendance`
  - Body: `{ "classId": "...", "sectionId": "...", "date": "2025-08-15", "records": [{ "studentId": "...", "status": "PRESENT" }] }`

### Finance & Payments
- `POST /api/v1/payments/collect`
  - Body: `{ "idempotencyKey": "uuid-v4", "studentId": "...", "feeId": "...", "amount": 250.00, "paymentMethod": "CASH" }`
- `GET /api/v1/receipts/:id`

### Examination
- `POST /api/v1/marks`
  - Body: `{ "examId": "...", "classId": "...", "sectionId": "...", "subjectId": "...", "maxMarks": 100, "passMarks": 40, "marks": [{ "studentId": "...", "obtainedMarks": 88 }] }`

### Audit Trail
- `GET /api/v1/audit?limit=50`

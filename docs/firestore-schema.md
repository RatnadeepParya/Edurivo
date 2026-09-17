# Firestore Database Schema Reference

Edurivo organizes school data into structured collections designed to optimize reads, index boundaries, and transactional guarantees.

## Primary Collections & Schemas

### 1. `users/{userId}`
- `uid` (string): Firebase Auth UID
- `email` (string, unique)
- `displayName` (string)
- `role` (enum): `ADMIN`, `TEACHER`, `STUDENT`, `CASHIER`, etc.
- `status` (enum): `ACTIVE`, `DISABLED`, `INACTIVE`
- `customPermissions` (array<string>, optional)
- `passwordHash` (string, optional for seed / local users)
- `metadata` (map)
- `createdAt` (ISO timestamp)
- `updatedAt` (ISO timestamp)

### 2. `students/{studentId}`
- `studentId` (string, PK)
- `admissionNumber` (string, unique)
- `firstName`, `middleName`, `lastName` (strings)
- `dateOfBirth` (string, YYYY-MM-DD)
- `gender` (enum: MALE, FEMALE, OTHER)
- `bloodGroup` (string)
- `email`, `phone` (strings)
- `address`, `city`, `state`, `postalCode` (strings)
- `classId` (string, FK -> classes)
- `sectionId` (string, FK -> sections)
- `academicSessionId` (string, FK -> academicSessions)
- `rollNumber` (string)
- `admissionDate` (string, YYYY-MM-DD)
- `status` (enum: ACTIVE, ARCHIVED, TRANSFERRED)
- `parentName`, `parentPhone`, `parentEmail` (strings)
- `emergencyContact`, `medicalNotes` (strings)
- `isDeleted` (boolean, soft-delete)
- `createdAt`, `updatedAt` (ISO timestamps)

### 3. `teachers/{teacherId}`
- `teacherId` (string, PK)
- `employeeId` (string, unique)
- `name`, `email`, `phone` (strings)
- `department`, `designation` (strings)
- `qualification`, `salary` (number)
- `status` (enum: ACTIVE, ON_LEAVE, RESIGNED)
- `assignedClasses` (array<string>)
- `subjects` (array<string>)
- `createdAt`, `updatedAt` (ISO timestamps)

### 4. `academicSessions/{sessionId}`
- `id` (string): e.g. `session_2025_2026`
- `name` (string): e.g. `2025-2026`
- `startDate`, `endDate` (strings)
- `isActive` (boolean)

### 5. `classes/{classId}` & `sections/{sectionId}`
- `classes`: `id`, `name`, `numericCode`, `description`
- `sections`: `id`, `classId`, `name`, `capacity`, `roomNumber`

### 6. `attendance/{attendanceId}`
- `id` (string, PK)
- `studentId` (string, FK)
- `classId`, `sectionId`, `academicSessionId` (strings)
- `date` (string, YYYY-MM-DD)
- `status` (enum: `PRESENT`, `ABSENT`, `LATE`, `HALF_DAY`, `EXCUSED`)
- `remarks` (string)
- `markedBy` (string, FK -> users)
- Composite Key Rule: `(studentId, date, academicSessionId)` must be unique.

### 7. `feeStructures/{structureId}` & `fees/{feeId}`
- `feeStructures`: `id`, `name`, `classId`, `academicSessionId`, `totalAmount`, `dueDate`, `components`
- `fees`: `id`, `studentId`, `admissionNumber`, `title`, `totalAmount`, `discount`, `paidAmount`, `balance`, `dueDate`, `status` (`PENDING`, `PARTIALLY_PAID`, `PAID`)

### 8. `payments/{paymentId}` & `receipts/{receiptId}`
- `payments`: `id`, `idempotencyKey`, `receiptNumber`, `receiptId`, `studentId`, `amount`, `paymentMethod`, `transactionReference`, `cashierId`, `cashierSessionId`, `createdAt`
- `receipts`: `id`, `receiptNumber`, `paymentId`, `studentId`, `amountPaid`, `previousBalance`, `remainingBalance`, `date`, `items`

### 9. `cashierSessions/{sessionId}`
- `id` (string, PK)
- `cashierId`, `cashierName` (strings)
- `openingFloat` (number)
- `status` (enum: `OPEN`, `CLOSED`, `RECONCILED`)
- `openedAt`, `closedAt` (ISO timestamps)
- `totalCollected`, `totalCash`, `totalUpi`, `totalCard`, `totalBankTransfer` (numbers)
- `expectedCash`, `countedCash`, `discrepancy` (numbers)

### 10. `exams/{examId}` & `results/{resultId}`
- `exams`: `id`, `name`, `type`, `startDate`, `endDate`, `status`, `isPublished`
- `results`: `id`, `examId`, `studentId`, `classId`, `sectionId`, `subjects` (array with scores, grades), `totalMax`, `totalObtained`, `percentage`, `overallGrade`, `status` (`PASS`/`FAIL`), `isPublished`

### 11. `auditLogs/{auditId}`
- `auditId` (string, PK)
- `userId`, `role` (strings)
- `action` (enum: `LOGIN`, `CREATE`, `UPDATE`, `DELETE`, `PAYMENT`, `RESULT_PUBLISH`, etc.)
- `module` (string)
- `entityType`, `entityId` (strings)
- `before`, `after` (JSON diff snapshots)
- `ipAddress`, `userAgent` (strings)
- `timestamp` (ISO timestamp)

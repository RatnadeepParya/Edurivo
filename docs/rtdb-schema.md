# Firebase Realtime Database (RTDB) Schema

RTDB is reserved exclusively for low-latency, real-time synchronization streams. Historical documents remain in Firestore.

## Schema Structure

```json
{
  "presence": {
    "$uid": {
      "status": "online | offline",
      "lastSeen": "2025-08-15T10:30:00.000Z",
      "role": "TEACHER"
    }
  },
  "notifications": {
    "$uid": {
      "$notificationId": {
        "title": "New Assignment",
        "message": "Trigonometry exercise due tomorrow",
        "read": false,
        "timestamp": "2025-08-15T10:30:00.000Z"
      }
    }
  },
  "liveAttendance": {
    "$classId_$sectionId": {
      "date": "2025-08-15",
      "totalStudents": 40,
      "presentCount": 38,
      "absentCount": 2,
      "attendanceRate": 95,
      "updatedAt": "2025-08-15T09:15:00.000Z"
    }
  },
  "cashier": {
    "$cashierId": {
      "totalAmount": 4200.00,
      "paymentCount": 14,
      "updatedAt": "2025-08-15T14:22:10.000Z"
    }
  },
  "dashboard": {
    "counters": {
      "studentCount": 1240,
      "teacherCount": 85,
      "todayCollection": 15400.00,
      "updatedAt": "2025-08-15T14:30:00.000Z"
    }
  }
}
```

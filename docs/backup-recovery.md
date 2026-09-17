# Disaster Recovery & Backup Procedures

## Recovery Objectives
- **Recovery Point Objective (RPO)**: <= 1 hour for financial and attendance records.
- **Recovery Time Objective (RTO)**: <= 2 hours for full cluster restoration.

## Automated Backup Architecture

### 1. Cloud Firestore Scheduled Exports
Configure daily automated backups of the entire Firestore database to a dedicated Google Cloud Storage (GCS) archive bucket:

```bash
gcloud firestore export gs://[BACKUP_BUCKET_NAME]/firestore-backups/$(date +%Y%m%d)
```

### 2. Firebase Storage Document Replication
Enable cross-region object versioning on the storage bucket:
```bash
gsutil versioning set on gs://edurivo-school.appspot.com
```

### 3. Restore Procedure
To restore a snapshot into Cloud Firestore:
```bash
gcloud firestore import gs://[BACKUP_BUCKET_NAME]/firestore-backups/[TIMESTAMP]/[TIMESTAMP].overall_export_metadata
```

#!/bin/bash
# ==============================================================================
# Edurivo Institutional Backup Script
# Exports Cloud Firestore data and archives local configurations
# ==============================================================================

set -e

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "=== Starting Edurivo Automated Backup ==="
echo "Target Backup Directory: $BACKUP_DIR"

# 1. Backup Environment and Configuration
cp .env "$BACKUP_DIR/.env.bak" || true
cp firebase.json "$BACKUP_DIR/firebase.json.bak"
cp firestore.rules "$BACKUP_DIR/firestore.rules.bak"
cp database.rules.json "$BACKUP_DIR/database.rules.json.bak"
cp storage.rules "$BACKUP_DIR/storage.rules.bak"

# 2. Cloud Firestore Export (If gcloud CLI available)
if command -v gcloud &> /dev/null && [ -n "$GCS_BACKUP_BUCKET" ]; then
  echo "Exporting Cloud Firestore to gs://$GCS_BACKUP_BUCKET..."
  gcloud firestore export "gs://$GCS_BACKUP_BUCKET/firestore-backups/$(date +%Y%m%d_%H%M%S)"
fi

echo "=== Backup Process Completed Successfully ==="

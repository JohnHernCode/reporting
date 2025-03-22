#!/bin/bash

LOCKFILE="/tmp/cronSync.lock"

# Check if the lock file exists
if [ -f "$LOCKFILE" ]; then
  echo "Another instance is running. Exiting."
  exit 1
fi

# Create the lock file
touch "$LOCKFILE"

# Run the cronSync endpoint
echo "$(date) - Starting cronSync" >> /home/s3admin/S3-Reporting-Dashboard/cronSync.log
curl -X POST https://reporting.curacallxrm.net/api/cronSync >> /home/s3admin/S3-Reporting-Dashboard/cronSync.log 2>&1
echo "$(date) - Finished cronSync" >> /home/s3admin/S3-Reporting-Dashboard/cronSync.log

# Remove the lock file when done
rm -f "$LOCKFILE"

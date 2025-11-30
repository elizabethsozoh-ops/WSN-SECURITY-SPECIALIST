$source = "c:\Users\zahfi\.gemini\antigravity\scratch\wsn-guardian\client-app\backup_before_redesign"
$dest = "c:\Users\zahfi\.gemini\antigravity\scratch\wsn-guardian\client-app"

Write-Host "Restoring backup..."
Copy-Item "$source\index.html" "$dest\index.html" -Force
Copy-Item "$source\styles.css" "$dest\css\styles.css" -Force
Copy-Item "$source\app-production.js" "$dest\js\app-production.js" -Force
Write-Host "Backup restored successfully!"

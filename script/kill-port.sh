#!/bin/bash

# Cross-platform script to kill process on port 8080
# Works on Windows (Git Bash/PowerShell) and Linux

echo "Checking for processes on port 8080..."

# Function to kill process on port 8080
kill_port_8080() {
    # Try PowerShell first (Windows)
    if command -v powershell >/dev/null 2>&1; then
        echo "Using PowerShell to check port 8080..."
        powershell -Command "
            try {
                \$connections = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
                if (\$connections) {
                    \$connections | ForEach-Object { 
                        Write-Host \"Killing process ID: \$(\$_.OwningProcess)\"
                        Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue
                    }
                    Write-Host \"Processes on port 8080 killed successfully\"
                } else {
                    Write-Host \"No processes found on port 8080\"
                }
            } catch {
                Write-Host \"No processes found on port 8080\"
            }
        "
        return $?
    fi
    
    # Fallback to netstat (Windows)
    if command -v netstat >/dev/null 2>&1; then
        echo "Using netstat to check port 8080..."
        PID=$(netstat -ano 2>/dev/null | grep ":8080" | grep "LISTENING" | awk '{print $5}' | head -1)
        if [ ! -z "$PID" ]; then
            echo "Killing process ID: $PID"
            taskkill /F /PID $PID >/dev/null 2>&1
            echo "Process on port 8080 killed successfully"
        else
            echo "No processes found on port 8080"
        fi
        return 0
    fi
    
    # Linux fallback
    if command -v lsof >/dev/null 2>&1; then
        echo "Using lsof to check port 8080..."
        PID=$(lsof -ti:8080 2>/dev/null)
        if [ ! -z "$PID" ]; then
            echo "Killing process ID: $PID"
            kill -9 $PID
            echo "Process on port 8080 killed successfully"
        else
            echo "No processes found on port 8080"
        fi
        return 0
    fi
    
    echo "No suitable method found to check port 8080"
    return 0
}

# Execute the function
kill_port_8080
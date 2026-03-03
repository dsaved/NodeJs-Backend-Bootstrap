#!/bin/bash
# SAST Vulnerability Check - mirrors .github/workflows/security-sast.yml

echo "🔍 Running security vulnerability checks..."
VULN_FOUND=false

# 1. OSV Scanner (lockfile vulnerabilities)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Running OSV Scanner on lockfiles..."

if command -v osv-scanner &> /dev/null; then
    OSV_INSTALLED=true
else
    echo "⚠️  OSV Scanner not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install osv-scanner
            OSV_INSTALLED=true
        else
            curl -sSfL https://github.com/google/osv-scanner/releases/latest/download/osv-scanner_darwin_amd64 -o osv-scanner
            chmod +x osv-scanner
            sudo mv osv-scanner /usr/local/bin/
            OSV_INSTALLED=true
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -sSfL https://github.com/google/osv-scanner/releases/latest/download/osv-scanner_linux_amd64 -o osv-scanner
        chmod +x osv-scanner
        sudo mv osv-scanner /usr/local/bin/
        OSV_INSTALLED=true
    else
        echo "⚠️  Unsupported OS for OSV Scanner auto-install. Skipping OSV scan."
        OSV_INSTALLED=false
    fi
fi

if [ "$OSV_INSTALLED" = true ]; then
    if [ -f yarn.lock ]; then
        osv-scanner --lockfile=yarn.lock 2>&1 | tee osv-report.txt
        # Check for vulnerabilities in the output - look for the table or summary
        if grep -qE '(known vulnerabilities|OSV URL)' osv-report.txt && grep -qE '\| npm \|' osv-report.txt; then
            VULN_FOUND=true
            echo "❌ OSV Scanner found vulnerabilities!"
        else
            echo "✅ OSV Scanner: No vulnerabilities found"
        fi
        rm -f osv-report.txt
    elif [ -f package-lock.json ]; then
        osv-scanner --lockfile=package-lock.json 2>&1 | tee osv-report.txt
        if grep -qE '(known vulnerabilities|OSV URL)' osv-report.txt && grep -qE '\| npm \|' osv-report.txt; then
            VULN_FOUND=true
            echo "❌ OSV Scanner found vulnerabilities!"
        else
            echo "✅ OSV Scanner: No vulnerabilities found"
        fi
        rm -f osv-report.txt
    else
        echo "⚠️  No lockfile found. Skipping OSV scan."
    fi
fi

echo ""

# 2. Trivy (filesystem and dependency scan)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 Running Trivy security scan..."

if command -v trivy &> /dev/null; then
    TRIVY_INSTALLED=true
else
    echo "⚠️  Trivy not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install trivy
            TRIVY_INSTALLED=true
        else
            echo "⚠️  Homebrew not found. Please install Trivy manually: https://aquasecurity.github.io/trivy/"
            TRIVY_INSTALLED=false
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget -qO trivy.deb https://github.com/aquasecurity/trivy/releases/download/v0.65.0/trivy_0.65.0_Linux-64bit.deb
        sudo dpkg -i trivy.deb
        rm -f trivy.deb
        TRIVY_INSTALLED=true
    else
        echo "⚠️  Unsupported OS for Trivy auto-install. Skipping Trivy scan."
        TRIVY_INSTALLED=false
    fi
fi

if [ "$TRIVY_INSTALLED" = true ]; then
    trivy fs . --exit-code 0 --severity MEDIUM,HIGH,CRITICAL --skip-files .env 2>&1 | tee trivy-report.txt
    if grep -E '│ (yarn.lock|package-lock.json) │ [^│]+ │[[:space:]]*[1-9][0-9]*[[:space:]]*│' trivy-report.txt; then
        VULN_FOUND=true
        echo "❌ Trivy found vulnerabilities in lockfiles!"
    else
        echo "✅ Trivy: No critical vulnerabilities found"
    fi
    rm -f trivy-report.txt
fi

echo ""

# 3. npm/yarn audit (built-in security check)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  Running npm/yarn audit..."

if [ -f yarn.lock ]; then
    # Use yarn audit - only check production dependencies
    if yarn audit --level moderate --groups dependencies --json > audit-report.json 2>&1; then
        echo "✅ Yarn audit: No vulnerabilities found"
    else
        # Check if there are actual vulnerabilities or just warnings
        if grep -q '"type":"auditAdvisory"' audit-report.json 2>/dev/null; then
            VULN_FOUND=true
            echo "❌ Yarn audit found vulnerabilities!"
            yarn audit --level moderate --groups dependencies
        else
            echo "✅ Yarn audit: No vulnerabilities found"
        fi
    fi
    rm -f audit-report.json
elif [ -f package-lock.json ]; then
    # Use npm audit
    if npm audit --audit-level=moderate --json > audit-report.json 2>&1; then
        echo "✅ npm audit: No vulnerabilities found"
    else
        # Check if there are actual vulnerabilities
        VULN_COUNT=$(jq -r '.metadata.vulnerabilities.moderate + .metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' audit-report.json 2>/dev/null || echo "0")
        if [ "$VULN_COUNT" -gt 0 ]; then
            VULN_FOUND=true
            echo "❌ npm audit found vulnerabilities!"
            npm audit --audit-level=moderate
        else
            echo "✅ npm audit: No vulnerabilities found"
        fi
    fi
    rm -f audit-report.json
else
    echo "⚠️  No lockfile found. Skipping audit."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Final result
if [ "$VULN_FOUND" = true ]; then
    echo "❌ Security vulnerabilities detected! Please fix before pushing."
    echo ""
    echo "💡 To fix vulnerabilities:"
    echo "   - Run: yarn upgrade (or npm update)"
    echo "   - Review and update vulnerable packages"
    echo "   - Check for security patches"
    exit 1
else
    echo "✅ All security checks passed!"
fi

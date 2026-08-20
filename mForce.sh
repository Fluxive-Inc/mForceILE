#!/bin/bash
echo -e "\033[0;34m   .     +      * .      *"
echo -e "   ___ _           _         ___  ___"
echo -e "  | __| |_ _  ___ (_)_ ____ / _ \/ __|"
echo -e "  | _|| | | | \ \ / / \ V /| (_) \__ \\033[0m"
echo -e "\033[0;34m  |_| |_|\_,_|/_\_\_|_|\_/  \___/|___/\033[0m"
echo -e ""
echo -e " MACHINEFORCE COMMAND :: os.fluxive.ai"

# --- COLOR PALETTE (Space Theme) ---
NEON='\033[1;36m'   # Bright Cyan (The Laser)
DEEP='\033[0;34m'   # Dark Blue (The Void)
STAR='\033[1;37m'   # White (The Stars)
NC='\033[0m'        # Reset

# --- HEADER ART ---
print_header() {
    echo -e "${DEEP}   .     +      * .      *${NC}"
    echo -e "${NEON}   ___ _           _${NC}"
    echo -e "${NEON}  / __| |_ _  ___ (_)_ _____${NC}"
    echo -e "${STAR} | _| | | | | \ \ / / \ V / -_)${NC}"
    echo -e "${DEEP} |_| |_|\\_,_|/_\\_\\_|_|\\_/\\___|${NC}"
    echo -e ""
    echo -e "${DEEP} ----------------------------------------${NC}"
}

# --- CONFIGURATION ---
# Auto-detect project info from current directory
PROJECT_NAME=$(basename "$(pwd)")
PROJECT_DIR="$(pwd)"
DATE=$(date +%Y%m%d_%H%M%S)

# Default Google Cloud Configuration
# Logic to determine GCP project name
if [[ "$PROJECT_NAME" == mForceMOD_* ]]; then
    GCP_PROJECT="mforceile"
elif [[ "$PROJECT_NAME" == mForceEdge_* ]]; then
    GCP_PROJECT="mforceile"
else
    # Default: lowercase project name
    GCP_PROJECT=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]')
fi

# --- FUNCTIONS ---

# 0. Info
cmd_info() {
    print_header
    echo -e "${STAR}Project Info:${NC}"
    echo -e "  ${NEON}Name:${NC} $PROJECT_NAME"
    echo -e "  ${NEON}Start Directory:${NC} $PROJECT_DIR"
    echo -e "  ${NEON}Target GCP Project:${NC} $GCP_PROJECT"
    echo -e "  ${NEON}Date:${NC} $DATE"
    echo -e ""
    if [ -f "profile.md" ]; then
        echo -e "${STAR}Profile Summary:${NC}"
        head -n 5 profile.md
    else
        echo -e "${DEEP}No profile.md found.${NC}"
    fi
}

# 1. Doc
cmd_doc() {
    echo -e "${NEON}Generating Documentation...${NC}"
    DOC_FILE="${PROJECT_NAME}_documentation.md"
    echo "# $PROJECT_NAME Documentation" > "$DOC_FILE"
    echo "**Generated:** $DATE" >> "$DOC_FILE"
    echo "" >> "$DOC_FILE"
    
    echo "## File Structure" >> "$DOC_FILE"
    echo "\`\`\`" >> "$DOC_FILE"
    find . -maxdepth 2 -not -path '*/.*' >> "$DOC_FILE"
    echo "\`\`\`" >> "$DOC_FILE"
    
    echo -e "${STAR}Documentation saved to $DOC_FILE${NC}"
}

# 2. Check Status
cmd_status() {
    echo -e "${NEON}Checking Git Status...${NC}"
    git status
}

# 3. Check Out
cmd_checkout() {
    echo -e "${NEON}Pulling from GitHub...${NC}"
    git pull
}

# 4. Check In
cmd_checkin() {
    echo -e "${NEON}Pushing to GitHub...${NC}"
    read -p "Enter commit message (default: Update $DATE): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-"Update $DATE"}
    git add .
    git commit -m "$COMMIT_MSG"
    git push
}

# 5. Backup
cmd_backup() {
    echo -e "${NEON}Backing up to Google Cloud Storage...${NC}"
    BUCKET_NAME="$PROJECT_NAME"
    # Ensure bucket exists (best effort)
    gcloud storage buckets describe "gs://$BUCKET_NAME" --project "$GCP_PROJECT" >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${DEEP}Creating bucket gs://$BUCKET_NAME in project $GCP_PROJECT...${NC}"
        gcloud storage buckets create "gs://$BUCKET_NAME" --project "$GCP_PROJECT" --location us-east1
    fi
    
    TARGET="gs://$BUCKET_NAME/backup_$DATE"
    gcloud storage cp -r . "$TARGET"
    echo -e "${STAR}Backup complete: $TARGET${NC}"
}

# 6. Test
cmd_test() {
    echo -e "${NEON}Running Local Test...${NC}"
    # Detect run command based on file type
    if [ -f "package.json" ]; then
        echo -e "Detected Node.js project. Running npm run dev..."
        npm run dev
    elif [ -f "main.py" ] || [ -f "app.py" ]; then
         echo -e "Detected Python project."
         if [ -d "venv" ]; then
             source venv/bin/activate
         fi
         # Basic execution attempt
         python3 main.py || python3 app.py
    elif [ -f "Dockerfile" ]; then
        echo -e "Detected Dockerfile. Building and running..."
        docker build -t "$PROJECT_NAME:test" .
        docker run -p 8080:8080 "$PROJECT_NAME:test"
    else
        echo -e "${DEEP}No executable configuration detected (package.json, *.py, Dockerfile).${NC}"
    fi
}

# 7. Deploy
cmd_deploy() {
    echo -e "${NEON}Deploying to Google Cloud...${NC}"
    if [ -f "cloudbuild.yaml" ]; then
        gcloud builds submit --project "$GCP_PROJECT" --config cloudbuild.yaml
    elif [ -f "firebase.json" ]; then
        firebase deploy --project "$GCP_PROJECT"
    else
        echo -e "${DEEP}No deployment configuration found (cloudbuild.yaml or firebase.json).${NC}"
    fi
}

# 8. Clean
cmd_clean() {
    echo -e "${NEON}Cleaning workspace...${NC}"
    rm -rf dist build *.log __pycache__
    echo -e "${STAR}Clean complete.${NC}"
}

# 9. Package
cmd_package() {
    echo -e "${NEON}Packaging project...${NC}"
    PKG_NAME="${PROJECT_NAME}_${DATE}.mForce"
    # Creating a zip/tar archive but naming it .mForce
    tar -czf "$PKG_NAME" --exclude='node_modules' --exclude='venv' --exclude='.git' .
    echo -e "${STAR}Package created: $PKG_NAME${NC}"
}

# 10. Debug
cmd_debug() {
    echo -e "${NEON}Debugging...${NC}"
    echo "Comparing with previous commit..."
    git diff HEAD^ HEAD --stat
}

# 420. Bake
cmd_bake() {
    echo -e "${NEON}🔥🔥🔥 BAKING PROJECT 🔥🔥🔥${NC}"
    
    # 1. Documentation
    cmd_doc
    
    # 4. Check In
    echo -e "${DEEP}Committing...${NC}"
    git add .
    BAKE_MSG="mForceBAKED_${PROJECT_NAME}_$(date +%Y%m%d_%H%M%S)"
    git commit -m "$BAKE_MSG"
    # git push # Optional: Uncomment to push automatically
    
    # 5. Backup
    cmd_backup
    
    # 7. Deploy
    cmd_deploy
    
    # 8. Clean
    cmd_clean
    
    # 9. Package
    cmd_package
    
    # Upload .mForce package to Foundry
    FOUNDRY_PROJECT="mforcefoundry"
    BAKED_BUCKET="baked_$PROJECT_NAME"
    FULL_PKG_NAME="${PROJECT_NAME}_${DATE}.mForce"
    
    echo -e "${NEON}Uploading to Foundry ($FOUNDRY_PROJECT)...${NC}"
    
    # Correct bucket handling for Foundry
    # Using 'gsutil ls' check or gcloud storage for robustness
    gcloud storage buckets describe "gs://$BAKED_BUCKET" --project "$FOUNDRY_PROJECT" >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${DEEP}Creating bucket gs://$BAKED_BUCKET in Foundry...${NC}"
        gcloud storage buckets create "gs://$BAKED_BUCKET" --project "$FOUNDRY_PROJECT" --location us-east1
    fi
    
    gcloud storage cp "$FULL_PKG_NAME" "gs://$BAKED_BUCKET/"
    
    echo -e "${STAR}BAKE COMPLETE!${NC}"
}


# --- MAIN MENU ---
if [ "$1" ]; then
    CMD=$1
else
    print_header
    echo -e "Select a command:"
    echo " [0] Info"
    echo " [1] Doc"
    echo " [2] Check Status"
    echo " [3] Check Out"
    echo " [4] Check In"
    echo " [5] Backup"
    echo " [6] Test"
    echo " [7] Deploy"
    echo " [8] Clean"
    echo " [9] Package"
    echo " [10] Debug"
    echo " [420] Bake"
    read -p "Enter option: " CMD
fi

case $CMD in
    0|info) cmd_info ;;
    1|doc) cmd_doc ;;
    2|check|status) cmd_status ;;
    3|out|checkout) cmd_checkout ;;
    4|in|checkin) cmd_checkin ;;
    5|backup) cmd_backup ;;
    6|test) cmd_test ;;
    7|deploy) cmd_deploy ;;
    8|clean) cmd_clean ;;
    9|package) cmd_package ;;
    10|debug) cmd_debug ;;
    420|bake|99) cmd_bake ;;
    *) echo -e "${DEEP}Invalid Option${NC}" ;;
esac

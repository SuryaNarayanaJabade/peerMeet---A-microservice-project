# 1. Set environment variables for easier copy-pasting
export REGION="us-central1"
export PROJECT_ID="online-meeting-3cb69"  # <--- CHANGE THIS
export REPO="peermeet-repo"

# 2. Build and Push Client
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REPO/client:latest ./client
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPO/client:latest

# 3. Build and Push API Gateway
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REPO/api-gateway:latest ./backend/api-gateway
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPO/api-gateway:latest

# 4. Build and Push Meeting Service
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REPO/meeting-service:latest ./backend/meeting-service
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPO/meeting-service:latest

# 5. Build and Push Signaling Service
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REPO/signaling-service:latest ./backend/signaling-service
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPO/signaling-service:latest
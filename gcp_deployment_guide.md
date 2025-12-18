# Deploying to Google Cloud Platform (GKE & Artifact Registry)

This guide walks you through creating a GKE cluster, setting up Artifact Registry, pushing your Docker images, and deploying your application.

## Prerequisites
- A Google Cloud Project.
- Billing enabled for your project.
- `gcloud` CLI installed on your machine (Already installed? Run `gcloud --version` to check).

---

## Step 1: Create a GKE Cluster (Web UI)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. In the navigation menu (≡), go to **Kubernetes Engine** > **Clusters**.
3. Click **CREATE**.
4. Choose **Standard** (for full control) or **Autopilot** (managed).
   - *Recommendation for this project*: **Standard** is fine and cheaper if you use small nodes (e.g., e2-medium).
5. **Cluster Basics**:
   - **Name**: `peermeet-cluster`
   - **Location**: Use a **Zonal** cluster (e.g., `us-central1-a`) to save costs compared to Regional.
6. **Node Pool**:
   - Click on "default-pool" -> "Nodes".
   - **Machine type**: `e2-medium` (2 vCPU, 4GB RAM) should be sufficient for these microservices.
   - **Size**: 3 nodes (default).
7. Click **CREATE**. It will take a few minutes to provision.

---

## Step 2: Create an Artifact Registry Repository

This is where your Docker images will be stored.

1. In the console menu, go to **Artifact Registry**.
2. Click **CREATE REPOSITORY**.
3. **Name**: `peermeet-repo`
4. **Format**: **Docker**.
5. **Mode**: **Standard**.
6. **Location Type**: **Region**. Choose the same region as your cluster (e.g., `us-central1`).
7. Click **CREATE**.

---

## Step 3: Configure Local Environment

Run these commands in your terminal:

1. **Login to Google Cloud**:
   ```bash
   gcloud auth login
   ```

2. **Set your Project ID**:
   Replace `YOUR_PROJECT_ID` with your actual project ID (found in the console).
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Configure Docker to authenticate with Artifact Registry**:
   Replace `us-central1` with your repository's region.
   ```bash
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```

4. **Connect kubectl to your new cluster**:
   After the cluster is ready (Step 1), run the "Connect" command shown in the console, or:
   ```bash
   gcloud container clusters get-credentials peermeet-cluster --zone us-central1-a
   ```

---

## Step 4: Build, Tag, and Push Images

We need to rename your local images to match the Google Artifact Registry format:
`LOCATION-docker.pkg.dev/PROJECT-ID/REPOSITORY-NAME/IMAGE:TAG`

Assuming:
- Region: `us-central1`
- Repo: `peermeet-repo`

**Run these commands:**

```bash
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
```

---

## Step 5: Update Kubernetes Manifests

You must update `k8s-deployment.yaml` to use these new image URLs instead of just `client:latest`.

**Find**: `image: client:latest`
**Replace with**: `image: us-central1-docker.pkg.dev/YOUR_PROJECT_ID/peermeet-repo/client:latest`

(Repeat for all 4 services).

---

## Step 6: Deploy to GKE

1. **Create the Secret** (Important!):
   ```bash
   kubectl create secret generic firebase-sa-secret --from-file=service-account.json=./backend/service-account.json
   ```

2. **Apply the manifests**:
   ```bash
   kubectl apply -f k8s-deployment.yaml
   ```

3. **Get External IP**:
   In GKE, `NodePort` is okay, but usually, we use `LoadBalancer` for external access.
   
   To quickly access your `client` service externally, edit `k8s-deployment.yaml` and change `type: NodePort` to `type: LoadBalancer` for the **client-service**.
   
   Then run:
   ```bash
   kubectl get services
   ```
   Wait for the `EXTERNAL-IP` to appear for `client-service`.

## Accessing the App
Note that since we hardcoded URLs in the `.env` files (e.g., `http://localhost:30001` for API Gateway), the client running in your browser might fail to reach the backend if deployed to a cloud server because `localhost` refers to your computer, not the cloud.

**Correction for Cloud Deployment:**
1. You should also change `client-service`, `api-gateway-service`, and `signaling-service` to `type: LoadBalancer` if you want them publicly reachable.
2. Get the External IP of `api-gateway-service` and `signaling-service`.
3. Update the `client/.env` (during build time!) with these new External IPs.
4. **Rebuild and Repush** the client image.

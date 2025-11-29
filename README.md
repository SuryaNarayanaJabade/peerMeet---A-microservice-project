# Online Meeting Platform

A comprehensive online meeting application built with a modern full-stack architecture. This project features a React-based frontend and a microservices-based backend to handle real-time communication, meeting management, and signaling.

## 🚀 Project Structure

The project is organized into two main directories:

- **`client/`**: The frontend application built with Vite, React, and TypeScript.
- **`backend/`**: The backend infrastructure composed of multiple microservices:
  - `api-gateway`: Entry point for backend requests.
  - `meeting-service`: Manages meeting logic and state.
  - `signaling-service`: Handles WebRTC signaling for real-time connections.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Microservices Architecture
- **Real-time Communication**: WebRTC, Socket.io (implied)
- **Database/Auth**: Firebase (implied by configuration files)

## 📦 Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Online-Meeting
    ```

2.  **Setup Client:**
    ```bash
    cd client
    npm install
    npm run dev
    ```

3.  **Setup Backend:**
    Navigate to each service directory in `backend/` and install dependencies:
    ```bash
    cd backend/api-gateway
    npm install
    # Repeat for meeting-service and signaling-service
    ```

## 🔒 Configuration

Ensure you have the necessary environment variables and configuration files set up:

- **Firebase**: Place your `firebaseconfig.ts` or relevant keys where required (ensure secrets are not committed).
- **Service Accounts**: If using server-side Firebase Admin, ensure `service-account.json` is present locally but **never** committed to version control.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## 📄 License

[MIT License](LICENSE)

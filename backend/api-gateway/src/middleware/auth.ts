import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialize Firebase Admin
// In production, you'd use a service account key
// For now, we'll try applicationDefault or mock it if strictly needed, 
// but let's assume the user has set up GOOGLE_APPLICATION_CREDENTIALS or similar
// OR we can just use a placeholder credential if we don't have the key yet.
// Given the user provided client config, we might not have server config.
// I will use a standard setup and if it fails, I'll ask the user.

if (!admin.apps.length) {
    try {
        // Prepare credential object
        let credential;

        // Check if GOOGLE_APPLICATION_CREDENTIALS env var is set (Standard for Cloud/K8s)
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // In K8s/Docker, if we mount the JSON file and set the env var, 
            // admin.credential.applicationDefault() or cert() with path works.
            // Explicitly handling the path if provided in env to match our manual setup
            credential = admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        } else {
            // Fallback for local development if env var not set
            const serviceAccount = require("../../../service-account.json");
            credential = admin.credential.cert(serviceAccount);
        }

        admin.initializeApp({
            credential: credential,
            projectId: "online-meeting-3cb69" // Taken from user's client config
        });
    } catch (error) {
        console.error("Firebase Admin Init Error:", error);
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        (req as any).user = decodedToken;
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }
};

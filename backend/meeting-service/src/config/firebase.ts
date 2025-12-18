import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        let credential;

        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            credential = admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        } else {
            const serviceAccount = require("../../../service-account.json");
            credential = admin.credential.cert(serviceAccount);
        }

        admin.initializeApp({
            credential: credential,
            projectId: "online-meeting-3cb69"
        });
    } catch (error) {
        console.error("Firebase Admin Init Error:", error);
    }
}

export const db = admin.firestore();

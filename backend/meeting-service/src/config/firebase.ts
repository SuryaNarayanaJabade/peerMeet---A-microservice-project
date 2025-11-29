import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccount = require("../../../service-account.json");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: "online-meeting-3cb69"
        });
    } catch (error) {
        console.error("Firebase Admin Init Error:", error);
    }
}

export const db = admin.firestore();

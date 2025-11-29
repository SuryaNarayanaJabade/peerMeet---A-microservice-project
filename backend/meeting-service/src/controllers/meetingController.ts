import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const createMeeting = async (req: Request, res: Response) => {
    try {
        const { title, hostId, hostName, scheduledAt } = req.body;

        // Note: In a real microservice, we might validate the user token again 
        // or trust the gateway (if we had private networking).
        // Here we trust the gateway passed the request, but we still need user info.
        // The gateway passes the user info in headers or we just rely on the body for now 
        // since we are in a simplified environment. 
        // Ideally, Gateway should pass 'X-User-Id' header.

        // Let's assume the client sends the necessary data for now, 
        // or the Gateway injects it. To keep it simple, we'll take it from body.

        const newMeeting = {
            title,
            hostId,
            hostName,
            scheduledAt: scheduledAt || null,
            status: 'created',
            createdAt: new Date().toISOString(),
            participants: []
        };
        const docRef = await db.collection('meetings').add(newMeeting);
        res.status(201).json({ id: docRef.id, ...newMeeting });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create meeting' });
    }
};

export const getMeetings = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        let query: FirebaseFirestore.Query = db.collection('meetings');

        if (userId) {
            query = query.where('hostId', '==', userId);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const meetings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(meetings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
};

export const getMeetingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('meetings').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
};

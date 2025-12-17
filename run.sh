#!/bin/bash

# Run the client
cd client
npm install > /dev/null 2>&1
npm run dev > /dev/null 2>&1 &
PIDFRONTEND=$!
cd ..

# Run the backend
cd backend/api-gateway
npm install > /dev/null 2>&1    
npm run build 
npm start > /dev/null 2>&1 &
PIDAPIGATEWAY=$!

cd ../meeting-service
npm install > /dev/null 2>&1
npm run build
npm start > /dev/null 2>&1 &
PIDMEETING=$!

cd ../signaling-service
npm install > /dev/null 2>&1
npm run build
npm start > /dev/null 2>&1 &
PIDSIGNALING=$!

echo "All services are running with the following PIDs:"
echo "Frontend: $PIDFRONTEND"
echo "API Gateway: $PIDAPIGATEWAY"
echo "Meeting Service: $PIDMEETING"
echo "Signaling Service: $PIDSIGNALING"
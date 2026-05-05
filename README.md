# 🚀 OrbytOS
This is an [Expo](https://expo.dev) project with a full-stack setup including a backend deployed using a **CI/CD pipeline (Jenkins + Docker + AWS EC2)**.
---
## 📱 Features
- 📲 Cross-platform mobile app (Expo)
- ⚡ Node.js backend API
- 🐳 Docker containerization
- 🔄 Automated CI/CD pipeline with Jenkins
- ☁️ Deployment on AWS EC2
- ❤️ Health check monitoring endpoint
---
## 🧱 Project Structure
OrbytOS/
├── app/                 # Expo frontend (React Native)  
├── backend/             # Node.js backend  
├── Dockerfile           # Backend container config  
├── Jenkinsfile          # CI/CD pipeline  
└── README.md  
---
## Get started
### 1. Install dependencies
```bash
npm install

⸻

2. Start the Expo app

npx expo start

In the output, you’ll find options to open the app in a:

* development build
* Android emulator
* iOS simulator
* Expo Go

You can start developing by editing files inside the app directory.

⸻

3. Run backend locally

cd backend
npm install
node server.js

⸻

🌐 Live Backend

http://100.30.204.247:8080/health

Example response:

{
  "status": "ok",
  "uptime": 0,
  "timestamp": "2026-05-05T07:17:09.670Z"
}

⸻

⚙️ CI/CD Pipeline

This project uses Jenkins to automate deployment.

🔁 Pipeline Stages

1. Checkout code from GitHub
2. Build Docker image
3. Push image to Docker Hub
4. Deploy on AWS EC2 via SSH
5. Run container
6. Perform health check

⸻

🐳 Docker

Build image

docker build -t orbytos-backend .

Run container

docker run -d -p 8080:3000 orbytos-backend

⸻

☁️ Deployment

* Cloud Provider: AWS EC2
* Container Runtime: Docker
* Automation: Jenkins

⸻

📸 Screenshots (for report)

* Jenkins pipeline success 
* Docker build & push logs
* EC2 deployment
* Health check API response
* Expo app running

⸻

🛠 Tech Stack

* React Native (Expo)
* Node.js
* Docker
* Jenkins
* AWS EC2

⸻

📌 Future Improvements

* Add authentication (Firebase)
* Improve UI/UX
* Add frontend-backend integration
* Deploy frontend (web version)

⸻

👩‍💻 Author

Aditi Prasanth

⸻

⭐ Acknowledgement

This project demonstrates a real-world DevOps workflow integrating development and deployment pipelines.

⸻

Learn more

* https://docs.expo.dev/
* https://docs.expo.dev/tutorial/introduction/

⸻

Join the community

* https://github.com/expo/expo
* https://chat.expo.dev

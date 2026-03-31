# 🚀 Smart Queue Management System

A real-time queue management system built using **React, Node.js, MongoDB, and Socket.IO**.
This system allows students to book tokens and track their position in a live queue, while admins manage and monitor the queue efficiently.

---

## 📌 Features

### 👨‍🎓 Student

* Register & Login (secure authentication)
* Book token for services
* View real-time queue position
* Get notification when it's their turn 🔔
* See estimated waiting time

### 🛠️ Admin

* Admin login
* View live queue
* Call next token
* Monitor total tokens & waiting time
* Real-time updates using WebSockets

---

## 🧱 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios
* Socket.IO Client

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Socket.IO

---

## 📂 Project Structure

```
project-root/
│
├── backend/
│   ├── server.js
│   ├── models/
│   ├── routes/
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/smart-queue-system.git
cd smart-queue-system
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/queueDB
JWT_SECRET=mysecret
```

Run backend:

```bash
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## 🔐 Authentication

* JWT-based authentication
* Secure password hashing using bcrypt
* Role-based access:

  * `student`
  * `admin`

---

## 🔄 API Endpoints

### Auth

* `POST /register`
* `POST /login`
* `GET /me`

### Queue

* `POST /token` → Book token
* `GET /queue` → Get queue
* `POST /next` → Call next (admin)

### Analytics

* `GET /analytics`

---

## ⚡ Real-Time Features

* Live queue updates using **Socket.IO**
* Instant updates for all users
* Turn notification system 🔔

---

## 🖼️ Screenshots

> Add your screenshots here

---

## 🚀 Future Enhancements

* 📊 Advanced analytics dashboard
* 📱 Mobile responsive UI improvements
* 🔔 Push notifications
* 📅 Token scheduling system
* 🧾 Payment integration

---

## 🧠 Learning Outcomes

* Real-time app development
* Authentication & authorization
* WebSocket integration
* Full-stack architecture

---

## 🤝 Contributing

Pull requests are welcome!
For major changes, please open an issue first.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Muhammed Danish AP**

* GitHub: https://github.com/danishapoo7

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

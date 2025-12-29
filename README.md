# 🎓 UniMates

> Connecting university students for study sessions, activities, and meaningful campus experiences

UniMates is a mobile application designed to help university students find compatible peers for various activities—from study sessions and gym workouts to social events and volunteering. Built with safety and accessibility at its core, UniMates creates a verified community where students can build connections based on shared interests and goals.

---

## ✨ Features

### Core Functionality
- **Smart Matching Algorithm** - Get matched with peers based on shared interests, availability, and goals
- **Multi-Purpose Requests** - Find partners for studying, gym, coffee, walks, events, and more
- **Real-Time Notifications** - Instant alerts for new matches, requests, and messages
- **Secure Messaging** - Chat safely with matched users before meeting in person
- **Flexible Profiles** - Customize your profile with major, year, interests, and availability

### Safety & Verification
- **University Email Verification** - Ensures all users are verified students
- **Report & Block System** - Tools to maintain a safe, respectful community
- **Automatic Account Restrictions** - Flagged accounts are immediately restricted

### Accessibility
- **Text-to-Speech** - Full screen reader support for visually impaired users
- **Voice Commands** - Navigate and create requests using voice
- **Customizable Settings** - Enable/disable accessibility features as needed

### Feedback System
- **Post-Meeting Ratings** - Rate your experience after each interaction
- **Continuous Improvement** - Feedback helps refine matching algorithms

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React Native with TypeScript
- **State Management:** Redux
- **UI/UX:** Consistent, intuitive mobile-first design

### Backend
- **API Server:** Node.js (Express)
- **ML Processing:** Python (FastAPI)
- **Real-time Features:** Socket.IO

### Database
- **Primary:** PostgreSQL
- **Real-time Data:** Firebase Firestore (hybrid approach)

### Infrastructure & Services
- **Cloud Hosting:** AWS (EC2, S3)
- **Authentication:** Firebase Auth + JWT + bcrypt
- **Notifications:** Firebase Cloud Messaging
- **Accessibility:** Google Cloud Speech API, Expo Speech
- **Messaging:** Firebase Realtime Database

### AI & Machine Learning
- **Matching Logic:** scikit-learn, Pandas
- **Algorithm:** Purpose-based compatibility scoring with availability overlap

---

## 📋 Requirements

### Functional Requirements

1. **User Profiles** - Create and edit profiles with name, major, year, interests, availability, and purpose
2. **Intelligent Matching** - Algorithm matches users based on compatibility and ranks by relevance
3. **Instant Notifications** - Real-time alerts for matches, requests, and messages
4. **Accessibility Support** - Text-to-speech and voice commands across all screens
5. **Safety First** - University email verification, reporting, and blocking capabilities
6. **Secure Messaging** - In-app chat for matched users
7. **Dynamic Goals** - Select different purposes for each request
8. **Feedback Loop** - Rate experiences to improve matching quality

### Non-Functional Requirements

#### Performance
- **Load Time:** < 1 second for all screens
- **Matching Speed:** < 0.5 seconds for results
- **Scalability:** Supports 50-100 concurrent users

#### Security
- **Encryption:** HTTPS in transit, encrypted at rest
- **Authentication:** University SSO integration
- **Privacy Controls:** Users control visibility of personal details

#### Reliability
- **Uptime:** 99% availability
- **Backup:** Daily automated backups
- **Recovery:** < 10 minutes recovery time

#### Code Quality
- **Test Coverage:** Minimum 80% unit test coverage
- **Documentation:** Modular, well-documented codebase
- **Internationalization:** Support for English and French

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 16.x
Python >= 3.8
PostgreSQL >= 13
React Native CLI
Firebase account
AWS account
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/unimates.git
cd unimates
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install

cd ml-service
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
# Create .env file in backend directory
cp .env.example .env

# Add your configuration:
# - Database credentials
# - Firebase config
# - AWS credentials
# - JWT secret
```

5. **Initialize database**
```bash
cd backend
npm run db:migrate
npm run db:seed
```

6. **Start the application**
```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - ML Service
cd ml-service
python main.py

# Terminal 3 - React Native
cd frontend
npm run ios     # for iOS
npm run android # for Android
```

---

## 👥 Team

- **Salma Madoud** - 148586
- **Rim Bousta** - 149871
- **Rami Mazaoui** - 155665
- **Hassan Hankir** - 117263
- **Hadil Raad** - 155882

---

## 📄 License

[Add your license here - MIT, Apache 2.0, etc.]

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

---

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the team.

---

**Made with ❤️ by the UniMates Team**

# Soundtrack My Night - Backend API

A Node.js/Express REST API for generating personalized music playlists based on user preferences. The system supports both guest and registered users, with premium playlist generation through Stripe payment integration.

## 🎯 Features

- **User Authentication**: JWT-based authentication for registered users
- **Password Reset**: OTP-based password reset functionality
- **Guest Quiz Submission**: Allow users to submit quizzes without registration
- **AI-Powered Playlist Generation**: Integration with external AI service for personalized playlists
- **Stripe Payment Integration**: Secure payment processing for premium playlists (50 songs)
- **Email Notifications**: Automated email delivery with playlist links
- **Dual Playlist Types**: 
  - Default playlists (15 songs) - Free
  - Premium playlists (50 songs) - Paid
- **Webhook Processing**: Asynchronous premium playlist generation via Stripe webhooks

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Payment**: Stripe
- **Email**: Nodemailer (Hostinger SMTP)
- **HTTP Client**: Axios
- **Security**: bcryptjs for password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud instance)
- Stripe account with API keys
- Hostinger email account (or SMTP credentials)
- AI service endpoint for playlist generation

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd roryclerk-01
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   FRONTEND_URL=https://your-frontend-url.com
   
   # Database
   MONGO_URI=mongodb://localhost:27017/roryclerk
   # OR for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # CORS (Optional - defaults to *)
   ALLOWED_ORIGIN=https://soundtrackmynight.com
   
   # Email Configuration (Hostinger SMTP)
   EMAIL_USER=info@soundtrackmynight.com
   EMAIL_PASS=your-email-password
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # AI Service Endpoint
   AI_ENDPOINT=http://your-ai-service-url:port
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The server will start with nodemon for auto-reloading.

5. **Start the production server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
roryclerk-01/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── config/
│   │   ├── constant.js       # Environment variables
│   │   └── dbConnect.js      # MongoDB connection
│   ├── controllers/
│   │   ├── payment.controller.js
│   │   ├── playlist.controller.js
│   │   ├── quiz.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── Playlist.js
│   │   ├── Quiz.js
│   │   └── User.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── payment.routes.js
│   │   ├── playlist.routes.js
│   │   ├── quiz.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   ├── playlist.service.js
│   │   ├── quiz.service.js
│   │   └── user.service.js
│   └── utils/
│       ├── email.js          # Email sending utility
│       └── response.js       # Standardized response helpers
├── .env                      # Environment variables (not in git)
├── package.json
└── README.md
```

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | `3000` |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT token generation | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | Yes | - |
| `FRONTEND_URL` | Frontend application URL | Yes | - |
| `ALLOWED_ORIGIN` | CORS allowed origin | No | `*` |
| `EMAIL_USER` | Email address for sending emails | Yes | - |
| `EMAIL_PASS` | Email password | Yes | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes | - |
| `AI_ENDPOINT` | AI service endpoint URL | Yes | - |

## 📡 Complete API Documentation

Base URL: `/api/v1`

---

## 🔐 Authentication Routes

Base path: `/api/v1/auth/users`

### 1. Register User

**Endpoint:** `POST /api/v1/auth/users/register`

**Description:** Register a new user or upgrade a guest user to a registered user.

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required)"
}
```

**Example Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "type": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Name, email and password are required"
  }
  ```
- **400 Bad Request (User exists):**
  ```json
  {
    "success": false,
    "message": "User already exists"
  }
  ```

---

### 2. Login User

**Endpoint:** `POST /api/v1/auth/users/login`

**Description:** Authenticate a user and return a JWT token. Token is also set as an HTTP-only cookie.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Example Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "isPremium": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Note:** Token is also set as an HTTP-only cookie named `token`.

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Email and password are required"
  }
  ```
- **400 Bad Request (User not found):**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```
- **400 Bad Request (Invalid password):**
  ```json
  {
    "success": false,
    "message": "Invalid password"
  }
  ```

---

### 3. Forgot Password

**Endpoint:** `POST /api/v1/auth/users/forgot-password`

**Description:** Send a password reset OTP to the user's email. OTP expires in 10 minutes.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Example Request:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": {
    "success": true,
    "message": "Password reset email sent successfully",
    "status": 200
  }
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Email is required"
  }
  ```
- **400 Bad Request (User not found):**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

---

### 4. Verify OTP

**Endpoint:** `POST /api/v1/auth/users/verify-otp`

**Description:** Verify the OTP sent to the user's email for password reset.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)",
  "otp": "number (required, 6 digits)"
}
```

**Example Request:**
```json
{
  "email": "john@example.com",
  "otp": 123456
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "success": true,
    "message": "OTP verified successfully",
    "status": 200
  }
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Email and OTP are required"
  }
  ```
- **400 Bad Request (Invalid OTP):**
  ```json
  {
    "success": false,
    "message": "Invalid OTP"
  }
  ```
- **400 Bad Request (OTP expired):**
  ```json
  {
    "success": false,
    "message": "OTP expired"
  }
  ```

---

### 5. Reset Password

**Endpoint:** `POST /api/v1/auth/users/reset-password`

**Description:** Reset the user's password after OTP verification. Requires OTP to be verified first.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)",
  "newPassword": "string (required)"
}
```

**Example Request:**
```json
{
  "email": "john@example.com",
  "newPassword": "newsecurepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "success": true,
    "message": "Password reset successfully",
    "status": 200
  }
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Email and password are required"
  }
  ```
- **400 Bad Request (User not found or OTP not verified):**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

---

## 🎵 Quiz Routes

Base path: `/api/v1/quiz`

### 6. Submit Guest Quiz

**Endpoint:** `POST /api/v1/quiz/guest/submit`

**Description:** Submit a quiz as a guest user. Creates a guest user if email doesn't exist, generates a default playlist (15 songs), and sends an email with the playlist link.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)",
  "answers": {
    "q1": "string",
    "q2": "string",
    "q3": "string",
    "q4": "string",
    "q5": "string",
    "q6": "string",
    "q7": ["string", "string"],
    "q8": ["string", "string"],
    "q9": "string",
    "q10": "string"
  }
}
```

**Example Request:**
```json
{
  "email": "guest@example.com",
  "answers": {
    "q1": "Wedding (Evening party)",
    "q2": "High-energy",
    "q3": "Champagne",
    "q4": "26-35",
    "q5": "ABBA",
    "q6": "Absolutely",
    "q7": ["70s", "90s", "00s"],
    "q8": ["Pop", "Chart"],
    "q9": "Up and bouncing",
    "q10": "No heavy metal"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Playlist sent to email!"
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Email is required"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to process quiz"
  }
  ```

**Notes:**
- Creates a guest user automatically if email doesn't exist
- Generates a default playlist with 15 songs
- Sends email notification with playlist link
- Quiz status: `processing` → `done` or `failed`

---

### 7. Submit User Quiz

**Endpoint:** `POST /api/v1/quiz/user/submit`

**Description:** Submit a quiz as an authenticated user. Can request a premium playlist (50 songs) which requires payment, or get a default playlist (15 songs) immediately.

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "answers": {
    "q1": "string",
    "q2": "string",
    "q3": "string",
    "q4": "string",
    "q5": "string",
    "q6": "string",
    "q7": ["string", "string"],
    "q8": ["string", "string"],
    "q9": "string",
    "q10": "string"
  },
  "user_type": "string (required, enum: ['free', 'paid'])"
}
```

**Example Request (Free Playlist):**
```json
{
  "answers": {
    "q1": "Wedding (Evening party)",
    "q2": "High-energy",
    "q3": "Champagne",
    "q4": "26-35",
    "q5": "ABBA",
    "q6": "Absolutely",
    "q7": ["70s", "90s", "00s"],
    "q8": ["Pop", "Chart"],
    "q9": "Up and bouncing",
    "q10": "No heavy metal"
  },
  "user_type": "free"
}
```

**Example Request (Premium Playlist):**
```json
{
  "answers": {
    "q1": "Wedding (Evening party)",
    "q2": "High-energy",
    "q3": "Champagne",
    "q4": "26-35",
    "q5": "ABBA",
    "q6": "Absolutely",
    "q7": ["70s", "90s", "00s"],
    "q8": ["Pop", "Chart"],
    "q9": "Up and bouncing",
    "q10": "No heavy metal"
  },
  "user_type": "paid"
}
```

**Success Response - Free (200):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "type": "default",
    "playlist": {
      "_id": "playlist_id",
      "quizId": "quiz_id",
      "userId": "user_id",
      "title": "Golden Nostalgia Party Mix",
      "description": "A nostalgic blend of 70s, 80s, 90s and modern dance-pop...",
      "tracks": [
        {
          "artist": "ABBA",
          "song": "Dancing Queen"
        }
      ],
      "spotify_url": "https://open.spotify.com/playlist/...",
      "song_count": 15,
      "playlist_type": "default",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "quizId": "quiz_id"
  }
}
```

**Success Response - Premium (200):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "type": "premium_payment",
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_...",
    "quizId": "quiz_id"
  }
}
```

**Error Responses:**
- **401 Unauthorized:**
  ```json
  {
    "success": false,
    "message": "Unauthorized"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Error message"
  }
  ```

**Notes:**
- `user_type: "free"` → Generates playlist immediately (15 songs)
- `user_type: "paid"` → Creates Stripe checkout session (50 songs after payment)
- Premium playlists are generated via webhook after successful payment
- Quiz status for premium: `pending` → `done` (after webhook)

---

## 🎶 Playlist Routes

Base path: `/api/v1/playlists`

### 8. Get Guest Playlist

**Endpoint:** `GET /api/v1/playlists/guest/playlist/:id`

**Description:** Retrieve a playlist by quiz ID (for guest users).

**Authentication:** Not required

**URL Parameters:**
- `id` (string, required) - Quiz ID

**Example Request:**
```
GET /api/v1/playlists/guest/playlist/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Guest playlist fetched successfully",
  "data": {
    "_id": "playlist_id",
    "quizId": "quiz_id",
    "userId": "user_id",
    "title": "Golden Nostalgia Party Mix",
    "description": "A nostalgic blend of 70s, 80s, 90s and modern dance-pop...",
    "tracks": [
      {
        "artist": "ABBA",
        "song": "Dancing Queen"
      }
    ],
    "spotify_url": "https://open.spotify.com/playlist/...",
    "song_count": 15,
    "playlist_type": "default",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Playlist not found"
  }
  ```

---

### 9. Get User Playlist

**Endpoint:** `GET /api/v1/playlists/user/playlist`

**Description:** Retrieve all playlists for the authenticated user, sorted by creation date (oldest first).

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Example Request:**
```
GET /api/v1/playlists/user/playlist
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User playlist fetched successfully",
  "data": [
    {
      "_id": "playlist_id",
      "quizId": "quiz_id",
      "userId": "user_id",
      "title": "Golden Nostalgia Party Mix",
      "description": "A nostalgic blend of 70s, 80s, 90s and modern dance-pop...",
      "tracks": [
        {
          "artist": "ABBA",
          "song": "Dancing Queen"
        }
      ],
      "spotify_url": "https://open.spotify.com/playlist/...",
      "song_count": 15,
      "playlist_type": "default",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "playlist_id_2",
      "playlist_type": "premium",
      "song_count": 50,
      ...
    }
  ]
}
```

**Error Responses:**
- **401 Unauthorized:**
  ```json
  {
    "success": false,
    "message": "Unauthorized"
  }
  ```
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Playlist not found"
  }
  ```

**Notes:**
- Returns all playlists (both default and premium) for the authenticated user
- Sorted by creation date (oldest first)

---

## 💳 Payment Routes

Base path: `/api/v1/stripe/payment`

### 10. Stripe Webhook

**Endpoint:** `POST /api/v1/stripe/payment/webhook`

**Description:** Stripe webhook endpoint to handle payment events. Processes `checkout.session.completed` events to generate premium playlists after successful payment.

**Authentication:** Not required (uses Stripe signature verification)

**Headers:**
```
stripe-signature: <stripe_signature>
Content-Type: application/json
```

**Request Body:** Raw JSON body (Stripe event object)

**Note:** This endpoint uses `express.raw({ type: "application/json" })` middleware to receive the raw body required for Stripe signature verification.

**Webhook Event Handled:**
- `checkout.session.completed` - Creates a premium playlist (50 songs) after successful payment

**Expected Metadata in Stripe Session:**
```json
{
  "quizId": "quiz_id",
  "userId": "user_id",
  "premium": "true"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Premium playlist generated successfully"
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Webhook Error"
  }
  ```

**Notes:**
- Returns 200 OK immediately to Stripe
- Heavy processing (AI calls, DB operations) happens asynchronously
- Includes idempotency check to prevent duplicate playlists
- Errors are logged but don't cause webhook retries

---

## 🏠 Root Routes

### 11. Welcome Route

**Endpoint:** `GET /`

**Description:** Welcome message for the API.

**Authentication:** Not required

**Success Response (200):**
```json
{
  "message": "Welcome to the Rory Backend"
}
```

---

### 12. Health Check

**Endpoint:** `GET /health`

**Description:** Health check endpoint to verify API is running.

**Authentication:** Not required

**Success Response (200):**
```json
{
  "status": "OK"
}
```

---

## 🔄 Webhook Architecture

The Stripe webhook handler follows best practices:

1. **Immediate Response**: Returns 200 OK immediately to Stripe
2. **Background Processing**: Heavy work (AI calls, DB operations) runs asynchronously
3. **Idempotency**: Prevents duplicate playlist creation
4. **Error Handling**: Errors are logged but don't cause webhook retries

**Flow:**
```
Stripe → Webhook → Verify Signature → Return 200 OK
                              ↓
                    Background Processing
                              ↓
                    AI Service → Create Playlist → Update Quiz
```

---

## 📊 Data Models

### User
```javascript
{
  name: String,
  email: String (unique, required),
  password: String (hashed),
  type: String (enum: ["guest", "user"]),
  passwordResetOTP: Number,
  passwordResetExpires: Date,
  isOTPVerified: Boolean,
  isPremium: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Quiz
```javascript
{
  userId: ObjectId (ref: "User"),
  answers: Object (required),
  status: String (enum: ["pending", "processing", "done", "failed"]),
  song_count: Number (default: 15),
  vibe_details: Object,
  is_premium_requested: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Playlist
```javascript
{
  quizId: ObjectId (ref: "Quiz", unique),
  userId: ObjectId (ref: "User"),
  title: String,
  description: String,
  tracks: Array,
  spotify_url: String,
  song_count: Number,
  playlist_type: String (enum: ["default", "premium"]),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Authentication

Protected routes require a JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

**Protected Routes:**
- `POST /api/v1/quiz/user/submit`
- `GET /api/v1/playlists/user/playlist`

**Authentication Errors:**
- `401 Unauthorized` - No token provided
- `401 Unauthorized` - Invalid/expired token

**JWT Token Format:**
- Contains: `id` (user ID), `email` (user email)
- Expires: Based on `JWT_EXPIRES_IN` environment variable (default: 7d)

---

## 📧 Email Configuration

The application uses **Hostinger SMTP** for sending emails:

- **Host**: `smtp.hostinger.com`
- **Port**: `587`
- **Encryption**: STARTTLS
- **Authentication**: Required

**Email Templates:**
- Guest playlist completion notifications
- Password reset OTP codes

---

## ⚠️ Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚨 Common Issues & Solutions

### 1. AI Service Connection Errors
**Error**: `ECONNRESET` or `socket hang up`

**Solutions:**
- Verify `AI_ENDPOINT` is correct and accessible
- Check AI service is running
- Ensure network/firewall allows connections
- Check AI service logs for errors

### 2. Stripe Webhook Failures
**Error**: Webhook signature verification fails

**Solutions:**
- Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Verify webhook endpoint uses raw body parsing
- Check webhook URL is publicly accessible
- Verify webhook is configured in Stripe dashboard

### 3. Email Sending Failures
**Error**: Email not sent

**Solutions:**
- Verify Hostinger SMTP credentials
- Check email account is active
- Ensure port 587 is not blocked
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct

### 4. Authentication Errors
**Error**: `401 Unauthorized`

**Solutions:**
- Verify JWT token is included in Authorization header
- Check token hasn't expired
- Ensure `JWT_SECRET` matches between token creation and verification
- Verify token format: `Bearer <token>`

---

## 🧪 Testing

### Manual Testing with cURL

**Register User:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Submit Guest Quiz:**
```bash
curl -X POST http://localhost:3000/api/v1/quiz/guest/submit \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@example.com","answers":{"q1":"Wedding","q2":"High-energy"}}'
```

**Get Guest Playlist:**
```bash
curl -X GET http://localhost:3000/api/v1/playlists/guest/playlist/QUIZ_ID
```

**Submit User Quiz (with token):**
```bash
curl -X POST http://localhost:3000/api/v1/quiz/user/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"answers":{"q1":"Wedding"},"user_type":"free"}'
```

**Get User Playlist (with token):**
```bash
curl -X GET http://localhost:3000/api/v1/playlists/user/playlist \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use secure MongoDB connection (Atlas recommended)
- [ ] Use strong `JWT_SECRET`
- [ ] Configure CORS with specific origins
- [ ] Set up Stripe webhook endpoint in Stripe dashboard
- [ ] Verify email SMTP credentials
- [ ] Ensure AI service is accessible
- [ ] Set up process manager (PM2 recommended)
- [ ] Configure reverse proxy (nginx)
- [ ] Enable HTTPS/SSL

### PM2 Setup
```bash
npm install -g pm2
pm2 start src/server.js --name roryclerk-api
pm2 save
pm2 startup
```

---

## 📝 Notes

- Guest users receive default playlists (15 songs) via email
- Premium playlists (50 songs) require Stripe payment (€9.00)
- Webhook processing is asynchronous to ensure fast Stripe responses
- All passwords are hashed with bcryptjs (12 rounds)
- Quiz status tracks: `pending` → `processing` → `done` / `failed`
- OTP expires in 10 minutes
- JWT tokens are also set as HTTP-only cookies for additional security

---

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for Soundtrack My Night**


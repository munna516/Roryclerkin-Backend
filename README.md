# Rory Clerk API

A Node.js/Express API for managing quizzes, playlists, user authentication, and payment processing with Stripe integration.

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
  - [Authentication Routes](#authentication-routes)
  - [Quiz Routes](#quiz-routes)
  - [Playlist Routes](#playlist-routes)
  - [Payment Routes](#payment-routes)
- [Models](#models)
- [Authentication](#authentication)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Stripe account (for payment processing)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
ALLOWED_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Start the development server:
```bash
npm run dev
```

5. Start the production server:
```bash
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | No (default: 3000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | Yes |
| `ALLOWED_ORIGIN` | CORS allowed origin | No (default: "*") |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `EMAIL_USER` | Email address for sending emails | Yes |
| `EMAIL_PASS` | Email password | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |

## API Routes

Base URL: `/api/v1`

### Authentication Routes

Base path: `/api/v1/auth/users`

#### 1. Register User

**Endpoint:** `POST /api/v1/auth/users/register`

**Description:** Register a new user or upgrade a guest user to a registered user.

**Body Parameters:**
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

**Response:**
- **Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

- **Error (400):**
```json
{
  "success": false,
  "message": "Name, email and password are required"
}
```

---

#### 2. Login User

**Endpoint:** `POST /api/v1/auth/users/login`

**Description:** Authenticate a user and return a JWT token.

**Body Parameters:**
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

**Response:**
- **Success (200):**
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

- **Error (400):**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

---

### Quiz Routes

Base path: `/api/v1/quiz`

#### 3. Submit Guest Quiz

**Endpoint:** `POST /api/v1/quiz/guest/submit`

**Description:** Submit a quiz as a guest user. Creates a guest user if email doesn't exist, generates a default playlist (15 songs), and sends an email with the playlist link.

**Authentication:** Not required

**Body Parameters:**
```json
{
  "email": "string (required)",
  "answers": "object (required)"
}
```

**Example Request:**
```json
{
  "email": "guest@example.com",
  "answers": {
    "question1": "answer1",
    "question2": "answer2"
  }
}
```

**Response:**
- **Success (200):**
```json
{
  "success": true,
  "message": "Playlist sent to email!",
  "data": {
    "success": true,
    "message": "Playlist sent to email!",
    "playlistLink": "http://frontend-url/playlist/quiz_id"
  }
}
```

- **Error (400):**
```json
{
  "success": false,
  "message": "Email is required"
}
```

---

#### 4. Submit User Quiz

**Endpoint:** `POST /api/v1/quiz/user/submit`

**Description:** Submit a quiz as an authenticated user. Can request a premium playlist (50 songs) which requires payment, or get a default playlist (15 songs) immediately.

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body Parameters:**
```json
{
  "answers": "object (required)",
  "isPremiumRequested": "boolean (optional, default: false)"
}
```

**Example Request (Default Playlist):**
```json
{
  "answers": {
    "question1": "answer1",
    "question2": "answer2"
  },
  "isPremiumRequested": false
}
```

**Example Request (Premium Playlist):**
```json
{
  "answers": {
    "question1": "answer1",
    "question2": "answer2"
  },
  "isPremiumRequested": true
}
```

**Response (Default Playlist - 200):**
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
      "playlist_type": "default"
    },
    "quizId": "quiz_id"
  }
}
```

**Response (Premium Request - 200):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "type": "premium_payment",
    "checkoutUrl": "https://checkout.stripe.com/...",
    "quizId": "quiz_id"
  }
}
```

---

### Playlist Routes

Base path: `/api/v1/playlists`

#### 5. Get Guest Playlist

**Endpoint:** `GET /api/v1/playlists/guest/playlist/:id`

**Description:** Retrieve a playlist by quiz ID (for guest users).

**Authentication:** Not required

**URL Parameters:**
- `id` (string, required) - Quiz ID

**Example Request:**
```
GET /api/v1/playlists/guest/playlist/507f1f77bcf86cd799439011
```

**Response:**
- **Success (200):**
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

- **Error (404):**
```json
{
  "success": false,
  "message": "Playlist not found"
}
```

---

#### 6. Get User Playlist

**Endpoint:** `GET /api/v1/playlists/user/playlist`

**Description:** Retrieve the most recent playlist for the authenticated user.

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
- **Success (200):**
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
    }
  ]
}
```

- **Error (404):**
```json
{
  "success": false,
  "message": "Playlist not found"
}
```

---

### Payment Routes

Base path: `/api/v1/payment`

#### 7. Stripe Webhook

**Endpoint:** `POST /api/v1/payment/webhook`

**Description:** Stripe webhook endpoint to handle payment events. Processes `checkout.session.completed` events to generate premium playlists after successful payment.

**Authentication:** Not required (uses Stripe signature verification)

**Headers:**
```
stripe-signature: <stripe_signature>
Content-Type: application/json
```

**Body:** Raw JSON body (Stripe event object)

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

**Response:**
- **Success (200):**
```json
{
  "success": true,
  "message": "Premium playlist generated successfully"
}
```

- **Error (400):**
```json
{
  "success": false,
  "message": "Webhook Error"
}
```

---

## Models

### User Model

```javascript
{
  name: String,
  email: String (unique, required),
  password: String,
  type: String (enum: ["guest", "user"]),
  createdAt: Date,
  updatedAt: Date
}
```

### Quiz Model

```javascript
{
  userId: ObjectId (ref: "User", default: null),
  answers: Object (required),
  status: String (enum: ["pending", "processing", "done", "failed"], default: "pending"),
  song_count: Number (default: 15),
  vibe_details: Object (default: null),
  is_premium_requested: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Playlist Model

```javascript
{
  quizId: ObjectId (ref: "Quiz", unique: true),
  userId: ObjectId (ref: "User", default: null),
  title: String,
  description: String,
  tracks: Array,
  spotify_url: String,
  song_count: Number,
  playlist_type: String (enum: ["default", "premium"], default: "default"),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication

### JWT Token

Most protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Token Format

The JWT token contains:
- `id`: User ID
- `email`: User email
- `exp`: Expiration time

### Protected Routes

The following routes require authentication:
- `POST /api/v1/quiz/user/submit`
- `GET /api/v1/playlists/user/playlist`

### Authentication Middleware

The `authMiddleware` validates the JWT token and attaches the user object to `req.user`. If authentication fails, it returns:
- `401 Unauthorized` - No token provided
- `401 Unauthorized` - Invalid token
- `401 Unauthorized` - Token expired

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Notes

- Guest users can submit quizzes without registration, but will receive a default playlist (15 songs)
- Registered users can request premium playlists (50 songs) which require payment via Stripe
- Premium playlists are generated automatically after successful Stripe payment via webhook
- All passwords are hashed using bcryptjs before storage
- Email notifications are sent to guest users with playlist links

---

## License

ISC


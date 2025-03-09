# Harbinger Chat API (v2)

## Overview

Harbinger Chat API is a RESTful API that facilitates chat functionality, including creating, managing, and deleting chats, topics, and messages. It provides structured routes for handling user conversations efficiently.

## Base URL

```
/harbinger/api/v2
```

## Installation

### Prerequisites

- Node.js (>= 14.x)
- MongoDB
- npm

### Setup

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd harbinger
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:

   - Create a `.env` file in the root directory.
   - Add necessary configurations (e.g., database URL, port).

4. Start the server:
   ```sh
   npm start
   ```

## API Routes

### **Chat Routes** (`/chats`)

| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| GET    | `/`                         | Get all chats                        |
| POST   | `/`                         | Create a new chat                    |
| GET    | `/:chatId`                  | Get a chat by its ID                 |
| DELETE | `/:chatId`                  | Delete a chat by its ID              |
| GET    | `/person/:personId`         | Get all chats for a specific user    |
| DELETE | `/person/:personId`         | Delete all chats for a specific user |
| DELETE | `/:chatId/person/:personId` | Remove a user from a chat            |

### **Message Routes** (`/messages`)

| Method | Endpoint                       | Description                                    |
| ------ | ------------------------------ | ---------------------------------------------- |
| GET    | `/`                            | Get all messages                               |
| POST   | `/`                            | Create a new message                           |
| DELETE | `/`                            | Delete all messages                            |
| GET    | `/:messageId`                  | Get a message by its ID                        |
| PATCH  | `/:messageId`                  | Update a message by its ID                     |
| DELETE | `/:messageId`                  | Delete a message by its ID                     |
| GET    | `/topic/:topicId`              | Get all messages in a topic                    |
| DELETE | `/topic/:topicId`              | Delete all messages in a topic                 |
| GET    | `/person/:personId`            | Get all messages by a user                     |
| DELETE | `/:messageId/person/:personId` | Delete a message by its ID for a specific user |

### **Topic Routes** (`/topics`)

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| GET    | `/`                          | Get all topics             |
| POST   | `/`                          | Create a new topic         |
| GET    | `/:topicId`                  | Get a topic by its ID      |
| DELETE | `/:topicId`                  | Delete a topic by its ID   |
| GET    | `/chat/:chatId`              | Get all topics for a chat  |
| DELETE | `/:topicId/person/:personId` | Remove a user from a topic |

## Technologies Used

- **Backend:** Node.js, Express.js, Socket.IO, Apache Kafka
- **Database:** Prisma ORM with MongoDB

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Make your changes and commit (`git commit -m "Added new feature"`)
4. Push to the branch (`git push origin feature-name`)
5. Create a Pull Request

## License

This project is licensed under [MIT License](LICENSE).

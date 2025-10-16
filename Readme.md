
<div align="center">
   
# EVENT-MANAGEMENT-API-TASK
**_Built with the tools and technologies:_**

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-000000?style=flat-square&logo=json&logoColor=white)
![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=flat-square&logo=nodemon&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=black)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white)


</div>


## Overview

Event Management API Task is a backend project developed as part of an internship assignment. It provides a RESTful API for managing events, including creation, update, deletion, and retrieval. The project is built with JavaScript and it's run environment and is designed to be simple, scalable, and easy to integrate with frontend or mobile clients.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/saurabh7071/Event-Management-API-Task.git
   cd Event-Management-API-Task
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` and update values as needed.

4. **Run the server**
   ```bash
   npm start
   # Or for development mode
   npm run dev
   ```

## API Endpoints

### 1. Create Event

- **POST** `/events/createEvent`
- **Request Body Example:**
  ```json
  {
    "title": "Habitant",
    "event_date": "2025-10-16T05:43:00Z",
    "location": "New York",
    "capacity": 2
  }
  ```
- **Success Response:**
  ```json
  {
    "id": "1",
    "name": "Habitant",
    "date": "2025-10-16T05:43:00Z",
    "location": "New York",
    "capacity": 2,
    "createdAt": "2025-10-16T06:44:12Z"
  }
  ```

### 2. Get Event Detail

- **GET** `/events/getEventDetails/<eventId>`
- **Success Response:**
  ```json
  {
    "statusCode": 200,
    "data": {
        "eventid": 3,
        "title": "Fest",
        "event_date": "2025-10-16T11:12:00.000Z",
        "location": "Tokeyo",
        "capacity": 2,
        "created_at": "2025-10-16T05:40:54.773Z",
        "registered_users_count": 2,
        "registered_users": [
            {
                "userid": 1,
                "name": "John Doe",
                "email": "john.doe@example.com"
            },
            {
                "userid": 2,
                "name": "Sam",
                "email": "addfkdja@gmail.com"
            }
        ]
    },
    "message": "Event details with registered users retrieved successfully",
    "success": true
  }
  ```

### 3. Upcoming Events

- **GET** `/events/getUpcomingEvents`

- **Success Response:**
  ```json
  {
    "statusCode": 200,
    "data": [
        {
            "eventid": 2,
            "title": "technokret",
            "event_date": "2025-11-01T10:00:00.000Z",
            "location": "xyz",
            "capacity": 200,
            "created_at": "2025-10-15T19:27:26.606Z"
        },
        {
            "eventid": 3,
            "title": "Habitant",
            "event_date": "2025-11-01T10:00:00.000Z",
            "location": "abc",
            "capacity": 500,
            "created_at": "2025-10-15T19:32:51.127Z"
        },
        {
            "eventid": 1,
            "title": "My Event",
            "event_date": "2025-11-01T10:00:00.000Z",
            "location": "New York",
            "capacity": 200,
            "created_at": "2025-10-15T17:36:53.594Z"
        }
    ],
    "message": "Upcoming events retrieved successfully",
    "success": true
  }
  ```

### 4. Event States

- **GET** `/events/eventStats/<eventId>`
- **Success Response:**
  ```json
  {
    "statusCode": 200,
    "data": {
        "eventid": 4,
        "title": "Habitant",
        "capacity": 2,
        "totalRegistrations": 2,
        "remainingCapacity": 0,
        "percentageUsed": 100
    },
    "message": "Event statistics retrieved successfully",
    "success": true
  }
  ```

### 5. User Register for an Event

- **POST** `/registrations/registerUserForEvent/<eventId>`
- **Request Body Example:**
  ```json
  {  
    "userid": 3
  }
  ```
- **Success Response:**
  ```json
  {
    "statusCode": 201,
    "data": {
        "uniqueid": "5759afe9-2aaf-4a7f-b6f1-d300d8d167a8",
        "registered_at": "2025-10-16T07:38:21.349Z",
        "userid": 3,
        "eventid": <eventId>
    },
    "message": "User registered for event successfully",
    "success": true
  }
  ```

### 6. Cancel User Registration

- **POST** `/registrations/cancelRegistration/<eventId>`
- **Request Body Example:**
  ```json
  {  
    "userid": 3
  }
  ```
- **Success Response:**
  ```json
  {
    "statusCode": 200,
    "data": null,
    "message": "User registration successfully cancelled",
    "success": true
  }
  ```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed for educational and internship purposes.

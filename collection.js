// Postman Collection Export for StudyBuddy API
const collection = {
  "info": {
    "name": "StudyBuddy API",
    "description": "Complete API collection for StudyBuddy application with authentication, courses, notes, and AI features",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "POST /auth/signup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"fullName\": \"Test User\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/signup",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "auth",
                "signup"
              ]
            },
            "description": "Create a new user account. Returns JWT token and user data."
          },
          {
          "name": "POST /auth/login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "auth",
                "login"
              ]
            },
            "description": "Authenticate existing user. Returns JWT token and user data."
          },
          {
          "name": "POST /auth/logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/auth/logout",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "auth",
                "logout"
              ]
            },
            "description": "Logout endpoint (client-side token removal)."
          },
          {
          "name": "GET /auth/me",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/auth/me",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "auth",
                "me"
              ]
            },
            "description": "Get current authenticated user information."
          },
          {
            "name": "GET /auth/providers",
            "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/auth/providers",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "auth",
                "providers"
              ]
            },
            "description": "Get available authentication providers (currently empty - OAuth removed)."
          }
        ],
        "response": []
      }
    },
    {
      "name": "Courses Management",
      "item": [
        {
          "name": "GET /courses",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/courses",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "courses"
              ]
            },
            "description": "List all courses with note counts. Public endpoint - no authentication required."
          },
          {
          "name": "POST /courses",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Advanced React Development\",\n  \"emoji\": \"⚛️\",\n  \"color\": \"theme-blue\",\n  \"description\": \"Master React with hooks, context, and modern patterns\",\n  \"learningPath\": [\n    {\"id\": 1, \"day\": \"Day 1\", \"topic\": \"React Hooks Deep Dive\"},\n    {\"id\": 2, \"day\": \"Day 2\", \"topic\": \"Context API & State Management\"},\n    {\"id\": 3, \"day\": \"Day 3\", \"topic\": \"Performance Optimization\"}\n  ]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/courses",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "courses"
              ]
            },
            "description": "Create a new course. Requires authentication. User becomes course owner."
          },
          {
          "name": "GET /courses/:id",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/courses/{{courseId}}",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "courses",
                "{{courseId}}"
              ]
            },
            "description": "Get single course by ID. Requires authentication."
          },
          {
          "name": "PUT /courses/:id",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Updated React Course\",\n  \"description\": \"Updated description for React course\",\n  \"learningPath\": [\n    {\"id\": 1, \"day\": \"Day 1\", \"topic\": \"Updated React Hooks\"}\n  ]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/courses/{{courseId}}",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "courses",
                "{{courseId}}"
              ]
            },
            "description": "Update existing course. Only course owner can modify. Requires authentication."
          },
          {
          "name": "DELETE /courses/:id",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/courses/{{courseId}}",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "courses",
                "{{courseId}}"
              ]
            },
            "description": "Delete a course and all associated notes. Requires authentication."
          }
        ],
        "response": []
      }
    },
    {
      "name": "Notes Management",
      "item": [
        {
          "name": "GET /courses/:courseId/notes",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/courses/{{courseId}}/notes",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "courses",
                "{{courseId}}",
                "notes"
              ]
            },
            "description": "List all notes within a specific course. Requires authentication."
          },
          {
          "name": "POST /courses/:courseId/notes",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Introduction to React\",\n  \"body\": \"React is a JavaScript library for building user interfaces...\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/courses/{{courseId}}/notes",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "courses",
                "{{courseId}}",
                "notes"
              ]
            },
            "description": "Create a new note within a course. Requires authentication."
          },
          {
          "name": "PUT /courses/:courseId/notes/:id",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Updated React Introduction\",\n  \"body\": \"Updated content about React...\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/courses/{{courseId}}/notes/{{noteId}}",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "courses",
                "{{courseId}}",
                "notes",
                "{{noteId}}"
              ]
            },
            "description": "Update an existing note. Requires authentication."
          },
          {
          "name": "DELETE /courses/:courseId/notes/:id",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/courses/{{courseId}}/notes/{{noteId}}",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "courses",
                "{{courseId}}",
                "notes",
                "{{noteId}}"
              ]
            },
            "description": "Delete a specific note. Requires authentication."
          }
        ],
        "response": []
      }
    },
    {
      "name": "AI Features",
      "item": [
        {
          "name": "POST /courses/:courseId/notes/:id/summarize",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/courses/{{courseId}}/notes/{{noteId}}/summarize",
              "host": [
                "{{baseUrl}}"
              ],
              "path": [
                "courses",
                "{{courseId}}",
                "notes",
                "{{noteId}}",
                "summarize"
              ]
            },
            "description": "Generate AI-powered summary for a note. Requires authentication. Uses external AI service to create concise summary of note content."
          }
        ],
        "response": []
      }
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "exec": [
          ""
        ]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          ""
        ]
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "authToken",
      "value": "{{authToken}}",
      "type": "string"
    },
    {
      "key": "courseId",
      "value": "{{courseId}}",
      "type": "string"
    },
    {
      "key": "noteId",
      "value": "{{noteId}}",
      "type": "string"
    }
  ]
};

// Export for Postman import
console.log(JSON.stringify(collection, null, 2));

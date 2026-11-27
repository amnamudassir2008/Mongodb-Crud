// Config - Database connection
// models - Data structure
// controllers - CRUD logic
// routes - API endpoints
// server.js - Entry point
// .env - secret things
// package.json - dependencies

// Command
npm init -y
npm install express mongoose dotenv cors
npm install -D nodemon

// Express - backend server or API's bnana
// Mongoose - MongoDB se connect or data manage krne k liye
// Dotenv - Environment variables read krna 
// CORS - Frontend-backend communication allow krna
// nodemon - code change hone pr server restart krna


// Mongoose Method
//1. Create: Student.create() 
//2. Read All: Student.find()
//3. Read One: Student.findById()
//4. Update: Student.findByIdAndUpdate()
//5. Delete: Student.findByIdAndDelete()

//Terms:
req: Client ki traf se aane wali request
res: Server ki traf se bheje jane wala response
req.body: Client ko bheja hua data
req.params.id: URL m diya gya student ID
try/catch: Errors handle krne k liye

// Routes
POST - Create
GET - Show
PUT - Update
DELETE - delete

// JWT_SECRET 
Ye ek secret key he jo server JWT token generate or verify krne k liye use krega.

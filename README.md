# FitHive
FitHive is a modern gym and activewear website offering a fully customized shopping experience. Users can explore fitness collections, customize product size, color, and quantity, manage their cart, and browse through an intuitive and responsive UI. Built for smooth performance, clean design, and a user-friendly fitness shopping journey.

## Features
- Browse gym and activewear collections
- Product detail pages with pricing, discounts, and size charts
- Product customization (size, color, quantity) for eligible items
- Shopping cart and wishlist functionality
- Razorpay demo payment gateway integration
- Integrated chatbot for user assistance
- Product search using Fuse.js
- Session-based user assumed flow
- Responsive and mobile-friendly UI


## Tech Stack

### Frontend
- CSS3
- JavaScript
- EJS (Embedded JavaScript Templates)

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Local Server)
- Mongoose ODM

### Payment Gateway
- Razorpay (Demo / Test Mode)

### Additional Tools & Libraries
- Fuse.js (search functionality)
- Express-session (session management)
- Bcrypt / Bcryptjs (password encryption)
- Nodemailer & Resend (email services)
- OpenAI SDK (chatbot integration)


## Environment Variables
The project uses environment variables for sensitive configuration such as:
- MongoDB connection string
- Razorpay API keys (test mode)
- Session secrets
- Email service credentials

These are stored securely in a `.env` file.

## How to Run the Project

1. Clone the repository  
   git clone https://github.com/muskan5091/FitHive

2. Navigate to the project directory  
   cd FitHive

3. Install dependencies  
   npm install

4. Create a `.env` file and add required credentials

5. Start MongoDB (local server)

6. Run the application  
   npm start

7. Open in browser  
   http://localhost:3000

## Payment Gateway
- Razorpay is integrated in demo/test mode
- Used to simulate checkout and payment flow
- No real financial transactions are processed

## Limitations
- Razorpay is configured in demo mode only
- Order tracking is static
- Authentication is minimal and not production-grade
- MongoDB is used locally, not deployed on cloud


## Future Enhancements
- User authentication and profile management
- Real-time order tracking
- Admin dashboard for product and order management
- Production Razorpay integration
- Cloud database deployment

## Academic Note
This project is developed for academic and learning purposes.

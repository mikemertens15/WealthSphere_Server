# WealthSphere Backend Server

This is the backend server for WealthSphere, a comprehensive financial management application. It handles user authentication, data processing, API integrations, and serves as the backbone for the application's core functionalities.

## Technologies

- **Node.js:** For the server runtime environment.
- **Express.js:** As the web application framework.
- **Mongoose:** For MongoDB object modeling.
- **Jest:** Used for testing the application.

## API Endpoints

The backend server provides several key API endpoints:

- **User Authentication:**
  - `POST /login` and `POST /register`: Handles user login and registration. Returns errors for issues like incorrect password or non-existent users.
  
- **Dashboard Data:**
  - `GET /dashboard`: Retrieves user-specific dashboard data including net worth, recent transactions, and budget snapshots.

- **Plaid Integration:**
  - Two endpoints dedicated to the creation and management of Plaid items for bank account linking.

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mikemertens15/WealthSphere_Server.git
   ```
2. Install Dependencies:
   ```bash
   npm install
   ```
3. Set up Services
   * Make a mongoDB account and set up an atlas cluster. Set an environment variable for the connection string
   * Create a plaid account, and copy over API Keys. Create environment variables for those and the config details
     
## Running the Server
Execute `npm start` to run the server.

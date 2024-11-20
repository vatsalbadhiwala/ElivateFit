# React App Setup Guide

This guide will help you set up and run the React application locally. Follow these steps carefully to get started.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A code editor (VS Code, Sublime Text, etc.)
- Git (for version control)

## Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/1samzi/fitness-app.git
   cd frontend
    
  2. **Install Dependencies**

```shellscript
 npm install

```

This will install all the required dependencies listed in `package.json`.


## Running the Application

1. **Start the Development Server**

```shellscript
npm start

```

This will start the development server on `http://localhost:3000`


2. **Access the Application**

  - Open your web browser
  - Navigate to `http://localhost:3000`
  - You should see the application running





## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from create-react-app (one-way operation)


## Troubleshooting

If you encounter any issues:

1. **Dependencies Issues**

```shellscript
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clear npm cache if needed
npm cache clean --force

```


2. **Module Not Found Errors**

- Ensure all dependencies are properly installed
- Try deleting `package-lock.json` and running `npm install` again





## Project Structure
```
frontend/
├── node_modules/     # Dependencies
├── public/          # Static files
├── src/             # Source code
│   ├── components/  # React components
│   ├── App.css     # App-specific styles
│   ├── App.js      # Root App component
│   ├── index.css   # Global styles
│   └── index.js    # Entry point
├── .gitignore      # Git ignore rules
├── package.json    # Project configuration
└── README.md       # Documentation
```

## Additional Notes

- The application uses React 18 and modern JavaScript features
- Make sure your Node.js version is compatible (v14 or higher recommended)
- For API calls, the backend server should be running on port 3001


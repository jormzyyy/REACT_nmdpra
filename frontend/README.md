# NMDPRA Frontend (React)

This is the React.js frontend for the NMDPRA Store Management System.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Backend Integration

Make sure your Flask backend is running on `http://localhost:8000` for the proxy to work correctly.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

### Features Implemented

- ✅ Login page with dual authentication (email/password and Microsoft OAuth)
- ✅ Dashboard with user profile and quick actions
- ✅ Authentication context and protected routes
- ✅ Exact styling match with original Flask templates
- ✅ SweetAlert2 integration for notifications
- ✅ Responsive design

### Next Steps

To continue converting the rest of the application:

1. **Inventory Management**
   - Create inventory list component
   - Add/edit/delete inventory items
   - Category management

2. **Request Management**
   - Create request form
   - Request history
   - Admin request approval

3. **Reports**
   - Inventory reports
   - Export functionality

4. **Purchases**
   - Purchase recording
   - Purchase history

Each component should maintain the exact same styling and functionality as the original Flask templates.
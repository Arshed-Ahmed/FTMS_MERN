# FTMS Client (Frontend)

The frontend application for the Fashion Tailoring Management System, built with React and Vite.

## Tech Stack

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router Dom
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Components**: Custom reusable components (DataTable, Layout, etc.)

## Project Structure

- `src/components/`: Reusable UI components (Header, Sidebar, DataTable, Layout).
- `src/pages/`: Individual page views (Dashboard, OrderList, CustomerForm, etc.).
- `src/context/`: Global state management (AuthContext).
- `src/constants.js`: Global constants (API URL).

## Key Features

- **Responsive Design**: Built with Tailwind CSS for mobile and desktop.
- **DataTables**: Custom component for sorting, filtering, and pagination.
- **Authentication**: Protected routes based on login status and roles.
- **Print Layouts**: Specialized CSS for printing invoices and reports.

## Setup & Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env` file in the root of the `client` directory:

   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

## Maintenance

- **Adding Pages**: Create a component in `src/pages/`, add a route in `App.jsx`.
- **Navigation**: Add links to `src/components/Sidebar.jsx`.
- **API Calls**: Use `axios` with `withCredentials: true` for authenticated requests.

## Future Improvements

- **Dark Mode**: Implement system-wide dark mode using Tailwind.
- **PWA**: Convert to a Progressive Web App for offline capabilities.
- **Kanban Board**: Drag-and-drop interface for Job Cards.
- **Advanced Charts**: More detailed analytics using Recharts or Chart.js.

# Budget Tracking App - Frontend

## Overview

A modern, responsive Budget Tracking App built with React 19, TypeScript, and Tailwind CSS. Features a comprehensive dashboard for expense management, real-time notifications, and a beautiful user interface built with shadcn/ui components.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **State Management**: React Context API with custom hooks
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form with validation
- **Icons**: Heroicons and Lucide React
- **Date Handling**: date-fns for date manipulation
- **Development**: ESLint, TypeScript, PostCSS

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/         # shadcn/ui base components
│   └── ...         # Custom components
├── context/         # React Context providers
├── pages/          # Application routes
├── services/       # API integration layer
├── types/          # TypeScript type definitions
├── assets/         # Images and static resources
└── styles/         # Global CSS and Tailwind config
```

## Features

### 📈 Analysis Chart (new)

- Line chart built with Recharts to visualize expenses over time
- Filters: Last Month (daily), Last 6 Months (monthly), Last 12 Months (monthly)
- Budget limit reference line with red highlights when exceeded
- Rich tooltip with date and amount, including over‑budget indicator
- Removed the old 4‑metric summary strip to focus on the chart

### 🔐 Authentication System

- **User Registration**: Complete signup with budget limit
- **User Login**: Secure authentication with JWT tokens
- **Password Reset**: Mocked reset page flow (no email send in demo)
- **Session Management**: Persistent login with remember me
- **Route Protection**: Protected routes with authentication guards
- **Auto-logout**: Server restart detection and cleanup

### 💰 Expense Management

- **CRUD Operations**: Create, edit, delete expenses
- **Budget Tracking**: Real-time budget limit monitoring
- **Expense Table**: Sortable and filterable expense list
- **Add/Edit Modal**: Intuitive expense management interface
- **Delete Confirmation**: Safe deletion with confirmation dialogs

### 🔔 Notification System

- **Real-time Updates**: Instant notifications for all operations
- **Multiple Types**: Success, error, info, and warning notifications
- **Auto-dismiss**: Configurable notification timeouts
- **Notification Center**: Dropdown with unread count
- **Persistent Storage**: Notifications survive page refreshes

### 🎨 Modern UI/UX

- **Responsive Design**: Mobile-first responsive layout
- **Dark/Light Theme**: Consistent design system
- **Component Library**: shadcn/ui for consistent components
- **Custom Icons**: Heroicons and Lucide React integration
- **Smooth Animations**: CSS transitions and animations
- **Accessibility**: ARIA labels and semantic HTML

### 🔍 Advanced Filtering

- **Search Functionality**: Real-time expense search
- **Date Filtering**: Calendar-based date selection
- **Sorting Options**: Multiple sort criteria
- **Filter Persistence**: Filters maintained across sessions

## Components

### Core Components

#### Authentication Components

- **Login**: User authentication with form validation
- **SignUp**: User registration with budget limit
- **ResetPassword**: Password recovery flow
- **AuthContext**: Global authentication state management

#### Dashboard Components

- **Dashboard**: Main application interface
- **Header**: Navigation and user controls
- **Sidebar**: Navigation menu with icons
- **ExpenseTable**: Data table with sorting and pagination
- **FilterBar**: Advanced filtering and search

#### Modal Components

- **AddEditModal**: Expense creation and editing
- **DeleteModal**: Expense deletion confirmation
- **ConfirmLogoutModal**: Logout confirmation

#### Notification Components

- **NotificationAlert**: Toast-style notifications
- **NotificationDropdown**: Notification center dropdown

### UI Components (shadcn/ui)

- **Button**: Multiple variants and sizes
- **Input**: Form input fields with validation
- **Dialog**: Modal dialogs and overlays
- **Table**: Data table components
- **Select**: Dropdown selection components
- **Calendar**: Date picker component
- **Alert**: Notification and status alerts
- **Avatar**: User profile images
- **Dropdown**: Context menus and dropdowns

## Pages

### Public Pages

- **Login** (`/login`): User authentication
- **SignUp** (`/signup`): User registration
- **ResetPassword** (`/reset-password`): Password recovery

### Protected Pages

- **Dashboard** (`/dashboard`): Main expense management interface
- **Analysis** (`/analysis`): Expenses line chart with filters and budget limit
- **Profile** (`/profile`): Read-only profile and editable account tab with avatar upload/removal

## State Management

### Authentication Context

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: UserData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}
```

### Features

- **Persistent Login**: Token storage in localStorage/sessionStorage
- **Auto-refresh**: Automatic token validation
- **Server Restart Detection**: Automatic logout on server changes
- **Remember Me**: Persistent login across browser sessions

## API Integration

### Service Layer

- **authAPI**: Authentication endpoints
- **entriesAPI**: Expense management endpoints
- **notificationsAPI**: Notification system endpoints
- **userAPI**: User profile management

### Features

- **Automatic Token Handling**: JWT tokens in request headers
- **Error Handling**: Consistent error response handling
- **Request Interceptors**: Automatic authentication headers
- **Response Transformers**: Data normalization

## Styling & Design

### Tailwind CSS Configuration

- **Custom Color Palette**: Purple primary (#6D28D9)
- **Component Variants**: Custom button and input styles
- **Responsive Breakpoints**: Mobile-first responsive design
- **Animation Classes**: Smooth transitions and hover effects

### Design System

- **Color Scheme**: Consistent color palette across components
- **Typography**: Poppins font family integration
- **Spacing**: Consistent spacing scale
- **Shadows**: Subtle depth and elevation
- **Borders**: Consistent border radius and colors

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd budget-app-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

The frontend uses `VITE_API_BASE_URL` for the API base. Create a `.env` in this folder with:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

For production, set it to your deployed backend, e.g. `https://<your-backend>.vercel.app/api`.

4. **Build for production**
   ```bash
   npm run build
   ```

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Configuration

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Budget Tracking App
```

### Tailwind Configuration

Custom Tailwind configuration with:

- Extended color palette
- Custom component variants
- Animation utilities
- Responsive breakpoints

## Component Development

### Best Practices

- **TypeScript First**: All components use TypeScript
- **Props Interface**: Define clear prop interfaces
- **Default Props**: Provide sensible defaults
- **Error Boundaries**: Handle component errors gracefully
- **Accessibility**: ARIA labels and semantic HTML

### Component Structure

```typescript
interface ComponentProps {
  // Define props interface
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};

export default Component;
```

## Testing

### Testing Strategy

- **Component Testing**: React Testing Library
- **Unit Testing**: Jest for utility functions
- **Integration Testing**: API service testing
- **E2E Testing**: Playwright for user flows

### Test Commands

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Performance Optimization

### React Optimizations

- **React.memo**: Prevent unnecessary re-renders
- **useCallback**: Memoize callback functions
- **useMemo**: Memoize expensive calculations
- **Code Splitting**: Lazy loading of routes

### Bundle Optimization

- **Tree Shaking**: Remove unused code
- **Code Splitting**: Dynamic imports for routes
- **Image Optimization**: Optimized asset loading
- **CSS Purge**: Remove unused CSS

## Accessibility

### ARIA Implementation

- **Labels**: Proper form labels and descriptions
- **Roles**: Semantic HTML roles
- **States**: Dynamic state management
- **Navigation**: Keyboard navigation support

### Screen Reader Support

- **Alt Text**: Descriptive image alt text
- **Focus Management**: Proper focus indicators
- **Skip Links**: Skip to main content
- **Semantic HTML**: Proper heading structure

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Deployment

### Build Process

1. **Production Build**: `npm run build`
2. **Static Assets**: Optimized and minified
3. **Environment Variables**: Production configuration
4. **Bundle Analysis**: Webpack bundle analyzer

### Deployment Options

- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **AWS S3**: Static website hosting
- **Docker**: Containerized deployment

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## Troubleshooting

### Common Issues

- **Build Errors**: Check TypeScript compilation
- **Styling Issues**: Verify Tailwind CSS configuration
- **API Errors**: Check backend connectivity
- **CORS**: Ensure backend CORS origin matches the Vite dev server (e.g., `http://localhost:5173`)
- **Performance**: Use React DevTools for profiling
- **Cannot click after logout**: Fixed. Modals fully unmount before navigating; the Login page also cleans up any stray overlays.

### Debug Tools

- **React DevTools**: Component inspection
- **Redux DevTools**: State management debugging
- **Network Tab**: API request monitoring
- **Console Logs**: Error and warning messages

## License

ISC License - see LICENSE file for details

## Support

For issues and questions:

- Create an issue in the GitHub repository
- Check the documentation
- Review the code examples
- Check the troubleshooting guide

---

**Last Updated**: August 2025  
**Version**: 1.0.0  
**Status**: Production Ready  
**React Version**: 19.1.1  
**TypeScript Version**: 5.8.3

# AI Retirement Planner - React Application

A modern, responsive React application for AI-powered retirement planning with a clean blue-themed design using Tailwind CSS.

## Features

- **Home Page**: Landing page with hero section, features, and call-to-action
- **Registration Page**: Comprehensive form with personal, family, and financial information
- **Login Page**: Clean authentication form with validation
- **Dashboard**: Retirement planning input form with income, expenses, savings, and goals
- **Results Page**: Dashboard-style summary with recommendations, projections, and investment plans

## Design Features

- **Modern UI**: Clean, professional design with blue color palette
- **Responsive**: Mobile-friendly layout that works on all devices
- **Accessibility**: Proper form labels, focus states, and keyboard navigation
- **Consistent Styling**: Unified design system with Tailwind CSS
- **Interactive Elements**: Hover effects, transitions, and loading states

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing for navigation
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Font Awesome**: Icons for enhanced UI
- **Inter Font**: Clean, modern typography

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Clerk account (for authentication)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Clerk Authentication:
   - Sign up at [https://clerk.com](https://clerk.com)
   - Create a new application
   - Copy your publishable key from the dashboard
   - **Enable Google OAuth**:
     - Go to "User & Authentication" → "Social Connections"
     - Enable Google provider
     - Add your Google OAuth credentials
   - Create a `.env` file in the root directory with:
   ```
   REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
   ```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   └── Navbar.js          # Navigation component
├── pages/
│   ├── Home.js            # Landing page
│   ├── Registration.js    # User registration form
│   ├── Login.js           # User login form
│   ├── Dashboard.js       # Retirement planning inputs
│   └── Results.js         # Results and recommendations
├── App.js                 # Main app component with routing
├── index.js               # React entry point
└── index.css              # Global styles and Tailwind imports
```

## Key Components

### Navigation
- Responsive navbar with mobile hamburger menu
- Active state indicators
- Clean blue-themed styling

### Forms
- Comprehensive validation with error messages
- Consistent styling with blue accents
- Mobile-optimized layouts
- Accessibility features

### Dashboard
- Multi-section form with income, expenses, savings inputs
- Real-time validation
- Progress tracking
- Helpful tips and guidance

### Results Page
- Tabbed interface for different views
- Interactive charts and progress bars
- Investment recommendations
- Action items and risk management

## Styling

The application uses a custom Tailwind configuration with:

- **Primary Colors**: Blue palette (#3b82f6, #2563eb, etc.)
- **Typography**: Inter font family
- **Components**: Custom button, form, and card styles
- **Responsive**: Mobile-first design approach
- **Accessibility**: Focus states and proper contrast

## Customization

### Colors
Modify `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    // ... other shades
  }
}
```

### Components
All components are modular and can be easily customized by modifying the JSX and Tailwind classes.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for demonstration purposes. Feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For questions or issues, please refer to the documentation or create an issue in the repository.

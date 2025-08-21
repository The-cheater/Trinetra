# TRINETRA - Community Safety

Modern mobile-first web app built with React + Vite. The app opens with an intro video, then flows to authentication (Signup/Login), followed by the main experience: Urban Thread (home feed of city incidents), Maps, Contribute, and Profile.

## 🚀 Features

### Core Functionality
- **Splash Screen**: Animated logo with smooth transitions
- **Authentication**: Login/Signup with form validation
- **Interactive Map**: Google Maps integration for location-based services
- **Incident Reporting**: Comprehensive form for reporting traffic incidents, road hazards, and construction work
- **Community Feed**: Real-time notifications and community reports
- **User Profile**: Statistics, report history, and account management

### Design Features
- **iPhone Dimensions**: Optimized for 414px width (iPhone 12/13/14)
- **HackOdisha Inspired**: Purple gradient theme with bold typography
- **Light/Dark Mode**: Complete theme system with automatic detection and manual toggle
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces
- **Modern UI**: Clean, accessible design with proper contrast ratios

## 📱 Pages & Navigation

### Authentication Flow
1. **Splash Screen** - Animated logo and loading screen
2. **Login** - Email/password authentication
3. **Signup** - User registration with validation

### Main App Navigation
- **Urban Thread** - Priority-sorted incident feed with filters and upvotes
- **Maps** - Search, route options, stats, and recent activity
- **Contribute** - Incident reporting with category selection
- **Profile** - User stats, history, and settings

### Child Pages
- **Contribution Type Selection** - Choose incident category before reporting

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, customizable icons
- **CSS Variables** - Consistent theming system

## 🎨 Design System

### Theme System
The app features a comprehensive light/dark mode system:

- **Automatic Detection**: Respects system preference on first visit
- **Manual Toggle**: Theme toggle button in navigation and headers
- **Persistent Storage**: Remembers user's theme choice
- **Smooth Transitions**: Animated theme switching with Framer Motion

### Color Palette
- **Primary**: `#7920D0` (Purple)
- **Secondary**: `#D3AEFF` (Light Purple)
- **Accent**: `#FFD32B` (Yellow)
- **Background**: `#BC82FE` (Gradient Purple)
- **Text**: `#000000` (Black)
- **White**: `#FFFFFF`

#### Dark Mode Colors
- **Background**: `#000000` (Black)
- **Secondary Background**: `#16181C` (Dark Gray)
- **Border**: `#2F3336` (Dark Border)
- **Text**: `#E7E9EA` (Light Text)
- **Secondary Text**: `#71767B` (Gray Text)

### Typography
- **Font Family**: Inter, system fonts
- **Weights**: 400 (Regular), 600 (Semibold), 700 (Bold), 800 (Extrabold)

### Components
- **Cards**: Rounded corners with borders
- **Buttons**: Hover effects with scale animations
- **Forms**: Icon-prefixed inputs with validation
- **Navigation**: Bottom tab bar with active states

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd community-safety-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Use browser dev tools to simulate iPhone dimensions (414px width)

## 📁 Project Structure

```
src/
├── components/
│   ├── BottomNavigation.jsx
│   ├── Logo.jsx
│   └── ThemeToggle.jsx
├── contexts/
│   └── ThemeContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Map.jsx           # Maps
│   ├── UrbanThread.jsx  # Home feed
│   ├── Contribute.jsx
│   ├── Profile.jsx
│   └── ContributionType.jsx
├── App.jsx
├── App.css
└── main.jsx
```

## 🎯 Key Features Explained

### 1. Splash Screen
- Animated logo with pulse effect
- Smooth fade-in transitions
- 3-second loading simulation

### 2. Authentication
- Form validation with real-time feedback
- Password visibility toggle
- Loading states for better UX
- Responsive design for all screen sizes

### 3. Map Page
- Interactive map placeholder (ready for Google Maps API)
- Route options (Fastest, Eco, Safety)
- Community statistics
- Recent activity feed

### 4. Contribute Page
- Category selection with visual feedback
- Severity slider with labels
- Location input with geolocation support
- Photo upload capability
- Form validation and submission

### 5. Urban Thread (Home)
- Filterable community reports with category and severity
- Upvote/comment/share actions
- Priority badges with P scores
- Real-time styling and animations

### 6. Profile Page
- User statistics dashboard
- Report history with status indicators
- Account settings
- Community ranking system

### 7. Theme System
- Light and dark mode support
- Automatic system preference detection
- Manual theme toggle in navigation
- Persistent theme storage
- Smooth animated transitions

## 🔧 Customization

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation if needed

### Styling
- Modify CSS variables in `src/App.css`
- Use consistent color palette
- Follow component patterns

### Animations
- Use Framer Motion for smooth transitions
- Maintain consistent timing (0.3s-0.6s)
- Add hover and tap effects

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect repository to deployment platform
2. Set build command: `npm run build`
3. Set output directory: `dist`

## 🔮 Future Enhancements

### Backend Integration
- Firebase Authentication
- Firestore for data storage
- Real-time updates
- Image upload to Firebase Storage

### Map Integration
- Google Maps JavaScript API
- Real-time traffic data
- Route optimization
- Location-based services

### Advanced Features
- Push notifications
- Offline support
- Social sharing
- Community moderation tools

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For questions or support, please open an issue in the repository.

---

**Built with ❤️ using React + Vite**
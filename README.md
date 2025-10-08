# XONIGHT - E-commerce Mobile App

A React Native Expo mobile application that mirrors the features and functionality of the EY-Techathon Next.js web application, using the same backend API endpoints.

## Features

✅ **Authentication System**

- User login and signup
- JWT token-based authentication
- Secure token storage with AsyncStorage

✅ **Shopping Experience**

- Product catalog with categories
- Product search and filtering
- Product detail pages with image galleries
- Shopping cart with persistent state
- Wishlist functionality

✅ **Navigation**

- Tab-based navigation (Home, Categories, Cart, Profile)
- Stack navigation for product details
- Auth flow routing

✅ **UI/UX**

- Modern, responsive design
- Loading states and error handling
- Toast notifications
- Pull-to-refresh functionality

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context + useReducer
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **UI Components**: React Native + Expo Vector Icons
- **Backend**: Uses existing EY-Techathon Next.js API routes

## API Endpoints Used

The app connects to your existing Next.js backend and uses these routes:

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify` - Token verification
- `POST /api/auth/logout` - User logout
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product by ID
- `GET /api/categories` - Get product categories
- `GET /api/promotions` - Get promotional offers
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Update user's cart

## Setup Instructions

### Prerequisites

1. Node.js (v16 or higher)
2. Expo CLI (`npm install -g @expo/cli`)
3. Your Next.js EY-Techathon backend running
4. Mobile device or emulator for testing

### Installation

1. **Install dependencies**:

   ```bash
   cd XONIGHT
   npm install
   ```

2. **Configure API URL**:

   Open `src/config/index.ts` and update the API base URL:

   ```typescript
   const config = {
     API_BASE_URL: __DEV__
       ? "http://YOUR_LOCAL_IP:3000" // Replace with your development server URL
       : "https://your-app-domain.com", // Replace with your production domain
   };
   ```

   **Important**: For mobile devices, you cannot use `localhost`. Use your computer's IP address instead:

   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Example: `http://192.168.1.100:3000`

3. **Start your Next.js backend**:

   ```bash
   cd ../EY-Techathon
   npm run dev
   ```

4. **Start the Expo app**:

   ```bash
   cd XONIGHT
   npx expo start
   ```

5. **Run on device/emulator**:
   - Scan QR code with Expo Go app (mobile)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

### Testing

1. **Create a test account** through the signup screen
2. **Login** with your credentials
3. **Browse products** on the home screen
4. **Add items to cart** and test cart functionality
5. **Test wishlist** by tapping heart icons
6. **Navigate to product details** by tapping on products

## App Structure

```
XONIGHT/
├── app/                    # App Router pages
│   ├── (auth)/            # Authentication screens
│   │   ├── signin.tsx
│   │   └── signup.tsx
│   ├── (main)/            # Main app screens
│   │   ├── home.tsx
│   │   ├── categories.tsx
│   │   ├── cart.tsx
│   │   └── profile.tsx
│   ├── product/           # Product detail screen
│   │   └── [id].tsx
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── src/
│   ├── contexts/          # React contexts
│   │   ├── CartContext.tsx
│   │   └── WishlistContext.tsx
│   ├── hooks/             # Custom hooks
│   │   └── useAuth.ts
│   ├── services/          # API services
│   │   └── api.ts
│   └── config/            # Configuration
│       └── index.ts
└── package.json
```

## Key Features Implementation

### Authentication

- JWT tokens stored securely in AsyncStorage
- Automatic token verification on app launch
- Auth state managed with custom hook

### Shopping Cart

- Cross-device synchronization with backend
- Persistent storage (API + local backup)
- Real-time updates and quantity management

### Product Catalog

- Dynamic category filtering
- Search functionality
- Image handling (base64 support)
- Pagination ready

### Navigation

- Expo Router with file-based routing
- Tab navigation for main sections
- Stack navigation for details
- Auth flow protection

## Backend Synchronization

The app maintains perfect sync with your web application by:

1. **Using same API endpoints** - No duplicate backend logic
2. **Shared data models** - Same product, user, and cart structures
3. **JWT authentication** - Same auth system as web app
4. **Real-time cart sync** - Changes reflect across web and mobile

## Customization

### Styling

- Modify styles in component files
- Colors and themes in `styles` objects
- Consistent design system used throughout

### API Configuration

- Update `src/config/index.ts` for different environments
- Modify `src/services/api.ts` for custom headers or interceptors

### Features

- Add new screens in `app/` directory
- Extend contexts for additional state management
- Create new hooks for complex logic

## Troubleshooting

### Common Issues

1. **API Connection Failed**

   - Check if backend is running
   - Verify IP address in config (not localhost for mobile)
   - Check network connectivity

2. **Authentication Issues**

   - Clear AsyncStorage: Uninstall and reinstall app
   - Check token format in backend
   - Verify API endpoints are accessible

3. **Images Not Loading**
   - Check image format (base64 support included)
   - Verify image URLs are accessible
   - Check network permissions

### Development Tips

- Use Expo DevTools for debugging
- Check network requests in Flipper (React Native debugger)
- Use console.log for state debugging
- Test on multiple devices/orientations

## Future Enhancements

Potential additions:

- Push notifications
- Offline functionality
- Social authentication
- Payment integration
- Order tracking
- Advanced search filters
- Product reviews and ratings

## Support

If you encounter any issues:

1. Check that your Next.js backend is running and accessible
2. Verify API base URL configuration
3. Test API endpoints directly with tools like Postman
4. Check Expo and React Native documentation

The app is designed to work seamlessly with your existing EY-Techathon backend, providing a native mobile experience while maintaining all the functionality of your web application.

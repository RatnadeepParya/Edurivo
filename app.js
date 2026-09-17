const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const appConfig = require('./app/config/app.config');
const logger = require('./app/config/logger');
const { optionalAuth } = require('./app/middleware/auth.middleware');
const { csrfProtection } = require('./app/middleware/csrf.middleware');
const { notFoundHandler, errorHandler } = require('./app/middleware/error.middleware');

// Routes
const authRoutes = require('./app/routes/auth.routes');
const adminRoutes = require('./app/routes/admin.routes');
const teacherRoutes = require('./app/routes/teacher.routes');
const studentRoutes = require('./app/routes/student.routes');
const cashierRoutes = require('./app/routes/cashier.routes');
const apiRoutes = require('./app/routes/api.v1.routes');

const app = express();

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allows inline styles & vanilla JS scripts seamlessly
  crossOriginEmbedderPolicy: false
}));

// Request Logging
app.use(morgan('dev'));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(appConfig.sessionSecret));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Global locals injection
app.use((req, res, next) => {
  res.locals.appName = appConfig.appName;
  res.locals.school = appConfig.school;
  res.locals.currentPath = req.path;
  res.locals.currentUser = null;
  res.locals.validationErrors = {};
  res.locals.formData = {};
  res.locals.successMessage = req.query.success || null;
  res.locals.errorMessage = req.query.error || null;
  next();
});

// Optional auth to populate user on every view
app.use(optionalAuth);

// CSRF Protection on web routes
app.use(csrfProtection);

// Mount Web Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);
app.use('/cashier', cashierRoutes);

// Mount API v1 Routes
app.use('/api/v1', apiRoutes);

// Root entry redirect
app.get('/', (req, res) => {
  if (req.user) {
    switch (req.user.role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return res.redirect('/admin/dashboard');
      case 'TEACHER':
        return res.redirect('/teacher/dashboard');
      case 'STUDENT':
        return res.redirect('/student/dashboard');
      case 'CASHIER':
        return res.redirect('/cashier/dashboard');
      default:
        return res.redirect('/admin/dashboard');
    }
  }
  res.redirect('/auth/login');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

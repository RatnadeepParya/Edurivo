require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  appName: process.env.APP_NAME || 'Edurivo School Management System',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  sessionSecret: process.env.SESSION_SECRET || 'edurivo_super_secret_session_key_32_chars_min',
  
  // School Profile Defaults (overridden by Firestore settings document)
  school: {
    id: 'school_default',
    name: 'Edurivo International Academy',
    tagline: 'Excellence in Global Learning & Character',
    email: 'admissions@edurivo.edu',
    phone: '+1 (555) 348-7486',
    address: '100 Knowledge Boulevard, Academic Park, Metropolis',
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    currentSessionId: 'session_2025_2026',
    currentSessionName: '2025-2026'
  },

  // File upload limits
  upload: {
    maxPhotoSize: 5 * 1024 * 1024, // 5 MB
    maxDocSize: 15 * 1024 * 1024,  // 15 MB
    allowedImageMimes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocMimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    ]
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  },

  // Financial constraints
  finance: {
    receiptPrefix: 'REC',
    invoicePrefix: 'INV',
    cashClosingDiscrepancyThreshold: 10.00
  }
};

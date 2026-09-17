const authService = require('../services/auth.service');
const logger = require('../config/logger');

class AuthController {
  renderLogin(req, res) {
    if (req.user) {
      return res.redirect(AuthController.getRedirectForRole(req.user.role));
    }
    res.render('auth/login', {
      title: 'Sign In | Edurivo',
      error: req.query.expired ? 'Your session has expired. Please sign in again.' : null,
      redirect: req.query.redirect || ''
    });
  }

  async login(req, res) {
    try {
      const { email, password, redirect } = req.body;
      const result = await authService.login(email, password, req);

      // Set secure HTTP-only session cookie
      res.cookie('__session', result.sessionCookie, {
        maxAge: result.expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });

      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          message: 'Signed in successfully',
          redirectUrl: redirect || AuthController.getRedirectForRole(result.user.role)
        });
      }

      const targetUrl = redirect || AuthController.getRedirectForRole(result.user.role);
      res.redirect(targetUrl);
    } catch (error) {
      logger.warn('Login failure: %s', error.message);
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_FAILED', message: error.message }
        });
      }
      res.status(401).render('auth/login', {
        title: 'Sign In | Edurivo',
        error: error.message,
        redirect: req.body.redirect || ''
      });
    }
  }

  async logout(req, res) {
    try {
      await authService.logout(req.user, req);
    } catch (e) {}

    res.clearCookie('__session');
    res.redirect('/auth/login?logged_out=1');
  }

  renderForgotPassword(req, res) {
    res.render('auth/forgot-password', {
      title: 'Forgot Password | Edurivo',
      message: null,
      error: null
    });
  }

  static getRedirectForRole(role) {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      case 'CASHIER':
        return '/cashier/dashboard';
      default:
        return '/admin/dashboard';
    }
  }
}

module.exports = new AuthController();

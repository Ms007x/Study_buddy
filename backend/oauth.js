const axios = require('axios');
const { oauthLogin } = require('./auth');

class OAuthService {
  constructor() {
    this.providers = {
      google: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scope: 'openid email profile',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },
      github: {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
        scope: 'user:email',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
      }
    };
  }

  // Generate OAuth authorization URL
  getAuthUrl(provider, redirectUri) {
    const config = this.providers[provider];
    if (!config) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scope,
      response_type: 'code',
      state: this.generateState()
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(provider, code, redirectUri) {
    const config = this.providers[provider];
    if (!config) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    try {
      const response = await axios.post(config.tokenUrl, {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }, {
        headers: {
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for token');
    }
  }

  // Get user information from OAuth provider
  async getUserInfo(provider, accessToken) {
    const config = this.providers[provider];
    if (!config) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    try {
      const response = await axios.get(config.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      return this.normalizeUserInfo(provider, response.data);
    } catch (error) {
      console.error('User info error:', error.response?.data || error.message);
      throw new Error('Failed to get user information');
    }
  }

  // Normalize user info from different providers
  normalizeUserInfo(provider, data) {
    switch (provider) {
      case 'google':
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          avatar: data.picture,
          provider: 'google',
          verified: data.verified_email
        };
      
      case 'github':
        return {
          id: data.id.toString(),
          email: data.email,
          name: data.name || data.login,
          avatar: data.avatar_url,
          provider: 'github',
          verified: true // GitHub accounts are verified by default
        };
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // Create or update user in database (removed Supabase dependency)
  async createOrUpdateUser(userInfo) {
    try {
      // Use the oauthLogin function from auth.js
      const result = await oauthLogin(userInfo);
      return {
        user_id: result.user.id,
        email: result.user.email,
        ...result.user
      };
    } catch (error) {
      console.error('User creation/update error:', error);
      throw error;
    }
  }

  // Generate random state for OAuth security
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Verify state parameter (for security)
  verifyState(receivedState, expectedState) {
    return receivedState === expectedState;
  }
}

// Create singleton instance
const oauthService = new OAuthService();

module.exports = oauthService;

const crypto = require('crypto');
const PERIMETER_SECRET = process.env.PERIMETER_SECRET || 'dev-secret-do-not-use-in-prod';
function signSession(idToken) { return crypto.createHmac('sha256', PERIMETER_SECRET).update(idToken).digest('hex'); }
function requireAuth(req, res, next) {
    const sessionCookie = req.cookies.__session;
    if (!sessionCookie) {
        if (req.path.startsWith('/api/') || req.path === '/app') return res.redirect('/');
        return next();
    }
    req.authenticatedUser = true; next();
}
module.exports = { signSession, requireAuth };

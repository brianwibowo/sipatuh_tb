export function verifyAdminPassword(requestHeaders) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD is not set in environment variables.');
    return false;
  }
  
  // Look for the password in headers: x-admin-password
  const requestPassword = requestHeaders.get('x-admin-password');
  
  return requestPassword === adminPassword;
}

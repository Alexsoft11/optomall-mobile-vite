import supabaseAdmin from './supabaseClient';

export async function getUserFromToken(accessToken?: string) {
  if (!accessToken) return null;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error) {
      console.warn('auth.getUser error', error);
      return null;
    }
    return data.user || null;
  } catch (err) {
    console.error('getUserFromToken error', err);
    return null;
  }
}

export function isAdminUser(user: any) {
  if (!user) return false;
  // Supabase may include custom claims in user.user_metadata or app_metadata
  if ((user.user_metadata && user.user_metadata.role === 'admin') || (user.app_metadata && user.app_metadata.role === 'admin')) return true;
  // Some setups put role in token claims (not always available here)
  const jwtRole = (user?.identities && user?.identities[0] && user?.identities[0].provider) ? null : null;
  return false;
}

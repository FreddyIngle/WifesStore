import { supabase } from '../supabaseClient';

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) throw error;
    console.log("Redirecting to Google OAuth:", data);
  } catch (err) {
    console.error("Google sign-in error:", err.message || err);
  }
};


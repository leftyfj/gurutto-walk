import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';


export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
 const [isAuthLoading, setIsAuthLoading] = useState(true);
 useEffect(() => {
        const initializeAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('ログイン状態の確認に失敗しました。', error.message);
            }

            setUser(session?.user ?? null);
            setIsAuthLoading(false);
        };

        void initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setIsAuthLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

   const handleGoogleLogin = async () => {
          const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                  redirectTo: window.location.origin
              }
          });

          if (error) {
              console.error('Googleログインに失敗しました。', error.message);
          }
      };

      const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if(error) {
            console.error('ログアウトに失敗しました', error.message);
        }
       }

      const displayName = user
          ? (user.user_metadata.full_name ??
            user.user_metadata.name ??
            user.email ??
            'Googleユーザー')
          : null;
       return {
           user,
           isAuthLoading,
           displayName,
           handleGoogleLogin,
           handleLogout
       };
}

import { useEffect, useState } from 'react';
import { Button, CircularProgress, Container, Typography, Box } from '@mui/material';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { GoogleMapArea } from './components/GoogleMapArea';
import '../styles/App.scss'

function App() {
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

   const displayName = user
       ? user.user_metadata.full_name
           ?? user.user_metadata.name
           ?? user.email
           ?? 'Googleユーザー'
       : null;

  return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
          <Typography variant="h4" component="h1" gutterBottom>
              <span className="app-title__main">ぐるっと散歩</span>
              <span className="app-title__sub">Gurutto Walk</span>
          </Typography>
          <Typography align="center" sx={{ mb: 3 }}>
              歩きたい距離を選ぶだけ。
              <br />
              今いる場所から戻ってこられる散歩コースをご案内します。
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
              {/* <Button
                  className="google-login-button"
                  variant="contained"
                  onClick={user ? undefined : handleGoogleLogin}
                  disabled={isAuthLoading || Boolean(user)}
                  startIcon={isAuthLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
              >
                  {isAuthLoading
                      ? 'ログイン状態を確認中'
                      : user
                          ? `${displayName}さん、ログイン中`
                          : 'Googleアカウントでログイン'}
              </Button> */}
              {isAuthLoading ? (
                <Button
                    variant='contained'
                    disabled
                    startIcon={
                        <CircularProgress size={18} color="inherit"/>
                    }
                    >
                        ログイン状態を確認中
                    </Button>
                    ): user ? (
                        <>
                            <Typography sx={{mb : 2}}>
                                {displayName}さん、ログイン中
                            </Typography>
                            <Box sx={{mt : 3}}>
                                {/* Googleマップをここに表示 */}
                               <GoogleMapArea />
                            </Box>
                        </>
                    ):(
                        <Button className='google-login-button' variant='contained' onClick={handleGoogleLogin}>
                            Googleアカウントでログイン
                        </Button>
                    )
              }
          </Box>
      </Container>
  );
}

export default App

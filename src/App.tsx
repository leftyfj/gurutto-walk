import { useEffect, useState } from 'react';
import { Button, CircularProgress, Container, Typography, Box } from '@mui/material';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { GoogleMapArea } from './components/GoogleMapArea';
import { generateSquareRoute } from './lib/route/generateSquareRoute';
import { getWalingRoute } from './lib/route/getWalkingRoute';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import '../styles/App.scss'

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const currentLocation = useCurrentLocation();
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

   useEffect(() => {
       if (!currentLocation) {
           return;
       }

       const fetchWalingRoute = async() => {
        const baseBearing = Math.floor(Math.random() * 360);
        // const baseBearing = 0;
        const initialBearings = [
            baseBearing,
            (baseBearing + 120) % 360,
            (baseBearing + 240) % 360
        ];
        try{
            const squareRoutes = initialBearings.map((bearing) =>
                generateSquareRoute(
                    currentLocation,
                    3000,
                    bearing
                )
            );

            const walkingRoutes = await Promise.all(
                squareRoutes.map((squareRoute) =>
                    getWalingRoute(
                        currentLocation,
                        squareRoute
                    )
                )
            );
            //  console.log('最初の方角', baseBearing);
            console.log('正方形のルート', squareRoutes);
            console.log('Google Mapsの徒歩ルート',walkingRoutes);
              walkingRoutes.forEach((route, index) => {
                  console.log(
                      `ルート${index + 1}の実際の徒歩距離`,
                      route.distanceMeters
                  );
              });
            // const walikingRoute = await getWalingRoute(
            //     currentLocation,
            //     squareRoute
            // );
            // console.log('実際の徒歩距離',walikingRoute.distanceMeters);

        } catch(error){
            console.error('徒歩ルートの取得に失敗しました',error);
        }

       };
       fetchWalingRoute();

   }, [currentLocation]);

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
          {currentLocation ? (
              <Typography align="center">
                  現在地：{currentLocation.lat}, {currentLocation.lng}
              </Typography>
          ) : (
              <p>現在地を取得しています...</p>
          )}
          <Box sx={{ textAlign: 'center' }}>
              {isAuthLoading ? (
                  <Button
                      variant="contained"
                      disabled
                      startIcon={<CircularProgress size={18} color="inherit" />}
                  >
                      ログイン状態を確認中
                  </Button>
              ) : user ? (
                  <>
                      <Typography sx={{ mb: 2 }}>
                          {displayName}さん、ログイン中
                      </Typography>
                      <Button
                          variant="outlined"
                          onClick={handleLogout}
                          sx={{ mb: 3 }}
                      >
                          ログアウト
                      </Button>
                      <Box sx={{ mt: 3 }}>
                          {/* Googleマップをここに表示 */}
                          <GoogleMapArea />
                      </Box>
                  </>
              ) : (
                  <Button
                      className="google-login-button"
                      variant="contained"
                      onClick={handleGoogleLogin}
                  >
                      Googleアカウントでログイン
                  </Button>
              )}
          </Box>
      </Container>
  );
}

export default App

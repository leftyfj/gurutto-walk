import { useEffect, useState } from 'react';
import { Button, CircularProgress, Container, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import type { User } from '@supabase/supabase-js';
import type { WalkingRouteCandidate } from './types/route';
import { supabase } from './lib/supabase';
import { GoogleMapArea } from './components/GoogleMapArea';
import { generateSquareRoute } from './lib/route/generateSquareRoute';
import { getWalingRoute } from './lib/route/getWalkingRoute';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import '../styles/App.scss'
const TARGET_DISTANCE_METERS = 3000;

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [routeCandidates, setRouteCandidates] = useState<WalkingRouteCandidate[]>([]);
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<WalkingRouteCandidate | null>(null);
    const [isGeneratingRoutes, setIsGeneratingRoutes] = useState(false);
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

   const generateRouteCandidates = async () => {
        if (!currentLocation || isGeneratingRoutes) {
            return;
        }
        setIsGeneratingRoutes(true);
        try{
        const baseBearing = Math.floor(Math.random() * 360);

        const initialBearings = [
            baseBearing,
            (baseBearing + 120) % 360,
            (baseBearing + 240) % 360
        ];

        const squareRoutes = initialBearings.map((bearing) =>
            generateSquareRoute(
                currentLocation,
                TARGET_DISTANCE_METERS,
                bearing
            )
        );

            const candidates: WalkingRouteCandidate[] = await Promise.all(
                squareRoutes.map( async (squareRoute, index) => {
                    const walkingRoute = await getWalingRoute(
                        currentLocation,
                        squareRoute
                    );
                    return {
                        id: index + 1,
                        initialBearing: squareRoute.initialBearing,
                        waypoints: squareRoute.waypoints,
                        actualDistanceMeters: walkingRoute.distanceMeters ?? 0,
                        googleRoute: walkingRoute
                    };
                })
            );

            setRouteCandidates(candidates);
            setSelectedRoute(null);
            setIsRouteDialogOpen(true);
            console.log('基準方角', baseBearing);
            console.log('再生成したルート候補', candidates);
            } catch(error){
                console.error('徒歩ルートの取得に失敗しました',error);
            } finally {
                setIsGeneratingRoutes(false);
            }

    };

   useEffect(() => {
       if (!currentLocation) {
           return;
       }

       generateRouteCandidates();
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
      <>
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
                          startIcon={
                              <CircularProgress size={18} color="inherit" />
                          }
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
                              <GoogleMapArea selectedRoute={selectedRoute} />
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
          <Dialog
              open={isRouteDialogOpen}
              onClose={() => setIsRouteDialogOpen(false)}
              fullWidth
              maxWidth="sm"
          >
              <DialogTitle>3つのルートを生成しました</DialogTitle>

              <DialogContent>
                  <Typography sx={{ mb: 2 }}>
                      希望距離：
                      {TARGET_DISTANCE_METERS.toLocaleString()}m
                  </Typography>

                  <Stack spacing={2}>
                      {routeCandidates.map((candidate) => {
                          const difference =
                              candidate.actualDistanceMeters -
                              TARGET_DISTANCE_METERS;

                          const formattedDifference =
                              difference === 0
                                  ? '±0m'
                                  : difference > 0
                                    ? `+${difference.toLocaleString()}m`
                                    : `${difference.toLocaleString()}m`;

                          return (
                              <Stack
                                  key={candidate.id}
                                  direction="row"
                                  sx={{
                                      alignItems: 'center',
                                      justifyContent: 'space-between'
                                  }}
                                  spacing={2}
                              >
                                  <Typography>ルート{candidate.id}</Typography>

                                  <Typography>
                                      {candidate.actualDistanceMeters.toLocaleString()}
                                      m
                                  </Typography>

                                  <Typography>
                                      希望距離との差：
                                      {formattedDifference}
                                  </Typography>
                                  <Button
                                      variant="contained"
                                      onClick={() => {
                                          setSelectedRoute(candidate);
                                          setIsRouteDialogOpen(false);
                                      }}
                                  >
                                      このルートを選ぶ
                                  </Button>
                              </Stack>
                          );
                      })}
                  </Stack>
              </DialogContent>

              <DialogActions>
                  <Button
                      onClick={generateRouteCandidates}
                      disabled={isGeneratingRoutes}
                  >
                      {isGeneratingRoutes ? '生成中...' : '別のルートを再生成'}
                  </Button>
                  <Button onClick={() => setIsRouteDialogOpen(false)}>
                      閉じる
                  </Button>
              </DialogActions>
          </Dialog>
      </>
  );
}

export default App

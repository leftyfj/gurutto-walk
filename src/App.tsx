import { useEffect, useState } from 'react';
import { Button, CircularProgress, Container, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import GoogleIcon from '@mui/icons-material/Google';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import type { User } from '@supabase/supabase-js';
import type { WalkingRouteCandidate } from './types/route';
import { supabase } from './lib/supabase';
import { GoogleMapArea } from './components/GoogleMapArea';
import { generateSquareRoute } from './lib/route/generateSquareRoute';
import { getWalingRoute } from './lib/route/getWalkingRoute';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import '../styles/App.scss'
const TARGET_DISTANCE_METERS = 1000;

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [routeCandidates, setRouteCandidates] = useState<WalkingRouteCandidate[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<WalkingRouteCandidate | null>(null);
    const [previousRoute, setPreviousRoute] = useState<WalkingRouteCandidate | null>(null);
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
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

   const handleRegenerateRoutes = async () => {
       // 現在表示しているルートを退避
       setPreviousRoute(selectedRoute);
       // 地図上のルートを一旦消す
       setSelectedRoute(null);
       setRouteCandidates([]);

       await generateRouteCandidates();
   };

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

    const handleCloseDialog = () => {
        setIsRouteDialogOpen(false);
        if (!selectedRoute && previousRoute) {
            setSelectedRoute(previousRoute);
        }

        setPreviousRoute(null);
    };

    const handleSelectRoute = (route: WalkingRouteCandidate) => {
        setSelectedRoute(route);
        setPreviousRoute(null);
        setIsRouteDialogOpen(false);
    };

    const handleOpenGoogleMaps = () => {
        if (!currentLocation || !selectedRoute) {
            return;
        }

        const origin = `${currentLocation.lat},${currentLocation.lng}`;
        const destination = origin; //出発地に戻ってくるため、出発地=目的地になる
        const waypoints = selectedRoute.waypoints
             .map((waypoint) => `${waypoint.lat},${waypoint.lng}`)
             .join('|');
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1` +
            `&origin=${encodeURIComponent(origin)}` +
            `&destination=${encodeURIComponent(destination)}` +
            `&waypoints=${encodeURIComponent(waypoints)}` +
            `&travelmode=walking`;
            console.log(googleMapsUrl);
             window.open(googleMapsUrl, '_blank');
    };
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
                  今いる場所へ戻って来られる散歩コースをご案内します。
              </Typography>
              {/* {currentLocation ? (
                  <Typography align="center">
                      現在地：{currentLocation.lat}, {currentLocation.lng}
                  </Typography>
              ) : (
                  <p>現在地を取得しています...</p>
              )} */}

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
                          <Typography sx={{ mb: 1 }}>
                              {displayName}さん、ログイン中
                          </Typography>
                          <Button
                              variant="text"
                              size="small"
                              onClick={handleLogout}
                              sx={{
                                  mb: 0,
                                  color: 'text.secondary',
                                  textTransform: 'none'
                              }}
                          >
                              ログアウト
                          </Button>

                          <Box sx={{ mt: 1 }}>
                              <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<RefreshIcon />}
                                  onClick={handleRegenerateRoutes}
                                  disabled={
                                      !currentLocation || isGeneratingRoutes
                                  }
                                  sx={{ mb: 1 }}
                              >
                                  {isGeneratingRoutes
                                      ? '生成中...'
                                      : '新たにルートを生成'}
                              </Button>
                              {/* Googleマップをここに表示 */}
                              <GoogleMapArea selectedRoute={selectedRoute} />
                              {selectedRoute && (
                                  <Button
                                      variant="contained"
                                      startIcon={<DirectionsWalkIcon />}
                                      onClick={handleOpenGoogleMaps}
                                      sx={{ mt: 1 }}
                                  >
                                      Googleマップで歩く
                                  </Button>
                              )}
                          </Box>
                      </>
                  ) : (
                      <Button
                          className="google-login-button"
                          variant="outlined"
                          startIcon={<GoogleIcon />}
                          onClick={handleGoogleLogin}
                          sx={{
                              color: 'text.primary',
                              borderColor: 'divider',
                              backgroundColor: 'background.paper',
                              textTransform: 'none',
                              px: 3,
                              py: 1.2,
                              '&:hover': {
                                  backgroundColor: 'action.hover',
                                  borderColor: 'text.secondary'
                              }
                          }}
                      >
                          Googleアカウントでログイン
                      </Button>
                  )}
              </Box>
          </Container>
          <Dialog
              open={isRouteDialogOpen}
              //   onClose={() => setIsRouteDialogOpen(false)}
              onClose={handleCloseDialog}
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
                                      justifyContent: 'space-between',
                                      gap: 1
                                  }}
                                  spacing={2}
                              >
                                  {/* <Typography>ルート{candidate.id}</Typography> */}
                                  <Typography
                                      sx={{ minWidth: 20, fontWeight: 'bold' }}
                                  >
                                      {candidate.id}
                                  </Typography>

                                  <Typography sx={{ whiteSpace: 'nowrap' }}>
                                      {candidate.actualDistanceMeters.toLocaleString()}
                                      m
                                  </Typography>

                                  <Typography
                                      variant="body2"
                                      sx={{ flex: 1, textAlign: 'center' }}
                                  >
                                      差：
                                      {formattedDifference}
                                  </Typography>
                                  <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() =>
                                          handleSelectRoute(candidate)
                                      }
                                      sx={{ whiteSpace: 'nowrap' }}
                                  >
                                      選ぶ
                                  </Button>
                              </Stack>
                          );
                      })}
                  </Stack>
              </DialogContent>

              <DialogActions>
                  <Button
                      size="small"
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={generateRouteCandidates}
                      disabled={isGeneratingRoutes}
                  >
                      {isGeneratingRoutes ? '生成中...' : '別のルートを再生成'}
                  </Button>
                  <Button onClick={handleCloseDialog}>閉じる</Button>
              </DialogActions>
          </Dialog>
      </>
  );
}

export default App

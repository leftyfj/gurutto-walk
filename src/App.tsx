import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import type { WalkingRouteCandidate } from './types/route';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Header } from './components/Header';
import { AuthSection } from './components/AuthSection';
import { GuideToGoogleMapsDialog } from './components/GuideToGoogleMapsDialog';

import { RouteSelectionDialog } from './components/RouteSelectionDialog';
import { generateSquareRoute } from './lib/route/generateSquareRoute';
import { getWalingRoute } from './lib/route/getWalkingRoute';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import { useAuth } from './hooks/useAuth';
import { WalkingRoutePanel} from './components/WalkingRoutePanel';

import '../styles/App.scss'
// const TARGET_DISTANCE_METERS = 1000;

function App() {
    const [routeCandidates, setRouteCandidates] = useState<WalkingRouteCandidate[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<WalkingRouteCandidate | null>(null);
    const [previousRoute, setPreviousRoute] = useState<WalkingRouteCandidate | null>(null);
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
    const [isGeneratingRoutes, setIsGeneratingRoutes] = useState(false);
    const [targetDistanceMeters, setTargetDistanceMeters] = useState(1000);
    const [navigationNoticeOpen, setNavigationNoticeOpen] = useState(false);
    const [doNotShowAgain, setDoNotShowAgain] = useState(false);
    const currentLocation = useCurrentLocation();
    const {
        user,
        isAuthLoading,
        displayName,
        handleGoogleLogin,
        handleLogout
    } = useAuth();

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
                targetDistanceMeters,
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

    const handleGoogleMapsClick = () => {
        if (!currentLocation || !selectedRoute) {
            return;
        }

        const noticeHidden = localStorage.getItem('hideGoogleMapsNavigationNotice')==='true';

        if(noticeHidden) {
            openGoogleMaps();
            return;
        }

        setDoNotShowAgain(false);
        setNavigationNoticeOpen(true);
    };

    const openGoogleMaps = () => {
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
    }

    const handleStartNavigation = () => {
        if (doNotShowAgain) {
            localStorage.setItem('hideGoogleMapsNavigationNotice', 'true');
        }

        setNavigationNoticeOpen(false);
        openGoogleMaps();
    };

    const handleSelectDistance = (event:SelectChangeEvent<number>) => {
        setTargetDistanceMeters(Number(event.target.value));
        setSelectedRoute(null);
        setPreviousRoute(null);
    }

  return (
      <>
          <Container maxWidth="sm" sx={{ py: 4 }}>
              <Header />
              <AuthSection
                  isAuthLoading={isAuthLoading}
                  user={user}
                  displayName={displayName}
                  onGoogleLogin={handleGoogleLogin}
                  onLogout={handleLogout}
              >
                  <WalkingRoutePanel
                      targetDistanceMeters={targetDistanceMeters}
                      selectedRoute={selectedRoute}
                      currentLocation={currentLocation}
                      isGeneratingRoutes={isGeneratingRoutes}
                      onSelectDistance={handleSelectDistance}
                      onRegenerateRoutes={handleRegenerateRoutes}
                      onGoogleMapsClick={handleGoogleMapsClick}
                  />
              </AuthSection>
              <RouteSelectionDialog
                  open={isRouteDialogOpen}
                  routeCandidates={routeCandidates}
                  targetDistanceMeters={targetDistanceMeters}
                  isGeneratingRoutes={isGeneratingRoutes}
                  onClose={handleCloseDialog}
                  onSelectRoute={handleSelectRoute}
                  onRegenerateRoutes={generateRouteCandidates}
              />
              <GuideToGoogleMapsDialog
                  open={navigationNoticeOpen}
                  doNotShowAgain={doNotShowAgain}
                  onClose={() => setNavigationNoticeOpen(false)}
                  onDoNotShowAgainChange={setDoNotShowAgain}
                  onStartNavigation={handleStartNavigation}
              />
          </Container>
      </>
  );
};

export default App

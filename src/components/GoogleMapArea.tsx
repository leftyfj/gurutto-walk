import{ useEffect, useState } from 'react';
import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { SelectedRoutePolyline } from './SelectedRoutePolyline';
import type { WalkingRouteCandidate } from '../types/route';
// const TOKYO_STATION = {
//     lat: 35.681236,
//     lng: 139.767125
// };
type Position = {
    lat: number;
    lng: number;
};

type GoogleMapAreaProps = {
    selectedRoute: WalkingRouteCandidate | null;
};

export const GoogleMapArea = ({
    selectedRoute
}:GoogleMapAreaProps) => {
 const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

 const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
 const [isLocationLoading, setIsLocationLoading] = useState(true);
 const [locationError, setLocationError] = useState<string | null>(null);
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('このブラウザでは位置情報を利用できません。');
            setIsLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });

                setIsLocationLoading(false);
            },
            (error) => {
                console.error('現在地の取得に失敗しました。', error);

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError(
                            '位置情報の利用が許可されていません。ブラウザの設定から許可してください。'
                        );
                        break;

                    case error.POSITION_UNAVAILABLE:
                        setLocationError('現在地を取得できませんでした。');
                        break;

                    case error.TIMEOUT:
                        setLocationError(
                            '現在地の取得がタイムアウトしました。'
                        );
                        break;

                    default:
                        setLocationError(
                            '現在地の取得中にエラーが発生しました。'
                        );
                }

                setIsLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);
   if (!apiKey) {
          return (
              <Alert severity="error">
                  Google Maps APIキーが設定されていません。
              </Alert>
          );
      }
          if (isLocationLoading) {
        return (
            <Box
                sx={{
                    py: 6,
                    textAlign: 'center'
                }}
            >
                <CircularProgress />

                <Typography sx={{ mt: 2 }}>
                    現在地を取得しています
                </Typography>
            </Box>
        );
    }
     if (locationError || !currentPosition) {
        return (
            <Alert severity="error">
                {locationError ?? '現在地を取得できませんでした。'}
            </Alert>
        );
    }
    return (
        <APIProvider apiKey={apiKey}>
            <Map
                defaultCenter={currentPosition}
                defaultZoom={16}
                mapId="DEMO_MAP_ID"
                style={{ width: '100%', height: '400px', borderRadius: '12px' }}
                gestureHandling="greedy"
            >
                <AdvancedMarker position={currentPosition} title="現在地" />
                <SelectedRoutePolyline selectedRoute={selectedRoute} />
            </Map>
        </APIProvider>
    );
};

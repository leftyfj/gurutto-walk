import { useEffect, useState } from 'react';
import type { LatLngLiteral } from '../types/route';

export const useCurrentLocation = () => {
    const [currentLocation, setCurrentLocation] = useState<LatLngLiteral | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                console.error('現在地を取得できませんでした', error);
            }
        );
    }, []);

    return currentLocation;
};

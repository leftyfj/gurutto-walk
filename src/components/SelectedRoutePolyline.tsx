import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { WalkingRouteCandidate } from '../types/route';

type SelectedRoutePolylineProps = {
    selectedRoute: WalkingRouteCandidate | null;
};

export const SelectedRoutePolyline = ({
    selectedRoute
}: SelectedRoutePolylineProps) => {
    const map = useMap();

    const polylinesRef = useRef<google.maps.Polyline[]>([]);

    useEffect(() => {
        if (!map || !selectedRoute) {
            return;
        }

        // 以前表示したルート線を削除
        polylinesRef.current.forEach((polyline) => {
            polyline.setMap(null);
        });

        // 選択されたルートから描画用Polylineを生成
        const polylines = selectedRoute.googleRoute.createPolylines();

        // 現在の地図へ表示
        polylines.forEach((polyline) => {
            polyline.setMap(map);
        });

        polylinesRef.current = polylines;
        const bounds = new google.maps.LatLngBounds();
        selectedRoute.googleRoute.path?.forEach((point) => {
            bounds.extend(point);
        });
        
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, 40);
        }
        return () => {
            polylines.forEach((polyline) => {
                polyline.setMap(null);
            });
        };
    }, [map, selectedRoute]);

    return null;
};

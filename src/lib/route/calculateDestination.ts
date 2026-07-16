import type { LatLngLiteral } from '../../types/route';

export const calculateDestination = (
    origin: LatLngLiteral,
    distanceMeters: number,
    bearingDegrees: number
): LatLngLiteral => {
    const earthRadius = 6371000;

    const latitude1 = (origin.lat * Math.PI) / 180;
    const longitude1 = (origin.lng * Math.PI) / 180;
    const bearing = (bearingDegrees * Math.PI) / 180;

    const angularDistance = distanceMeters / earthRadius;

    const latitude2 = Math.asin(
        Math.sin(latitude1) * Math.cos(angularDistance) +
            Math.cos(latitude1) * Math.sin(angularDistance) * Math.cos(bearing)
    );

    const longitude2 =
        longitude1 +
        Math.atan2(
            Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude1),
            Math.cos(angularDistance) -
                Math.sin(latitude1) * Math.sin(latitude2)
        );

    return {
        lat: (latitude2 * 180) / Math.PI,
        lng: (longitude2 * 180) / Math.PI
    };
};

export type LatLngLiteral = {
    lat: number;
    lng: number;
};

export type WalkingRouteCandidate = {
    id: number;
    initialBearing: number;
    waypoints: LatLngLiteral[];
    actualDistanceMeters: number;
    googleRoute: google.maps.routes.Route;
};

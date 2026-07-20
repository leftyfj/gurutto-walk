import type { LatLngLiteral } from "@/types/route";
import type { SquareRoute } from "./generateSquareRoute";

 export const getWalingRoute = async (
     origin: LatLngLiteral,
     squareRoute: SquareRoute
 ) => {
     const { Route } = (await google.maps.importLibrary(
         'routes'
     )) as google.maps.RoutesLibrary;

     const request: google.maps.routes.ComputeRoutesRequest = {
         origin,
         destination: origin,

         intermediates: squareRoute.waypoints.map((waypoint) => ({
             location: waypoint
         })),

         travelMode: 'WALKING',

         fields: ['distanceMeters','path']
     };

     const { routes } = await Route.computeRoutes(request);

     if (!routes || routes.length === 0) {
         throw new Error('徒歩ルートを取得できませんでした');
     }

     return routes[0];
 };

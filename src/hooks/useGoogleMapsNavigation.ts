import { useState } from 'react';

import type { LatLngLiteral, WalkingRouteCandidate } from '../types/route';
export const useGoogleMapsNavigation = (
 currentLocation: LatLngLiteral | null,
 selectedRoute: WalkingRouteCandidate | null
) => {
     const [navigationNoticeOpen, setNavigationNoticeOpen] = useState(false);
     const [doNotShowAgain, setDoNotShowAgain] = useState(false);

 const openGoogleMaps = () => {
     if (!currentLocation || !selectedRoute) {
         return;
     }
     const origin = `${currentLocation.lat},${currentLocation.lng}`;
     const destination = origin; //出発地に戻ってくるため、出発地=目的地になる
     const waypoints = selectedRoute.waypoints
         .map((waypoint) => `${waypoint.lat},${waypoint.lng}`)
         .join('|');
     const googleMapsUrl =
         `https://www.google.com/maps/dir/?api=1` +
         `&origin=${encodeURIComponent(origin)}` +
         `&destination=${encodeURIComponent(destination)}` +
         `&waypoints=${encodeURIComponent(waypoints)}` +
         `&travelmode=walking`;
     window.open(googleMapsUrl, '_blank');
 };

   const handleGoogleMapsClick = () => {
       if (!currentLocation || !selectedRoute) {
           return;
       }

       const noticeHidden =
           localStorage.getItem('hideGoogleMapsNavigationNotice') === 'true';

       if (noticeHidden) {
           openGoogleMaps();
           return;
       }

       setDoNotShowAgain(false);
       setNavigationNoticeOpen(true);
   };



   const handleStartNavigation = () => {
       if (doNotShowAgain) {
           localStorage.setItem('hideGoogleMapsNavigationNotice', 'true');
       }

       setNavigationNoticeOpen(false);
       openGoogleMaps();
   };

   const closeNavigationNotice = () => {
       setNavigationNoticeOpen(false);
   };

   return {
    navigationNoticeOpen,
    doNotShowAgain,
    setDoNotShowAgain,
    handleGoogleMapsClick,
    handleStartNavigation,
    closeNavigationNotice
   }

};


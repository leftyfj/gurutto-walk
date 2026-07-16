import type { LatLngLiteral } from "@/types/route";
import { calculateDestination } from "./calculateDestination";

export type SquareRoute = {
    initialBearing: number;
    waypoints:LatLngLiteral[];
}

export const generateSquareRoute = (
    origin: LatLngLiteral,
    targetDistanceMeters: number,
    initialBearing: number
):SquareRoute => {
    const sideLength = targetDistanceMeters / 4;
    const waypoint1 = calculateDestination(
        origin,
        sideLength,
        initialBearing
    );

    const waypoint2 = calculateDestination(
        waypoint1,
        sideLength,
        initialBearing + 90
    );

    const waypoint3 = calculateDestination(
        waypoint2,
        sideLength,
        initialBearing + 180
    );
    return {
        initialBearing,
        waypoints: [waypoint1, waypoint2, waypoint3]
    };
};

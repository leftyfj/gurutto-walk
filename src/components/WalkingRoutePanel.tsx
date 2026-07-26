import {
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { GoogleMapArea } from '../components/GoogleMapArea';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import type { WalkingRouteCandidate } from '../types/route';
import type { SelectChangeEvent } from '@mui/material/Select';

const getDirectionLabel = (bearing: number) => {
  const directions = [
      '北',
      '北東',
      '東',
      '南東',
      '南',
      '南西',
      '西',
      '北西'
  ];

  const index = Math.round(bearing / 45) % 8;

  return directions[index];
};

type WalkingRoutePanelProps = {
    targetDistanceMeters: number;
    selectedRoute: WalkingRouteCandidate | null;
    currentLocation: google.maps.LatLngLiteral | null;
    isGeneratingRoutes: boolean;
    onSelectDistance: (event: SelectChangeEvent<number>) => void;
    onRegenerateRoutes: () => Promise<void>;
    onGoogleMapsClick: () => void;
};

export const WalkingRoutePanel = ({
    targetDistanceMeters,
    selectedRoute,
    currentLocation,
    isGeneratingRoutes,
    onSelectDistance,
    onRegenerateRoutes,
    onGoogleMapsClick
}: WalkingRoutePanelProps) => {
    return (
        <>
            <FormControl size="small" sx={{ mb: 1, width: '80%' }}>
                <InputLabel id="distance-select-label">歩きたい距離</InputLabel>
                <Select<number>
                    labelId="distance-select-label"
                    value={targetDistanceMeters}
                    label="歩きたい距離"
                    onChange={onSelectDistance}
                >
                    <MenuItem value={1000}>1,000m</MenuItem>
                    <MenuItem value={2000}>2,000m</MenuItem>
                    <MenuItem value={3000}>3,000m</MenuItem>
                    <MenuItem value={4000}>4,000m</MenuItem>
                    <MenuItem value={5000}>5,000m</MenuItem>
                </Select>
            </FormControl>
            {/* ルート生成ボタンなど */}
            <Box sx={{ mt: 1 }}>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={onRegenerateRoutes}
                    disabled={!currentLocation || isGeneratingRoutes}
                    sx={{ mb: 1 }}
                >
                    {isGeneratingRoutes ? '生成中...' : '新たにルートを生成'}
                </Button>
                <GoogleMapArea selectedRoute={selectedRoute} />
                {selectedRoute && (
                    <Button
                        variant="contained"
                        startIcon={<DirectionsWalkIcon />}
                        onClick={onGoogleMapsClick}
                        sx={{ mt: 1 }}
                    >
                        Googleマップで歩く
                    </Button>
                )}
                {selectedRoute && (
                    <Typography
                        sx={{
                            mt: 1,
                            fontWeight: 'bold'
                        }}
                    >
                        {getDirectionLabel(selectedRoute.initialBearing)}
                        方向へ歩き始めます
                    </Typography>
                )}
            </Box>
        </>
    );
};

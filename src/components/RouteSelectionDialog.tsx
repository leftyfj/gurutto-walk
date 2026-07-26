import {
    Button,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { WalkingRouteCandidate } from '../types/route';
type RouteSelectionDialogProps = {
 open:boolean;
 routeCandidates: WalkingRouteCandidate[];
 targetDistanceMeters: number;
 isGeneratingRoutes: boolean;
 onClose: () => void;
 onSelectRoute: (route: WalkingRouteCandidate) => void;
 onRegenerateRoutes: () => Promise<void>;
};
export const RouteSelectionDialog = ({
 open, routeCandidates, targetDistanceMeters, isGeneratingRoutes, onClose, onSelectRoute, onRegenerateRoutes
}: RouteSelectionDialogProps) => {
 return(
 <Dialog
   open={open}
   onClose={onClose}
   fullWidth
   maxWidth="sm"
    >
  <DialogTitle>
      3つのルートを生成しました
  </DialogTitle>

  <DialogContent>
      <Typography sx={{ mb: 2 }}>
          希望距離：
          {targetDistanceMeters.toLocaleString()}m
      </Typography>

      <Stack spacing={2}>
          {routeCandidates.map((candidate) => {
              const difference =
                  candidate.actualDistanceMeters -
                  targetDistanceMeters;

              const formattedDifference =
                  difference === 0
                      ? '±0m'
                      : difference > 0
                        ? `+${difference.toLocaleString()}m`
                        : `${difference.toLocaleString()}m`;

              return (
                  // 現在の候補表示をここへ移す
                  <Stack
                      key={candidate.id}
                      direction="row"
                      sx={{
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1
                      }}
                      spacing={2}
                  >
                      <Typography sx={{ minWidth: 20, fontWeight: 'bold' }}>
                          {candidate.id}
                      </Typography>

                      <Typography sx={{ whiteSpace: 'nowrap' }}>
                          {candidate.actualDistanceMeters.toLocaleString()}m
                      </Typography>
                      <Typography
                          variant="body2"
                          sx={{ flex: 1, textAlign: 'center' }}
                      >
                          差：
                          {formattedDifference}
                      </Typography>
                      <Button
                          size="small"
                          variant="contained"
                          onClick={() => onSelectRoute(candidate)}
                          sx={{ whiteSpace: 'nowrap' }}
                      >
                          選ぶ
                      </Button>
                  </Stack>
              );
          })}
      </Stack>
  </DialogContent>

  <DialogActions>
      <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRegenerateRoutes}
          disabled={isGeneratingRoutes}
      >
          {isGeneratingRoutes
              ? '生成中...'
              : '別のルートを再生成'}
      </Button>

      <Button onClick={onClose}>
          閉じる
      </Button>
  </DialogActions>
 </Dialog>
 )
}

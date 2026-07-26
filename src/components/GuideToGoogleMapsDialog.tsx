
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    FormControlLabel,
    Checkbox
} from '@mui/material';

type GuideToGoogleMapsDialogProps = {
    open: boolean;
    doNotShowAgain: boolean;
    onClose: () => void;
    onDoNotShowAgainChange: (checked: boolean) => void;
    onStartNavigation: () => void;
};
export const GuideToGoogleMapsDialog = ({
 open,
 doNotShowAgain,
 onClose,
 onDoNotShowAgainChange,
 onStartNavigation
}: GuideToGoogleMapsDialogProps) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle>Googleマップの案内について</DialogTitle>

            <DialogContent>
                <DialogContentText>
                    経由地に到着すると、Googleマップの案内が一度止まります。
                    画面下の「次の目的地」を押すと、続きのルートが表示されます。
                    操作するときは、安全な場所に立ち止まってください。
                </DialogContentText>
              <FormControlLabel
                  sx={{ mt: 2 }}
                  control={
                      <Checkbox
                          checked={doNotShowAgain}
                          onChange={(event) =>
                              onDoNotShowAgainChange(event.target.checked)
                          }
                      />
                  }
                  label="今後この案内を表示しない"
              />
             </DialogContent>
             <DialogActions>
                <Button onClick={onClose}>
                    キャンセル
                </Button>

                <Button variant="contained" onClick={onStartNavigation}>
                    Googleマップを開く
                </Button>
            </DialogActions>
        </Dialog>
    );
};

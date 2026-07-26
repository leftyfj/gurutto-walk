import type { ReactNode } from 'react';
import {
    Button,
    CircularProgress,
    Typography,
    Box,

} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import type { User } from '@supabase/supabase-js';

type AuthSectionProps = {
    isAuthLoading: boolean;
    user: User | null;
    displayName: string | null;
    onGoogleLogin: () => Promise<void>;
    onLogout: () => Promise<void>;
    children: ReactNode;
};

export const AuthSection = ({
 isAuthLoading,
 user,
 displayName,
 onGoogleLogin,
 onLogout,
 children
}: AuthSectionProps) => {
 return(<Box sx={{ textAlign: 'center' }}>
  {isAuthLoading ? (
   <Button
      variant="contained"
      disabled
      startIcon={
          <CircularProgress size={18} color="inherit" />
      }
   >
      ログイン状態を確認中
  </Button>
   ): user ? (
    <>
       <Typography sx={{ mb: 1 }}>
           {displayName}さん、ログイン中
       </Typography>

       <Box sx={{ my: 1 }}>
        <Button
            variant="text"
            size="small"
            onClick={onLogout}
            sx={{
                color: 'text.secondary',
                textTransform: 'none'
            }}
        >
            ログアウト
        </Button>
       </Box>

       {children}
   </>
   ):(
    <Button
      className="google-login-button"
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={onGoogleLogin}
      sx={{
          color: 'text.primary',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          textTransform: 'none',
          px: 3,
          py: 1.2,
          '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: 'text.secondary'
          }
      }}
  >
      Googleアカウントでログイン
  </Button>

   )}
 </Box>
 );
};

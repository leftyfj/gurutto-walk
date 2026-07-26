import { Typography } from '@mui/material';
export const Header = () => {
 return(
  <>
   <Typography variant="h4" component="h1" gutterBottom>
    <span className="app-title__main">ぐるっと散歩</span>
    <span className="app-title__sub">Gurutto Walk</span>
   </Typography>
   <Typography align="center" sx={{ mb: 2 }}>
       歩きたい距離を選ぶだけ。
       <br />
       今いる場所へ戻って来られる散歩コースをご案内します。
   </Typography>
  </>
 )
}

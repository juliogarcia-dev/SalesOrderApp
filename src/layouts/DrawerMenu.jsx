import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  CssBaseline,
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  AppBar as MuiAppBar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  Inventory as InventoryIcon,
  AccountCircle as AccountCircleIcon,
  LocalMall as LocalMallIcon,
} from '@mui/icons-material';

const drawerWidth = 190;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, route: '/' },
  { text: 'Itens', icon: <InventoryIcon />, route: '/items' },
  { text: 'Pedidos', icon: <LocalMallIcon />, route: '/orders' },
  { isDivider: true },
  { text: 'Perfil', icon: <AccountCircleIcon />, route: '/profile' },
];

export default function DrawerMenu({ children }) {
  const theme = useTheme();
  const navigate = useNavigate(); // Hook para navegação
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleMenuItemClick = (route) => {
    navigate(route); // Navega para a rota ao clicar no item
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ backgroundColor: '#282828' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              color: '#1DB954',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ color: '#1DB954 ' }}>
            Projeto StyloArt
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: '#282828',
            color: '#FFFFFF',
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose} sx={{ color: '#1DB954' }}>
            {theme.direction === 'rtl' ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ backgroundColor: '#1DB954' }} />
        <List>
          {menuItems.map((item, index) =>
            item.isDivider ? (
              <Divider
                key={`divider-${index}`}
                sx={{ marginY: 1, backgroundColor: '#1DB954' }}
              />
            ) : (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                  onClick={() => handleMenuItemClick(item.route)} // Navega para a rota
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: 'center',
                      marginRight: open ? 3 : 'auto',
                      color: '#1DB954',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            )
          )}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 3,
          backgroundColor: '#ECECEC',
          color: '#FFFFFF',
          minHeight: '100vh',
        }}
      >
        <DrawerHeader />
        {children} {/* Aqui será renderizado o conteúdo da rota */}
      </Box>
    </Box>
  );
}
import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid2 from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import { Box, CircularProgress, Pagination } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import axios from 'axios';
import AddItemModal from './AddItemModal';
import { useMediaQuery, useTheme } from "@mui/material";

const Img = styled('img')({
  width: '100%',
  height: 'auto',
  maxWidth: '100%',
  objectFit: 'cover',
});

const ItemCard = ({ item, selected, onSelect }) => (
  <Paper
    sx={{
      p: 2,
      margin: 'auto',
      maxWidth: 300,
      flexGrow: 1,
      backgroundColor: selected ? '#f0f8ff' : '#fff',
      border: selected ? '2px solid #1DB954' : 'none',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'normal',
      height: 300,
      width: 200,
    }}
    onClick={() => onSelect(item.id)}
  >
    <Grid2 container spacing={2} sx={{ flexGrow: 2 }}>
      <Grid2 item xs={12}>
        <ButtonBase
          sx={{
            display: 'block',
            width: 'calc(100% + 32px)',
            margin: '-16px',
            overflow: 'hidden',
          }}
        >
          <Img
            sx={{
              width: 'auto',
              height: 'auto',
              objectFit: 'cover',
            }}
            alt={item.name}
            src={item.image || 'https://placehold.co/300x300'}
          />
        </ButtonBase>
      </Grid2>
      <Grid2 item xs={12}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.5rem', mt: 1 }}>
          {item.name}
        </Typography>
        <Typography variant="h6" component="div" sx={{ color: '#1DB954', fontSize: '1.2rem' }}>
          R$ {item.price.toFixed(2).replace('.', ',')}
        </Typography>
      </Grid2>
    </Grid2>
  </Paper>
);

export default function ItemsPage() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Verifica se a tela é menor que MD
  const itemsPerPage = isMobile ? 6 : 14;

  useEffect(() => {
    const fetchItems = async () => {      
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/Items`);        
        setItems(response.data);
        setOriginalItems(response.data);
      } catch (error) {
        console.error('Erro ao buscar os itens:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();    
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedItems([]); // Rola suavemente para o topo
  }, [page]);

  useEffect(() => {
    if (search) {
      const filteredItems = originalItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setItems(filteredItems);
    } else {
      setItems(originalItems);
    }
  }, [search, originalItems]);

  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    setIsEditMode(false);
    setSelectedItems([]);
    setModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedItems.length === 1) {
      setIsEditMode(true);
      setModalOpen(true);
    }
  };

  const handleDelete = () => {
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(
        selectedItems.map(async (id) => {
          await axios.delete(`${process.env.REACT_APP_API_URL}/Items/${id}`);
        })
      );
      setItems((prevItems) => prevItems.filter((item) => !selectedItems.includes(item.id)));
      setOriginalItems((prevItems) => prevItems.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    } catch (error) {
      console.error('Erro ao excluir itens:', error);
    } finally {
      setOpenDialog(false);
    }
  };

  const cancelDelete = () => {
    setOpenDialog(false);
  };

  const fetchItemsBySearch = async () => {
    setSelectedItems([]);
    setLoading(true);    
    try {
      const url = `${process.env.REACT_APP_API_URL}/Items`;
      const config = search ? { params: { search } } : {};
      const response = await axios.get(url, config);
      setItems(response.data);
      setOriginalItems(response.data);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fetchItemsBySearch();
    }
  };

  // Paginação
  const paginatedItems = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
      {/* Campo de pesquisa no canto superior esquerdo */}
      <Box sx={{ width: '100%', display: 'flex',position: 'fixed', justifyContent:'center', alignItems: 'center', paddingTop: 4, zIndex: 1000 }}>
        <Paper
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            width: '40%',
            maxWidth: '600px',
            minWidth: '250px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '1.5rem',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: '1.2rem' }}
            placeholder="Pesquisar itens"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <IconButton type="button" sx={{ p: '20px' }} aria-label="search" onClick={fetchItemsBySearch}>
            <SearchIcon />
          </IconButton>
        </Paper>

        {/* Botões no canto superior direito */}
        <Box sx={{
                position: { xs: 'fixed', md: 'absolute' }, // Usamos absolute para posicionar em relação ao contêiner pai
                right: { xs: 16, md: 'calc(40% - 15rem)' }, // Distância da direita (40% é a largura do campo de pesquisa)
                bottom: { xs: '1rem', md: 'auto' }, // No mobile, fica no canto inferior
                top: { xs: 'auto', md: '2.3rem' }, // Em telas maiores, fica no canto superior
                display: 'flex',
                gap: 2,
                zIndex: 1000,
                justifyContent: 'flex-end',
                flexDirection: { xs: 'column', md: 'row' }, // Coluna no mobile, linha em telas maiores                
            }}>
              
          <Fab color="success" onClick={handleAdd} sx={{position: {md: 'absolute'}}}>
            <AddIcon />
          </Fab>
          {selectedItems.length > 0 && (
            <>
              <Fab color="warning" onClick={handleEdit} sx={{left: {md: '9rem'}}}>
                <EditIcon />
              </Fab>
              <Fab color="error" onClick={handleDelete} sx={{left: {md: '9rem'}}}>
                <DeleteIcon />
              </Fab>
            </>
          )}
        </Box>
      </Box>

      {/* Grid com paginação */}
      <Box sx={{ width: '100%', flexGrow: 1, display: 'flex', justifyContent: 'center', paddingTop: {xs: '9rem', md:'10rem'}}}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%', maxWidth: '90%'}}>
            <Grid2 container spacing={4} justifyContent="center">
              {paginatedItems.map((item) => (
                <Grid2 item key={item.id} >
                  <ItemCard item={item} selected={selectedItems.includes(item.id)} onSelect={handleSelect} />
                </Grid2>
              ))}
            </Grid2>
            {/* Paginação */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: '1rem', mt: '1.5rem', ml: {xs: '1rem'}, maxWidth: {xs:'90%', md: '100%'}}}>
              <Pagination
                count={Math.ceil(items.length / itemsPerPage)}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="success"                
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Modal e Dialog */}
      <AddItemModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
        selectedItem={items.find((item) => item.id === selectedItems[0])}
        isEditMode={isEditMode}
      />

      <Dialog open={openDialog} onClose={cancelDelete} disableScrollLock>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir os itens selecionados?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
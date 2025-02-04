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
import { Box, CircularProgress } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import axios from 'axios';
import AddItemModal from './AddItemModal';

const Img = styled('img')({
  width: '100%',
  height: 'auto',
  maxWidth: '100%',
  objectFit: 'cover'
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

  useEffect(() => {
    document.body.style.overflow = 'hidden'; // Impede rolagem da página
  
    return () => {
      document.body.style.overflow = ''; // Restaura a rolagem ao desmontar o componente
    };
  }, []);

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

  // Função que busca os itens filtrados no banco de dados
  const fetchItemsBySearch = async () => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_URL}/Items`;
      const config = search ? { params: { search } } : {}; // Condiciona a inclusão do parâmetro
      const response = await axios.get(url, config);
      setItems(response.data);
      setOriginalItems(response.data);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a tecla "Enter" no campo de pesquisa
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Impede o envio do formulário
      fetchItemsBySearch(); // Executa a pesquisa
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', height:'100vh', overflow: 'hidden'}}>
  {/* Box para o campo de pesquisa */}
  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 4, mt: 4 }} >
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
        mb: 2,
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
  </Box>

  {/* Box para a grid */}
  <Box sx={{ width: '100%', flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    ) : (
    <Box sx={{ width: '100%', maxWidth: { xs: '70%', md: '95%' }, height: 'calc(80vh - 140px)', overflow: 'auto' }}>
      <Grid2 container spacing={4} justifyContent="center">
        {items.map((item) => (
          <Grid2 item key={item.id} xs={12} sm={6} md={4}>
            <ItemCard item={item} selected={selectedItems.includes(item.id)} onSelect={handleSelect} />
          </Grid2>
        ))}
      </Grid2>
    </Box>
    )}
  </Box>

  <Box
  sx={{        
    position: { xs: 'fixed', md: 'relative' },
    bottom: { xs: 20, md: 0 },
    right: { xs: 16, md: '50%' },
    transform: { md: 'translateX(50%)' },
    width: { md: '100%' }, 
    flexGrow: 2, 
    display: 'flex', 
    justifyContent: { xs: 'flex-end', md: 'center' },  
    gap: 2,
    flexDirection: { xs: 'column', md: 'row' }, 
  }}
    >
  <Fab color="success" onClick={handleAdd}>
    <AddIcon />
  </Fab>
  {selectedItems.length > 0 && (
    <>
      <Fab color="warning" onClick={handleEdit}>
        <EditIcon />
      </Fab>
      <Fab color="error" onClick={handleDelete}>
        <DeleteIcon />
      </Fab>
    </>
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
      <Button onClick={cancelDelete} color="primary">Cancelar</Button>
      <Button onClick={confirmDelete} color="error">Confirmar</Button>
    </DialogActions>
  </Dialog>
</Box>
  );
}
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
  width: 'auto',
  height: 'auto',
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
      height: 350,
      width: 250,
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
              width: '100%',
              height: '100%',
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
  const [originalItems, setOriginalItems] = useState([]); // Armazena os itens originais
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/Items`);
        setItems(response.data);
        setOriginalItems(response.data); // Armazena os itens originais
      } catch (error) {
        console.error('Erro ao buscar os itens:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Filtra os itens em memória conforme o usuário digita
  useEffect(() => {
    if (search) {
      const filteredItems = originalItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setItems(filteredItems);
    } else {
      setItems(originalItems); // Restaura a lista completa se a pesquisa estiver vazia
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
    <div>
      <Paper
        component="form"
        onSubmit={(e) => e.preventDefault()} // Impede o envio do formulário
        sx={{
          position: 'fixed',
          top: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40%',
          maxWidth: '600px',
          minWidth: '250px',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '1.5rem',
          backgroundColor: 'white',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          bottom: 'auto',
          overflow: 'hidden',
          '@media (max-width: 600px)': {
            left: '58%',
            width: '70%',
          },
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, fontSize: '1.2rem' }}
          placeholder="Pesquisar itens"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress} // Adiciona o listener para a tecla "Enter"
        />
        <IconButton type="button" sx={{ p: '20px' }} aria-label="search" onClick={fetchItemsBySearch}>
          <SearchIcon />
        </IconButton>
      </Paper>

      {loading ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid2 container spacing={4} justifyContent="center" sx={{ paddingTop: '140px',  
          '@media (max-width: 600px)': {
          left: '50%',
          transform: 'translateX(9%)',
        }, }} >
          {items.map((item) => (
            <Grid2 item key={item.id} xs={12} sm={6} md={4}>
              <ItemCard item={item} selected={selectedItems.includes(item.id)} onSelect={handleSelect} />
            </Grid2>
          ))}
        </Grid2>
      )}

      <Fab color="success" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={handleAdd} >
        <AddIcon />
      </Fab>
      {selectedItems.length > 0 && (
        <>
          <Fab color="warning" sx={{ position: 'fixed', bottom: 80, right: 16 }} onClick={handleEdit}>
            <EditIcon />
          </Fab>
          <Fab color="error" sx={{ position: 'fixed', bottom: 144, right: 16 }} onClick={handleDelete}>
            <DeleteIcon />
          </Fab>
        </>
      )}

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
    </div>
  );
}
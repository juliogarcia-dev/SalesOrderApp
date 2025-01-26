import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid2 from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
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
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);  // Adicionado para controlar o item selecionado para edição

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Items`);
      setItems(response.data);
    } catch (error) {
      console.error('Erro ao buscar os itens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    setIsEditMode(false);
    setSelectedItem(null);  // Reseta a seleção ao adicionar um item
    setModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedItems.length === 1) {
      const selectedItem = items.find(item => item.id === selectedItems[0]);
      setIsEditMode(true);  // Muda para o modo de edição
      setSelectedItem(selectedItem);  // Armazena o item selecionado
      setModalOpen(true);
    }
  };

  const handleModalConfirm = async (name, price) => {
    if (name.trim() && price) {
      try {
        setLoading(true);
        if (selectedItem) {
          // Atualiza o item
          await axios.put(`${process.env.REACT_APP_API_URL}/Items/${selectedItem.Id}`, {
            name,
            price,
          });
          fetchItems();  // Atualiza a lista de itens após a edição
        } else {
          // Adiciona um novo item
          const { data: newItem } = await axios.post(`${process.env.REACT_APP_API_URL}/Items`, {
            name,
            price,
          });
          setItems((prevItems) => [...prevItems, newItem]);  // Adiciona o novo item à lista
        }
        setLoading(false);
        setModalOpen(false);  // Fecha o modal
      } catch (error) {
        console.error('Erro ao salvar item:', error);
        setLoading(false);
      }
    } else {
      console.error('Nome e preço são obrigatórios.');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    fetchItems();
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      await Promise.all(
        selectedItems.map(async (id) => {
          await axios.delete(`${process.env.REACT_APP_API_URL}/Items/${id}`);
        })
      );

      setItems((prevItems) => prevItems.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      console.log('Itens excluídos com sucesso');
    } catch (error) {
      console.error('Erro ao excluir itens:', error);
    }
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    handleDialogClose();
    handleDelete();
  };

  return (
    <div>
      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          fetchItems();
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: '50%',
          width: '100%',
          minWidth: '300px',
          mb: 4,
          mt: 4,
          mx: 'auto',
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, fontSize: '1.2rem' }}
          placeholder="Pesquisar itens"
          inputProps={{ 'aria-label': 'search items' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton type="button" sx={{ p: '20px', fontSize: '2.5rem' }} aria-label="search" onClick={fetchItems}>
          <SearchIcon />
        </IconButton>
        <IconButton
          type="button"
          sx={{ p: '20px', color: '#1DB954', fontSize: '2.5rem' }}
          aria-label="add item"
          onClick={handleAdd}
        >
          <AddIcon />
        </IconButton>
        {selectedItems.length > 0 && (
          <>
            <IconButton
              type="button"
              sx={{ p: '20px', color: '#ffa500', fontSize: '2.5rem' }}
              aria-label="edit items"
              onClick={handleEdit}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              type="button"
              sx={{ p: '20px', color: '#ff0000', fontSize: '2.5rem' }}
              aria-label="delete items"
              onClick={handleDialogOpen}
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Paper>

      {loading ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <Grid2 container spacing={4}>
          {filteredItems.map((item) => (
            <Grid2 item key={item.id} xs={12} sm={6} md={4}>
              <ItemCard
                item={item}
                selected={selectedItems.includes(item.id)}
                onSelect={handleSelect}
              />
            </Grid2>
          ))}
        </Grid2>
      )}

      <AddItemModal
        open={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        selectedItem={selectedItem}
        isEditMode={isEditMode}
      />

      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirma a exclusão?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Essa ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
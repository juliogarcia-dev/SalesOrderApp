import React, { useState } from 'react';
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
import AddItemModal from './AddItemModal'; // Importando o modal
import axios from 'axios'; // Importando axios para fazer requisições HTTP
import CircularProgress from '@mui/material/CircularProgress'; // Importando o CircularProgress para o loading

// Estilizando a imagem
const Img = styled('img')({
  width: 'auto',
  height: 'auto',   // A imagem vai cobrir a área disponível sem distorcer    
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
      justifyContent: 'normal', // Para empurrar o conteúdo para o topo
      height: 350,
      width: 250, // Definindo uma altura maior para o card
    }}
    onClick={() => onSelect(item.id)}
  >
    <Grid2 container spacing={2} sx={{ flexGrow: 2 }}>
      <Grid2 item xs={12}>
        <ButtonBase  sx={{
            display: 'block',
            width: 'calc(100% + 32px)', // Ignora a margem interna (ajuste conforme necessário)
            margin: '-16px', // Remove a margem interna
            overflow: 'hidden', // Evita transbordamento da imagem
          }}>
          <Img sx={{
              width: '100%',
              height: '100%', // Ajuste a altura conforme necessário
              objectFit: 'cover', // Garante que a imagem preencha o espaço sem distorções
            }} alt={item.name} src={item.image || 'https://placehold.co/300x300'} />
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

  // Função para buscar os itens na API
  const fetchItems = async () => {
    setLoading(true); // Ativa o loading antes de começar a requisição
    try {
      const response = await axios.get('http://localhost:5033/api/items');
      setItems(response.data); // Atualiza o estado com os itens retornados da API
    } catch (error) {
      console.error('Erro ao buscar os itens:', error);
    } finally {
      setLoading(false); // Desativa o loading após a requisição
    }
  };

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    setModalOpen(true);
  };

  const handleModalConfirm = (newItem) => {
    setItems((prevItems) => [...prevItems, { ...newItem, id: prevItems.length + 1 }]);
    setModalOpen(false);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleEdit = () => {
    console.log('Editar itens:', selectedItems);
  };

  const handleDelete = async () => {
    console.log('Excluir itens:', selectedItems);

    if (selectedItems.length === 0) return; // Não faz nada se nenhum item estiver selecionado

    try {
      // Percorre os IDs selecionados e dispara as requisições DELETE
      await Promise.all(
        selectedItems.map(async (id) => {
          await axios.delete(`http://localhost:5033/api/items/${id}`);
        })
      );
  
      // Remove os itens excluídos do estado local
      setItems((prevItems) => prevItems.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]); // Limpa a seleção após exclusão
      console.log('Itens excluídos com sucesso');
    } catch (error) {
      console.error('Erro ao excluir itens:', error);
    }
  };

  const handleSearch = () => {
    fetchItems(); // Quando a lupa for clicada, chama a função de consulta à API
  };

  return (
    <div>
      <Paper
        component="form"
        sx={{          
          display: 'flex',
          alignItems: 'center',
          maxWidth: '50%',
          width: '100%', // Permite que ele se ajuste ao tamanho da tela
          minWidth: '300px', // Define um limite mínimo para evitar que fique muito pequeno
          mb: 4,
          mt: 4,
          mx: 'auto', // Centraliza horizontalmente
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, fontSize: '1.5rem'}} // Aumenta o tamanho da fonte da pesquisa
          placeholder="Pesquisar itens"
          inputProps={{ 'aria-label': 'search items' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}          
        />
        <IconButton type="button" sx={{ p: '20px', fontSize: '2.5rem' }} aria-label="search" onClick={handleSearch}>
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
              onClick={handleDelete}
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Paper>

      {/* Exibição do carregamento */}
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
      />
    </div>
  );
}
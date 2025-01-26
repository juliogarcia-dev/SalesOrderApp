import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { NumericFormat } from 'react-number-format';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%', // Ajusta para dispositivos menores
  maxWidth: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  maxHeight: '90vh', // Limita a altura do modal
  overflowY: 'auto', // Permite rolagem vertical
};

const CustomButton = styled(Button)({
  height: 50,
  fontSize: 16,
});

const CloseButton = styled('div')({
  position: 'absolute',
  top: 10,
  right: 10,
  cursor: 'pointer',
  zIndex: 1,
});

export default function AddItemModal({ open, onClose, onConfirm, selectedItem, isEditMode }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [id, setId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setId(selectedItem.id);
      setName(selectedItem.name);
      setPrice(selectedItem.price);
    } else {
      setName('');
      setPrice('');
    }
  }, [selectedItem]); // Atualiza quando o selectedItem muda

  const handlePriceChange = (values) => {
    setPrice(values.value);
  };

  const handleConfirm = async () => {
    if (name.trim() && price) {
      setLoading(true);
      try {
        if (selectedItem) {
          // Atualizar o item existente
          await axios.put(`${process.env.REACT_APP_API_URL}/Items/${selectedItem.id}`, {
            id,
            name,
            price,
          });
          setMessage(`Item ${name} atualizado com sucesso!`);
        } else {
          // Adicionar novo item
          const { data: newItem } = await axios.post(`${process.env.REACT_APP_API_URL}/Items`, {
            name,
            price,
          });
          setMessage(`Item ${newItem.name} adicionado com sucesso!`);
        }
        setName('');
        setPrice('');
        setLoading(false);
        setTimeout(() => {
          setMessage('');
        }, 3000);        
      } catch (error) {
        console.error('Erro ao salvar item:', error);
        setMessage('Erro ao salvar item. Tente novamente.');
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box sx={style}>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
        <Typography id="modal-title" variant="h6" component="h2">
          {isEditMode ? 'Editar Item' : 'Adicionar Novo Item'}
        </Typography>
        <TextField
          id="item-name"
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          fullWidth
          autoFocus
        />
        <NumericFormat
          customInput={TextField}
          label="Preço"
          value={price}
          onValueChange={handlePriceChange}
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          variant="outlined"
          fullWidth
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            marginTop: 2,
          }}
        >
          <CustomButton
            variant="contained"
            color="success"
            fullWidth
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (isEditMode ? 'Atualizando...' : 'Adicionando...') : 'Confirmar'}
          </CustomButton>
        </Box>

        <Box
          sx={{
            height: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          {message && (
            <Typography color={message.includes('sucesso') ? 'success.main' : 'error.main'} variant="subtitle1">
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
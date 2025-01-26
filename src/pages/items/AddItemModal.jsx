import React, { useState } from 'react';
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
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
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

export default function AddItemModal({ open, onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Para controlar o estado de carregamento

  const handlePriceChange = (values) => {
    setPrice(values.value);
  };

  const handleConfirm = async () => {
    if (name.trim() && price) {
      try {
        setLoading(true); // Ativa o loading
        const { data: newItem } = await axios.post(`${process.env.REACT_APP_API_URL}/Items`, {
          name,
          price,
        });

        // Exibe a mensagem de sucesso
        setMessage(`Item ${newItem.name} adicionado com sucesso!`);
        setName(''); // Limpa o nome
        setPrice(''); // Limpa o preço
        setLoading(false); // Desativa o loading
        setTimeout(() => {
          setMessage(''); // Limpa a mensagem após 5 segundos
        }, 3000); 

        // Dá foco no campo de nome para o próximo item
        document.getElementById('item-name').focus();
      } catch (error) {
        console.error('Erro ao adicionar item:', error);
        setLoading(false); // Desativa o loading em caso de erro
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <Box sx={style}>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
        <Typography id="modal-title" variant="h6" component="h2">
          Adicionar Novo Item
        </Typography>
        <TextField
          id="item-name"
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          fullWidth
          autoFocus // Foca automaticamente no campo de nome
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
            disabled={loading} // Desabilita o botão enquanto está carregando
          >
            {loading ? 'Adicionando...' : 'Confirmar'}
          </CustomButton>
        </Box>

        {/* Espaço fixo para exibir a mensagem de sucesso */}
        <Box
          sx={{
            height: 10, // Altura fixa para a área da mensagem
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          {message && (
            <Typography color="success.main" variant="subtitle1">
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
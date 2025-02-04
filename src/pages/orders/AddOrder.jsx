import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Autocomplete,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Toolbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

// Função para criar dados de exemplo
function createData(id, name, price, quantity) {
  return { id, name, price, quantity };
}

// Cabeçalho da tabela
const headCells = [
  { id: 'name', numeric: false, label: 'Nome do Item' }  
];

// Componente do cabeçalho da tabela
function EnhancedTableHead({ order, orderBy, onRequestSort, selectedCount, rowCount, onSelectAllClick }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={selectedCount > 0 && selectedCount < rowCount}
            checked={rowCount > 0 && selectedCount === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}           
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}              
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// Barra de ferramentas da tabela
function EnhancedTableToolbar({ selected, onDelete }) {
  return (
    <Toolbar>
      {selected.length > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1">
          {selected.length} selecionados
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant="h6">
          Itens do Pedido
        </Typography>
      )}
      {selected.length > 0 && (
        <Tooltip title="Excluir">
          <IconButton onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

// Componente principal da página de cadastro de pedidos
export default function AddOrder() {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [itens, setItens] = useState([]);  
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingItens, setLoadingItens] = useState(false);
  const itemSearchRef = useRef(null); // Cria uma referência para o campo de pesquisa
  const [searchText, setSearchText] = useState(""); // Estado para o texto digitado
  const [selectedItem, setSelectedItem] = useState(null); // Estado para o item selecionado

  // Busca clientes com debounce
  useEffect(() => {
    if (clienteSelecionado) return;

    const debounceTimer = setTimeout(() => {
      if (clienteSelecionado === null) {
        setLoadingClientes(true);
        axios.get(`${process.env.REACT_APP_API_URL}/Clientes`, { params: { search: clienteSelecionado } })
          .then((response) => setClientes(response.data))
          .catch((error) => console.error('Erro ao buscar clientes:', error))
          .finally(() => setLoadingClientes(false));
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [clienteSelecionado]);

  useEffect(() => {
    // Verifica se o termo de busca tem mais de 3 caracteres
    if (!searchText || searchText.length < 3) {
        setItens([]); // Limpa a lista de itens se o termo for muito curto
        return;
    }

    // Configura o debounce
    const debounceTimer = setTimeout(() => {
        setLoadingItens(true);
        axios.get(`${process.env.REACT_APP_API_URL}/Items/search`, { params: { name: searchText } })
            .then((response) => setItens(response.data))
            .catch((error) => console.error('Erro ao buscar itens:', error))
            .finally(() => setLoadingItens(false));
    }, 1000); // 1 segundo de debounce

    // Limpa o timeout anterior se o termo de busca mudar
    return () => clearTimeout(debounceTimer);
  }, [searchText]);

  const handleFocus = () => {
    if (itemSearchRef.current) {
      // Verifica se é um dispositivo móvel (largura menor que 768px)
      const isMobile = window.innerWidth < 768;
  
      if (isMobile) {
        // Adiciona um pequeno atraso para garantir que a renderização da página tenha sido concluída
        setTimeout(() => {
          itemSearchRef.current.scrollIntoView({
            behavior: 'smooth',       
            block: 'start',  // Garante que o campo seja exibido no topo da tela
          });
        }, 200); // 200ms de atraso
      }
    }
  };

  // Adiciona item ao grid
  const handleAddItem = (item) => {
    const newRow = createData(item.id, item.name, item.price, 1);
    setRows([...rows, newRow]);    
  };

  // Atualiza o texto digitado no campo de pesquisa
  const handleInputChange = (event, newValue) => {
    setSearchText(newValue);
  };
  
  // Atualiza o item selecionado e adiciona à grid
  const handleItemSelect = (event, selectedItem) => {
    if (selectedItem) {
        handleAddItem(selectedItem);
        setSelectedItem(null); // Limpa o item selecionado
        setSearchText(""); // Limpa o texto do campo de pesquisa
    }
  };

  // Ordenação
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Seleção de todos os itens
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  // Seleção de um item
  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  // Exclusão de itens selecionados
  const handleDeleteSelected = () => {
    const newRows = rows.filter((row) => !selected.includes(row.id));
    setRows(newRows);
    setSelected([]);
  };

  // Paginação
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Linhas visíveis na tabela
  const visibleRows = rows
    .sort((a, b) => {
      if (order === 'asc') {
        return a[orderBy] > b[orderBy] ? 1 : -1;
      } else {
        return a[orderBy] < b[orderBy] ? 1 : -1;
      }
    })
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <Box sx={{ 
        p: { xs: 2, sm: 10 }, // Padding menor em telas pequenas
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',              
      }}>
        {/* Dados do Cliente */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          width: '100%', 
          maxWidth: {sm: '800px' } // Ajusta o maxWidth para telas pequenas
        }}       
        >
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            Dados do Cliente
          </Typography>
          <Autocomplete
            options={clientes}
            getOptionLabel={(cliente) => cliente.nome}
            loading={loadingClientes}
            onInputChange={(event, newValue) => setClienteSelecionado(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar Cliente"
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingClientes ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Paper>
    
        {/* Adicionar Itens */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          width: '100%', 
          maxWidth: { sm: '800px' } // Ajusta o maxWidth para telas pequenas
        }}        
        >
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            Adicionar Itens
          </Typography>
          <Autocomplete
            options={itens}
            getOptionLabel={(item) => item.name}
            loading={loadingItens}
            value={selectedItem} // Usa o item selecionado
            inputValue={searchText} // Usa o texto digitado
            onInputChange={handleInputChange} // Atualiza o texto digitado
            onChange={handleItemSelect} // Atualiza o item selecionado
            listbox={{
              sx: {
                  maxHeight: 300, // Define a altura máxima da caixa de resultados
                  overflow: 'auto', // Adiciona scroll se necessário
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar Item"
                variant="outlined"
                fullWidth        
                ref={itemSearchRef} // Referência para o Paper
                onFocus={handleFocus} // Rola a página ao focar no campo                        
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingItens ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Paper>
    
        {/* Tabela de Itens */}
        <Paper sx={{ 
          p: 3, 
          width: '100%', 
          maxWidth: {sm: '800px' } // Ajusta o maxWidth para telas pequenas
        }}>
          <EnhancedTableToolbar selected={selected} onDelete={handleDeleteSelected} />
          <TableContainer> {/* Permite rolagem horizontal */}
            <Table>
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                selectedCount={selected.length}
                rowCount={rows.length}
                onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {visibleRows.map((row) => {
                  const isSelected = selected.includes(row.id);
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isSelected} />
                      </TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">{row.price.toFixed(2)}</TableCell>
                      <TableCell align="right">{row.quantity}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    );
}
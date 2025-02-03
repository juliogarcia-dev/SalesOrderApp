import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  { id: 'name', numeric: false, label: 'Nome do Item' },
  { id: 'price', numeric: true, label: 'Preço (R$)' },
  { id: 'quantity', numeric: true, label: 'Quantidade' },
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
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingItens, setLoadingItens] = useState(false);

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

  // Busca itens com debounce
  useEffect(() => {
    if (itemSelecionado) return;

    const debounceTimer = setTimeout(() => {
      if (itemSelecionado === null) {
        setLoadingItens(true);
        axios.get(`${process.env.REACT_APP_API_URL}/Itens`, { params: { search: itemSelecionado } })
          .then((response) => setItens(response.data))
          .catch((error) => console.error('Erro ao buscar itens:', error))
          .finally(() => setLoadingItens(false));
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [itemSelecionado]);

  // Adiciona item ao grid
  const handleAddItem = (item) => {
    const newRow = createData(item.id, item.name, item.price, 1);
    setRows([...rows, newRow]);
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
    <Box sx={{ p: 3 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ color: '#1DB954' }}>
        <Link
         component={Link}
          to="/orders" 
          style={{
            textDecoration: 'none', // Remove o sublinhado padrão
            color: '#1DB954', // Mantém a cor verde       
          }}                   
        >
          Pedidos
        </Link >
        {' > '}
        <Box
          component="span"
          sx={{ textDecoration: 'underline' }} // Sublinhado para "Adicionar Pedido"
        >
          Adicionar Pedido
        </Box>
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Adicionar Itens
        </Typography>
        <Autocomplete
          options={itens}
          getOptionLabel={(item) => item.name}
          loading={loadingItens}
          onInputChange={(event, newValue) => setItemSelecionado(newValue)}
          onChange={(event, selectedItem) => {
            if (selectedItem) {
              handleAddItem(selectedItem);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar Item"
              variant="outlined"
              fullWidth
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
      <Paper sx={{ p: 3 }}>
        <EnhancedTableToolbar selected={selected} onDelete={handleDeleteSelected} />
        <TableContainer>
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
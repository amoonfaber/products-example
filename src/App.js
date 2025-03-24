import './App.css';
import {DataGrid} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {useEffect, useState} from "react";
import {
    createTheme,
    CssBaseline,
    ThemeProvider,
    Modal,
} from "@mui/material";

const modalContent = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    color: 'palette.text.primary',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const productContentRow = {
    display: 'flex',
    padding: '5px 0',
}

const productContentRowHeader = {
    fontWeight: 'bold',
}

const productsColumns = [
    {field: 'id', headerName: '#', width: 90, cellClassName: 'id-cell',},
    {field: 'title', headerName: 'Title', width: 300, cellClassName: 'title-cell',},
    {field: 'description', headerName: 'Description', width: 600, cellClassName: 'description-cell',},
    {
        field: 'thumbnail',
        headerName: 'Image',
        width: 200,
        renderCell: (params) => <img src={params.value} style={{maxHeight: '100%', maxWidth: '100%'}} alt=""/>
    },
    {
        field: 'createdAt',
        headerName: 'Date',
        width: 400,
        cellClassName: 'created-at-cell',
    }
];

const App = () => {
    const [theme, setTheme] = useState(createTheme({palette: {mode: 'dark'}}));
    const [products, setProducts] = useState();
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState();
    const [selectedProductImage, setSelectedProductImage] = useState();
    const [filterState, setFilterState] = useState();
    const [sortState, setSortState] = useState();

    useEffect(() => {
        try {
            fetch(process.env.REACT_APP_API)
                .then((response) => response.json())
                .then((json) => {
                    json.products.map(item => {
                        item.createdAt = item.meta.createdAt;
                        return item;
                    });
                    return json;
                })
                .then(data => {
                    setProducts(data.products);
                });
        } catch (e) {
            console.log('error', e);
        }

        setSortState(JSON.parse(localStorage.getItem('productsSort')) || []);
        setFilterState(JSON.parse(localStorage.getItem('productsFilter')) || {items: []});
        setTheme(createTheme({palette: {mode: localStorage.getItem('productsTheme') || 'light'}}));
    }, []);

    const toggleColorMode = () => {
        let themeToUpdate;
        if (theme.palette.mode === 'light') {
            themeToUpdate = createTheme({
                palette: {
                    mode: 'dark',
                },
            });
            localStorage.setItem('productsTheme', 'dark');
        } else {
            themeToUpdate = createTheme({
                palette: {
                    mode: 'light',
                },
            })
            localStorage.setItem('productsTheme', 'light');
        }
        setTheme(themeToUpdate);
    }

    const updateFilter = (filter) => {
        localStorage.setItem('productsFilter', JSON.stringify(filter));
        setFilterState(filter);
    }

    const updateSort = (sort) => {
        localStorage.setItem('productsSort', JSON.stringify(sort));
        setSortState(sort);
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="App">
                <span style={{cursor: 'pointer'}} onClick={toggleColorMode}>{theme.palette.mode} mode</span>
                <Box
                    sx={{
                        height: 400,
                        width: '100%',
                        '& .id-cell': {
                            color: '#1A7246FF',
                            fontWeight: '600',
                        },
                        '& .title-cell': {
                            color: '#1A3E72FF',
                            fontWeight: '600',
                        },
                        '& .description-cell': {
                            color: '#722F1AFF',
                            fontWeight: '600',
                        },
                        '& .created-at-cell': {
                            color: '#591A72FF',
                            fontWeight: '600',
                        }
                    }}
                >
                    <DataGrid
                        onCellClick={(params, event) => {
                            event.defaultMuiPrevented = true;
                            setShowModal(true);
                            if (params.field === 'thumbnail') {
                                setSelectedProductImage(params.row.thumbnail);
                            } else {
                                setSelectedProduct(params.row);
                            }
                        }}
                        filterModel={filterState}
                        onFilterModelChange={(filter) => updateFilter(filter)}
                        sortModel={sortState}
                        onSortModelChange={(sort) => updateSort(sort)}
                        sort
                        rows={products}
                        columns={productsColumns}
                        getRowHeight={() => {
                            return 100;
                        }}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        pageSizeOptions={[10]}
                        disableRowSelectionOnClick
                        checkboxSelection={false}
                    />
                </Box>
                <Modal
                    open={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedProduct(null);
                        setSelectedProductImage(null);
                    }}
                >
                    <Box sx={modalContent}>
                        {
                            selectedProductImage &&
                            <img src={selectedProductImage} alt=""/>
                        }
                        {
                            selectedProduct &&
                            <>
                                <div style={productContentRow}>
                                    <span style={productContentRowHeader}>ID:</span>&nbsp;
                                    <span>{selectedProduct.id}</span>
                                </div>
                                <div style={productContentRow}>
                                    <span style={productContentRowHeader}>Title:</span>&nbsp;
                                    <span>{selectedProduct.title}</span>
                                </div>
                                <div style={productContentRow}>
                                    <span style={productContentRowHeader}>Description:</span>&nbsp;
                                    <span>{selectedProduct.description}</span>
                                </div>
                                <div style={productContentRow}>
                                    <span style={productContentRowHeader}>Created at:</span>&nbsp;
                                    <span>{selectedProduct.createdAt}</span>
                                </div>
                            </>
                        }
                    </Box>
                </Modal>
            </div>
        </ThemeProvider>
    );
}

export default App;

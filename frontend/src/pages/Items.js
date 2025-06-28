import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  TextField,
  Typography,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  TablePagination,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  AddPhotoAlternate as AddImageIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import { FixedSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

function Items() {
  const {
    items,
    fetchItemsPage,
    addItem,
    isLoading,
    error,
    totalItems,
    totalPages,
    clearPagesCache,
  } = useData();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddItem, setOpenAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    price: "",
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef();
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [containerRef, setContainerRef] = useState(null);

  // Calculate grid dimensions for virtualization
  const gridConfig = useMemo(() => {
    const columns = isMobile ? 1 : 2;
    const gap = 24;
    const padding = 24;

    const containerWidth = containerRef?.clientWidth || window.innerWidth;
    const availableWidth = containerWidth - padding * 2;
    const columnWidth = Math.floor(
      (availableWidth - gap * (columns - 1)) / columns
    );
    const rowHeight = 520;

    return {
      columns,
      columnWidth,
      rowHeight,
      gap,
      containerWidth: availableWidth,
      totalWidth: containerWidth,
    };
  }, [isMobile, containerRef?.clientWidth]);

  const rows = Math.ceil(items.length / gridConfig.columns);

  useEffect(() => {
    fetchItemsPage(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage, searchQuery]);

  // Force re-render when container is mounted
  useEffect(() => {
    if (containerRef) {
      const timer = setTimeout(() => {
        setContainerRef(containerRef);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [containerRef]);

  const handleInputChange = (e) => setSearchInput(e.target.value);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleInputChangeForm = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewItem((prev) => ({ ...prev, image: file }));
    }
  };

  const handleImageButtonClick = () => fileInputRef.current.click();

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const itemData = {
        name: newItem.name,
        category: newItem.category,
        price: parseFloat(newItem.price),
      };
      await addItem(itemData, newItem.image);
      setOpenAddItem(false);
      setNewItem({ name: "", category: "", price: "", image: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      fetchItemsPage(currentPage, itemsPerPage, searchQuery);
    } catch (error) {
      if (error.message && error.message !== "Failed to fetch") {
        alert("Error adding item: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenAddItem(false);
    setNewItem({ name: "", category: "", price: "", image: null });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
    clearPagesCache();
  };

  // Virtualized item renderer
  const ItemRenderer = ({ columnIndex, rowIndex, style }) => {
    const itemIndex = rowIndex * gridConfig.columns + columnIndex;
    const item = items[itemIndex];

    if (!item) return null;

    return (
      <div
        style={{
          ...style,
          paddingRight: gridConfig.gap,
          paddingBottom: gridConfig.gap,
        }}
      >
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            transition:
              "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: 4,
            },
          }}
        >
          <CardMedia
            component="img"
            height="400"
            image={item.image || ""}
            alt={item.name}
            sx={{ objectFit: "cover", backgroundColor: "grey.100" }}
          />
          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ fontSize: "1.1rem", fontWeight: 600 }}
            >
              {item.name}
            </Typography>
            <Typography
              variant="h5"
              color="primary"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              ${item.price.toLocaleString()}
            </Typography>
            {item.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.description}
              </Typography>
            )}
          </CardContent>
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Box display="flex" gap={1}>
              <Tooltip title="View Details">
                <IconButton
                  component={Link}
                  to={`/items/${item.id}`}
                  color="primary"
                  size="small"
                  sx={{
                    flex: 1,
                    border: "1px solid",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                  }}
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </CardActions>
        </Card>
      </div>
    );
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" mb={2} gap={2}>
        <TextField
          sx={{ flex: 1 }}
          label="Search items..."
          variant="outlined"
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchInput ? (
                  <IconButton onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddItem(true)}
          sx={{ minWidth: "140px" }}
        >
          Add Item
        </Button>
      </Box>

      {openAddItem && (
        <Dialog open={openAddItem} onClose={handleCloseDialog}>
          <DialogTitle>Add Item</DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "400px",
            }}
          >
            <TextField
              label="Name"
              fullWidth
              value={newItem.name}
              onChange={(e) => handleInputChangeForm("name", e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newItem.category}
                onChange={(e) =>
                  handleInputChangeForm("category", e.target.value)
                }
              >
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Furniture">Furniture</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Price"
              fullWidth
              type="number"
              value={newItem.price}
              onChange={(e) => handleInputChangeForm("price", e.target.value)}
            />
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                startIcon={<AddImageIcon />}
                onClick={handleImageButtonClick}
              >
                Add Image
              </Button>
              {newItem.image && (
                <Typography variant="body2" color="success.main">
                  ✓ {newItem.image.name}
                </Typography>
              )}
            </Box>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleAddItem}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : "Add"}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && items.length > 0 && (
        <Box sx={{ height: "calc(100vh - 320px)", width: "100%" }}>
          <AutoSizer>
            {({ height, width }) => {
              const columns = isMobile ? 1 : 2;
              const gap = 24;
              const columnWidth = Math.floor(
                (width - gap * (columns - 1)) / columns
              );
              const rowHeight = 600;
              const rows = Math.ceil(items.length / columns);

              const VirtualCard = ({ columnIndex, rowIndex, style }) => {
                const itemIndex = rowIndex * columns + columnIndex;
                const item = items[itemIndex];
                if (!item) return null;

                return (
                  <div
                    style={{ 
                      ...style, 
                      paddingRight: columnIndex < columns - 1 ? gap : 0, 
                      paddingBottom: gap 
                    }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition:
                          "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="400"
                        image={item.image || ""}
                        alt={item.name}
                        sx={{ objectFit: "cover", backgroundColor: "grey.100" }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          gutterBottom
                          sx={{ fontSize: "1.1rem", fontWeight: 600 }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant="h5"
                          color="primary"
                          sx={{ fontWeight: 700, mb: 1 }}
                        >
                          ${item.price.toLocaleString()}
                        </Typography>
                        {item.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {item.description}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              component={Link}
                              to={`/items/${item.id}`}
                              color="primary"
                              size="small"
                              sx={{
                                flex: 1,
                                border: "1px solid",
                                borderColor: "primary.main",
                                "&:hover": {
                                  backgroundColor: "primary.main",
                                  color: "white",
                                },
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardActions>
                    </Card>
                  </div>
                );
              };

              return (
                <Grid
                  columnCount={columns}
                  columnWidth={columnWidth}
                  height={height}
                  rowCount={rows}
                  rowHeight={rowHeight}
                  width={width}
                >
                  {VirtualCard}
                </Grid>
              );
            }}
          </AutoSizer>
        </Box>
      )}

      {!isLoading && items.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery
              ? `No items found for "${searchQuery}"`
              : "No items available"}
          </Typography>
        </Paper>
      )}

      <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
        <TablePagination
          component="div"
          count={totalItems}
          page={currentPage - 1}
          onPageChange={(e, newPage) => setCurrentPage(newPage + 1)}
          rowsPerPage={itemsPerPage}
          onRowsPerPageChange={(e) => {
            setItemsPerPage(parseInt(e.target.value, 10));
            setCurrentPage(1);
          }}
          rowsPerPageOptions={[4, 6, 8, 10, 15, 20, 50]}
          labelRowsPerPage="Per page:"
          sx={{ minWidth: 350 }}
        />
      </Box>

      <Box textAlign="center" mt={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {items.length} of {totalItems} items
          {searchQuery && ` for "${searchQuery}"`}
        </Typography>
      </Box>
    </Box>
  );
}

export default Items;

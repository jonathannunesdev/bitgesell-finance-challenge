import React, { useEffect, useState, useRef } from "react";
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
  Input,
  TablePagination,
  InputAdornment,
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

function Items() {
  const { items, fetchItemsPage, addItem, isLoading, error, totalItems, totalPages, clearPagesCache } =
    useData();
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

  useEffect(() => {
    fetchItemsPage(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage, searchQuery]);


  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle form field changes
  const handleInputChangeForm = (field, value) => {
    setNewItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewItem((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  // Open file selector
  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };

  // Handle form submission
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare item data in the correct format
      const itemData = {
        name: newItem.name,
        category: newItem.category,
        price: parseFloat(newItem.price),
      };

      // Add item through API, passing image if it exists
      const newItemResult = await addItem(itemData, newItem.image);
      
      // Close dialog and reset form
      setOpenAddItem(false);
      setNewItem({
        name: "",
        category: "",
        price: "",
        image: null,
      });
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (error) {
      // Only show alert if there's really an error
      if (error.message && error.message !== "Failed to fetch") {
        alert("Error adding item: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  const handleCloseDialog = () => {
    setOpenAddItem(false);
    setNewItem({
      name: "",
      category: "",
      price: "",
      image: null,
    });
  };

  const handleLimitChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
    clearPagesCache();
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
          fullWidth
          label="Search items..."
          variant="outlined"
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchInput ? (
                  <IconButton onClick={handleClearSearch} aria-label="clear search">
                    <ClearIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={handleSearch} aria-label="search">
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
                label="Category"
                onChange={(e) => handleInputChangeForm("category", e.target.value)}
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
                sx={{ minWidth: "120px" }}
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
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? "Adding..." : "Add"}
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
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
              },
              gap: 3,
              width: "100%",
            }}
          >
            {items.map((item) => (
              <Card
                key={item.id}
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
                  sx={{
                    objectFit: "cover",
                    backgroundColor: "grey.100",
                  }}
                />

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.name}
                  </Typography>

                  <Typography
                    variant="h5"
                    color="primary"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                    }}
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
            ))}
          </Box>
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
        </>
      )}

      <Box textAlign="center" mt={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {items.length} of {totalItems} items
          {searchQuery && ` for "${searchQuery}"`}
        </Typography>
      </Box>
      {!isLoading && items.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery
              ? `No items found for "${searchQuery}"`
              : "No items available"}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default Items;
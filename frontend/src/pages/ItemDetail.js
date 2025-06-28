import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardMedia,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  AttachMoney,
  Category,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";
import config from "../utils/config";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchItem = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`${config.API_URL}/api/items/${id}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (isMounted) {
          setItem(data);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
          console.error("Error fetching item:", error);
          if (error.message.includes("404")) {
            navigate("/");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error: {error}
        <Button
          onClick={() => navigate("/")}
          sx={{ ml: 2 }}
          variant="outlined"
          size="small"
        >
          Back to Items
        </Button>
      </Alert>
    );
  }

  if (!item) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Item not found
        </Typography>
        <Button
          onClick={() => navigate("/")}
          variant="contained"
          startIcon={<ArrowBack />}
        >
          Back to Items
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Button
        onClick={() => navigate("/")}
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Back to Items
      </Button>

      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 4,
          },
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 3,
              }}
            >
              {item.name}
            </Typography>

            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <Typography
                variant="h2"
                color="secondary"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2.5rem", md: "3rem" },
                }}
              >
                $ {item.price.toLocaleString()}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Chip
                label={item.category}
                size="large"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "1rem", py: 1 }}
              />
            </Box>

            {item.description && (
              <Box mb={4}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontSize: "1.1rem",
                    lineHeight: 1.6,
                  }}
                >
                  {item.description}
                </Typography>
              </Box>
            )}

            {item.tags && item.tags.length > 0 && (
              <Box mb={4}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Tags
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {item.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="medium"
                      variant="outlined"
                      sx={{ fontSize: "0.9rem" }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CartIcon />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                fontWeight: 600,
                minWidth: "200px",
              }}
            >
              Add to Cart
            </Button>

            <Tooltip title="Add to Favorites">
              <IconButton
                color="primary"
                size="large"
                sx={{
                  border: "2px solid",
                  borderColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              >
                <FavoriteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardMedia
          component="img"
          sx={{
            width: { xs: "100%", md: "50%" },
            height: { xs: "400px", md: "600px" },
            objectFit: "cover",
            backgroundColor: "grey.100",
          }}
          image={item.image || ""}
          alt={item.name}
        />
      </Card>
    </Box>
  );
}

export default ItemDetail;

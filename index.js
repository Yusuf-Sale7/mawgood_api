const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { writeFile, readFile, readFileSync } = require("fs");
const usersPath = "./DB/users.json";
const categoriesPath = "./DB/categories.json";
const productsPath = "./DB/products.json";
const partnersPath = "./DB/partners.json";
const cartsPath = "./DB/carts.json";
const messagesPath = "./DB/messages.json";
const topCategoriesPath = "./DB/topCategories.json";
const offersPath = "./DB/offers.json";

app.use(cors());
app.use(express.json());

const SECRET_KEY = "122122122";
const expiresIn = "1h";

function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Signup
app.post("/api/signup", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const username = req.body.username.toLowerCase();
  const email = req.body.email.toLowerCase();
  const mobile = req.body.mobile;
  const city = req.body.city;
  const state = req.body.state;
  const street = req.body.street;
  const password = req.body.password;

  setTimeout(() => {
    readFile(usersPath, "utf8", (error, data) => {
      if (error) {
        res.json({
          error: true,
          message: "An error occured, please try again!",
        });
        return;
      }

      const users = JSON.parse(data);
      const userByEmail = users.find((user) => user.email === email);
      const userByUsername = users.find((user) => user.username === username);

      if (userByEmail) {
        res.json({
          error: true,
          errorType: "emailExists",
        });
      } else if (userByUsername) {
        res.json({
          error: true,
          errorType: "usernameExists",
        });
      } else {
        const newUser = {
          firstName,
          lastName,
          username,
          email,
          mobile,
          city,
          state,
          street,
          favorites: [],
          inCart: [],
          password,
        };
        users.push(newUser);

        writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
          if (err) {
            setTimeout(() => {
              res.json({
                error: true,
                message: "An error occured, please try again!",
              });
            }, 1000);
            return;
          }
        });

        // Add cart of new user
        readFile(cartsPath, "utf8", (error, cartsData) => {
          if (error) {
            res.json({
              error: true,
              message: "An error occured, please try again!",
            });
            return;
          }

          const carts = JSON.parse(cartsData);
          const newCart = {
            username,
            items: [],
            shipping: 10,
            totalPrice: 0,
          };

          carts.push(newCart);
          writeFile(cartsPath, JSON.stringify(carts, null, 2), (err) => {
            if (err) {
              setTimeout(() => {
                res.json({
                  error: true,
                  message: "An error occured, please try again!",
                });
              }, 1000);
              return;
            }

            delete newUser.password;
            const token = createToken(newUser);
            res.json({ user: newUser, token });
          });
        });
      }
    });
  }, 1000);
});

// Edit Profile
app.patch("/api/profile/edit", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const username = req.body.username.toLowerCase();
  const email = req.body.email.toLowerCase();
  const mobile = req.body.mobile;
  const city = req.body.city;
  const state = req.body.state;
  const street = req.body.street;

  readFile(usersPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error occured, please try again!",
      });
      return;
    }

    const users = JSON.parse(data);
    let user = users.find((user) => user.username === username);

    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.mobile = mobile;
      user.city = city;
      user.state = state;
      user.street = street;

      writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          res.json({
            error: true,
            message: "An error occured, please try again!",
          });
          return;
        }
        delete user.password;
        const token = createToken(user);
        res.json({ user, token });
      });
    } else {
      res.json({
        error: true,
        errorType: "usernameNotExists",
      });
    }
  });
});

// Edit Password
app.patch("/api/profile/edit-password", (req, res) => {
  const username = req.body.username.toLowerCase();
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  readFile(usersPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error occured, please try again!",
      });
      return;
    }

    const users = JSON.parse(data);
    let user = users.find((user) => user.username === username);

    if (user.password === currentPassword) {
      user.password = newPassword;

      writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          res.json({
            error: true,
            message: "An error occured, please try again!",
          });
          return;
        }
        delete user.password;
        const token = createToken(user);
        res.json({ token });
      });
    } else if (user.password !== currentPassword) {
      res.json({
        error: true,
        errorType: "currentPassWrong",
      });
    } else {
      res.json({
        error: true,
        errorType: "usernameNotExists",
      });
    }
  });
});

// Signin
app.post("/api/Signin", (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  readFile(usersPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error ocured, please try again!",
      });
      return;
    }

    const users = JSON.parse(data);
    const user = users.find(
      (user) => user.email === email || user.username === email
    );

    if (!email || !password) {
      setTimeout(() => {
        return res.json({
          error: true,
          errorType: "missingCredentials",
        });
      }, 1000);
    } else if (!user) {
      setTimeout(() => {
        return res.json({
          error: true,
          errorType: "userNotFound",
        });
      }, 1000);
    } else {
      if (password !== user.password) {
        setTimeout(() => {
          return res.json({
            error: true,
            errorType: "incorrectPassword",
          });
        }, 1000);
      } else {
        delete user.password;
        const token = createToken(user);
        setTimeout(() => {
          res.json({ user, token });
        }, 1000);
      }
    }
  });
});

// Get user info from Access Token
app.post("/api/token", (req, res) => {
  const { token } = req.body;

  try {
    const decoded_token = jwt.verify(token, SECRET_KEY);
    readFile(usersPath, "utf8", (error, data) => {
      if (error) {
        res.json({
          error: true,
          message: "An error ocured, please try again!",
        });
        return;
      }

      const users = JSON.parse(data);
      const user = users.find((user) => user.email === decoded_token.email);
      delete user.password;
      res.json(user);
    });
  } catch (err) {
    res.json({
      error: true,
      errorType: "invalidToken",
    });
  }
});

// Get categories
app.get("/api/categories", (req, res) => {
  readFile(categoriesPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error ocured, please try again!",
      });
      return;
    }

    const categories = JSON.parse(data);

    readFile(productsPath, "utf8", (error, data) => {
      if (error) {
        res.json({
          error: true,
          message: "An error ocured, please try again!",
        });
        return;
      }

      const products = JSON.parse(data);

      const result = categories.map((category) => {
        category.quantity = products.filter(
          (product) => product.category === category.category
        ).length;
        return category;
      });

      setTimeout(() => {
        res.json(result);
      }, 1000);
    });
  });
});

// Get top categories
app.get("/api/top_categories", (req, res) => {
  readFile(topCategoriesPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error ocured, please try again!",
      });
      return;
    }

    const categories = JSON.parse(data);

    setTimeout(() => {
      res.json(categories);
    }, 1000);
  });
});

// Get offers
app.get("/api/offers", (req, res) => {
  readFile(offersPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error ocured, please try again!",
      });
      return;
    }

    const offers = JSON.parse(data);

    setTimeout(() => {
      res.json(offers);
    }, 700);
  });
});

// Get products
app.get("/api/products", (req, res) => {
  readFile(productsPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error occured while getting products, please try again!",
      });
      return;
    }

    const products = JSON.parse(data);
    res.json(products);
  });
});

// Get category's products
app.get("/api/category/:category", (req, res) => {
  const category = req.params.category?.toLowerCase();

  readFile(productsPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error occured while getting products, please try again!",
      });
      return;
    }

    const products = JSON.parse(data);

    const category_products = products.find(
      (product) => product.category === category
    );

    if (category_products) {
      res.json(category_products);
    } else {
      res.json({
        error: true,
        errorType: "invalidCategory",
      });
    }
  });
});

// Search products
app.get("/api/search/:query", (req, res) => {
  const query = req.params.query?.toLowerCase();

  readFile(productsPath, "utf8", (error, data) => {
    if (error) {
      res
        .status(400)
        .json("An error occured while getting products, please try again!");
      return;
    }

    const products = JSON.parse(data);
    const result = products.filter((product) =>
      product.title.toLowerCase().includes(query)
    );

    res.json(result.length > 0 ? result : `No results found for '${query}'!`);
  });
});

// Search / Filter / Sort products
app.get("/api/search/", (req, res) => {
  const query = req.query.query?.toLowerCase();
  const category = req.query.category?.toLowerCase() || "all";
  const minPrice = req.query.minprice?.toLowerCase();
  const maxPrice = req.query.maxprice?.toLowerCase();
  const rate = req.query.rate?.toLowerCase() || "all";
  const limit = req.query.limit?.toLowerCase() || "10";
  const sort = req.query.sort?.toLowerCase() || "random";

  const categories = JSON.parse(
    readFileSync(categoriesPath, (error, data) => {
      if (error) {
        const msg = "An error occured, please try again!";
        return msg;
      }

      const categories = JSON.parse(data);

      return categories;
    })
  );

  readFile(productsPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error occured while getting products, please try again!",
      });
      return;
    }

    const products = JSON.parse(data);
    let result = products;
    let limitedList = [];

    result = query
      ? result.filter(
          (product) =>
            product.title.toLowerCase().includes(query) ||
            product.titleAR.toLowerCase().includes(query)
        )
      : result;

    result =
      category && category !== "all"
        ? result.filter((product) => product.category === category)
        : result;

    result =
      minPrice && minPrice !== "all"
        ? result.filter((product) => product.price >= minPrice)
        : result;

    result =
      maxPrice && maxPrice !== "all"
        ? result.filter((product) => product.price <= maxPrice)
        : result;

    result =
      rate && rate !== "all"
        ? result.filter((product) => Math.round(product.rating.rate) == rate)
        : result;

    result =
      sort && sort === "high"
        ? result.sort((a, b) => b.price - a.price)
        : sort && sort === "low"
        ? result.sort((a, b) => a.price - b.price)
        : result;

    limitedList = limit ? result.slice(0, limit) : result;

    // Check if the entered category is valid
    const validCategory = categories.find((item) => item.category === category)
      ? true
      : false;

    const response = {
      error: !validCategory,
      query,
      category,
      limit,
      sort,
      minPrice,
      maxPrice,
      rate,
      productsCount: result.length,
      products: limitedList,
    };
    setTimeout(() => {
      res.json(response);
    }, 1000);
  });
});

// Review product
app.patch("/api/products", (req, res) => {
  const { id, rate, comment, date, name } = req.body;
  const username = req.body.username?.toLowerCase();

  setTimeout(() => {
    readFile(productsPath, "utf8", (error, data) => {
      if (error) {
        res.json({
          error: true,
          message: "Failed to send review, please try again!",
        });
        return;
      }

      const products = JSON.parse(data);
      const product = products.find((product) => product.id === id);
      const prevRate = product.rating.rate;
      const prevCount = product.rating.count;
      const prevComments = product.rating.comments;
      const user_review = {
        id,
        name,
        username,
        date,
        rate,
        comment,
      };
      const newRate = {
        rate: (prevRate * prevCount + user_review.rate) / (prevCount + 1),
        count: prevCount + 1,
        comments: [...prevComments, user_review],
      };

      // updating rate
      product.rating = newRate;

      writeFile(productsPath, JSON.stringify(products, null, 2), (err) => {
        if (error) {
          res.json({
            error: true,
            message:
              "An error occured while send your review, please try again!",
          });
          return;
        }
        const response = {
          error: false,
          product,
        };
        res.json(response);
      });
    });
  }, 1000);
});

// Product details
app.get("/api/product/:id", (req, res) => {
  const { id } = req.params;

  readFile(productsPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error ocured, please try again!",
      });
      return;
    }

    const products = JSON.parse(data);
    const product = products.find((product) => product.id == id);

    if (product != undefined) {
      const response = {
        error: false,
        product,
      };
      setTimeout(() => {
        res.json(response);
      }, 1000);
    } else {
      const response = {
        error: true,
        errorType: "invalidID",
        product,
      };
      setTimeout(() => {
        res.json(response);
      }, 1000);
    }
  });
});

// Similar products
app.post("/api/product/similar", (req, res) => {
  const { id } = req.body;

  readFile(productsPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error ocured, please try again!",
      });
      return;
    }

    const products = JSON.parse(data);
    const category = products.find((product) => product.id == id)?.category;
    const similar = products.filter(
      (product) => product.category == category && product.id != id
    );

    const response = {
      error: false,
      products: similar,
    };
    setTimeout(() => {
      res.json(response);
    }, 1000);
  });
});

// Get partners
app.get("/api/partners", (req, res) => {
  readFile(partnersPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error ocured, please try again!",
      });
    }

    const partners = JSON.parse(data);
    setTimeout(() => {
      res.json(partners);
    }, 1000);
  });
});

// Get user's cart
app.get("/api/cart/:username", (req, res) => {
  const username = req.params.username?.toLowerCase();

  const carts = JSON.parse(
    readFileSync(cartsPath, (error, data) => {
      if (error) {
        const msg = "An error occured, please try again!";
        return msg;
      }

      const carts = JSON.parse(data);

      return carts;
    })
  );

  const users = JSON.parse(
    readFileSync(usersPath, (error, data) => {
      if (error) {
        const msg = "An error occured, please try again!";
        return msg;
      }

      const users = JSON.parse(data);

      return users;
    })
  );

  const cart = carts.find((cart) => cart.username === username);

  const products = JSON.parse(
    readFileSync(productsPath, (error, data) => {
      if (error) {
        const msg = "An error occured, please try again!";
        return msg;
      }

      const products = JSON.parse(data);

      return products;
    })
  );

  const cartProducts = cart.items.map((item) => {
    const product = products.find((product) => product.id === item.id);
    const { quantity } = item;
    const { price } = item;
    const { size } = item;
    const cartItemColor = item.color;
    const color = product.colors?.find((color) => color.id === cartItemColor);
    return { product, quantity, price, size, color };
  });

  const { shipping } = cart;
  const totalPrice = cart.totalPrice + shipping;
  const user = users.find((user) => user.username === username);
  delete user.password;

  setTimeout(() => {
    res.json({ user, shipping, totalPrice, cartProducts });
  }, 1000);
});

// Edit user's cart >> Add / Delete / Update
app.patch("/api/cart/:username", (req, res) => {
  const username = req.body.username?.toLowerCase();
  const { id, quantity } = req.body;
  const size = req.body.size?.toUpperCase();
  const color = req.body.color;
  const message = "An error occured, please try again!";

  const products = JSON.parse(
    readFileSync(productsPath, (error, data) => {
      if (error) {
        res.json({ error: true, message });
        return;
      }

      const products = JSON.parse(data);

      return products;
    })
  );

  readFile(cartsPath, "utf8", (error, data) => {
    if (error) {
      res.json({ error: true, message });
      return;
    }

    const carts = JSON.parse(data);
    const userCart = carts.find((cart) => cart.username === username);
    const product = products.find((product) => product.id === id);
    const productPrice = product.price;
    let cartProduct = userCart.items.find((item) => item.id === id);

    if (cartProduct === undefined) {
      cartProduct = {
        id,
        quantity,
        price: productPrice,
        size,
        color,
      };

      userCart.items.push(cartProduct);
    }

    if (size && color) {
      cartProduct = userCart.items.find(
        (item) =>
          item.id === id &&
          item.color === color &&
          item.size?.toLowerCase() === size?.toLowerCase()
      );
      if (quantity === 0) {
        if (size?.toLowerCase() == "all" && color?.toLowerCase() == "all") {
          userCart.items = userCart.items.filter((item) => item.id !== id);
        } else {
          userCart.items = userCart.items.filter(
            (item) => item !== cartProduct
          );
        }
      } else {
        if (cartProduct?.size == size && cartProduct?.color == color) {
          cartProduct.quantity = quantity;
          cartProduct.price = productPrice;
        } else {
          cartProduct = {
            id,
            quantity,
            price: productPrice,
            size,
            color,
          };

          userCart.items.push(cartProduct);
        }
      }
    }

    if (size && !color) {
      cartProduct = userCart.items.find(
        (item) =>
          item.id === id &&
          item.size?.toLowerCase() === size?.toLowerCase() &&
          item.color == undefined
      );
      if (quantity === 0) {
        userCart.items = userCart.items.filter((item) => item !== cartProduct);
      } else {
        if (cartProduct?.size == size) {
          cartProduct.quantity = quantity;
          cartProduct.price = productPrice;
        } else {
          cartProduct = {
            id,
            quantity,
            price: productPrice,
            size,
            color,
          };

          userCart.items.push(cartProduct);
        }
      }
    }

    if (!size && color) {
      cartProduct = userCart.items.find(
        (item) =>
          item.id === id && item.color === color && item.size === undefined
      );
      if (quantity === 0) {
        userCart.items = userCart.items.filter((item) => item !== cartProduct);
      } else {
        if (cartProduct?.color == color) {
          cartProduct.quantity = quantity;
          cartProduct.price = productPrice;
        } else {
          cartProduct = {
            id,
            quantity,
            price: productPrice,
            size,
            color,
          };

          userCart.items.push(cartProduct);
        }
      }
    }

    if (!size && !color) {
      console.log("!size && !color");
      cartProduct = userCart.items.find(
        (item) =>
          item.id === id && item.color === undefined && item.size === undefined
      );
      if (quantity === 0) {
        userCart.items = userCart.items.filter((item) => item !== cartProduct);
      } else {
        cartProduct.quantity = quantity;
        cartProduct.price = productPrice;
      }
    }

    let finalPrice = 0;
    for (var i = 0; i < userCart.items.length; i++) {
      finalPrice += userCart.items[i].price * userCart.items[i].quantity;

      userCart.totalPrice = finalPrice;
    }

    const cartProducts = userCart.items.map((item) => {
      const product = products.find((product) => product.id === item.id);
      const { quantity } = item;
      const { price } = product;
      const { size } = item;
      const cartItemColor = item.color;
      const color = product.colors?.find((color) => color.id === cartItemColor);
      return { product, quantity, price, size, color };
    });

    const { shipping } = userCart;
    const totalPrice = userCart.totalPrice + shipping;

    writeFile(cartsPath, JSON.stringify(carts, null, 2), (err) => {
      if (err) {
        res.json({ error: true, message });
        return;
      }
    });

    readFile(usersPath, "utf8", (error, data) => {
      if (error) {
        res.json({ error: true, message });
        return;
      }

      const users = JSON.parse(data);
      const user = users.find((user) => user.username === username);
      const userCart = carts.find((cart) => cart.username === username);
      const productsCount = userCart.items.map((item) => item.id);

      user.inCart = productsCount;

      writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          res.json({ error: true, message });
          return;
        }

        delete user.password;
        res.json({ user, shipping, totalPrice, cartProducts });
      });
    });
  });
});

// Get user's favorites
app.get("/api/favorites/:username", (req, res) => {
  const username = req.params.username?.toLowerCase();

  const users = JSON.parse(
    readFileSync(usersPath, (error, data) => {
      if (error) {
        const msg = "An error occured, please try again!";
        return msg;
      }

      const users = JSON.parse(data);

      return users;
    })
  );

  const favIDs = users.find((user) => user.username === username).favorites;

  const products = JSON.parse(
    readFileSync(productsPath, (error, data) => {
      if (error) {
        const msg = "An error occured, please try again!";
        return msg;
      }

      const products = JSON.parse(data);

      return products;
    })
  );

  const favorites = favIDs.map((id) =>
    products.find((product) => product.id === id)
  );

  const user = users.find((user) => user.username === username);

  setTimeout(() => {
    res.json({ user, favorites });
  }, 1000);
});

// Add product to favorites
app.post("/api/favorites/add", (req, res) => {
  const username = req.body.username?.toLowerCase();
  const { id } = req.body;

  const products = JSON.parse(
    readFileSync(productsPath, (error, data) => {
      if (error) {
        const msg = "An error occured, please try again!";
        return msg;
      }

      const products = JSON.parse(data);

      return products;
    })
  );

  readFile(usersPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error occured, please try again!",
      });
      return;
    }

    const users = JSON.parse(data);
    let user = users.find((user) => user.username === username);

    if (user) {
      const isExist = user.favorites.find((item) => item === id);
      if (isExist) {
        res.json({
          error: true,
          message: "Product already exists!",
        });
      } else {
        user.favorites.push(id);
        const favList = user.favorites.map((id) => id);
        const favorites = favList.map((id) =>
          products.find((product) => product.id === id)
        );
        writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
          if (err) {
            res.json({
              error: true,
              message: "An error occured, please try again!",
            });
            return;
          }
          delete user.password;
          const message = "Product added to favorites!";
          res.json({ user, favorites, message });
        });
      }
    } else {
      res.json({
        error: true,
        message: "Username not exists!",
      });
    }
  });
});

// Remove product from favorites
app.post("/api/favorites/delete", (req, res) => {
  const username = req.body.username?.toLowerCase();
  const { id } = req.body;

  const products = JSON.parse(
    readFileSync(productsPath, (error, data) => {
      if (error) {
        const msg = "An error occured, please try again!";
        return msg;
      }

      const products = JSON.parse(data);

      return products;
    })
  );

  readFile(usersPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error occured, please try again!",
      });
      return;
    }

    const users = JSON.parse(data);
    let user = users.find((user) => user.username === username);

    if (user) {
      const newFavList = user.favorites.filter((targetId) => targetId !== id);
      user.favorites = newFavList;

      const favorites = newFavList.map((id) =>
        products.find((product) => product.id === id)
      );

      writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          res.json({
            error: true,
            message: "An error occured, please try again!",
          });
          return;
        }
        delete user.password;
        const message = "Product removed from favorites!";
        res.json({ user, favorites, message });
      });
    } else {
      res.json({
        error: true,
        message: "Username not exists!",
      });
    }
  });
});

// User message / Contact us page
app.post("/api/contact", (req, res) => {
  const message = req.body;

  readFile(messagesPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error occured, please try again!",
      });
      return;
    }

    const messages = JSON.parse(data);
    messages.push(message);
    setTimeout(() => {
      writeFile(messagesPath, JSON.stringify(messages, null, 2), (err) => {
        if (err) {
          res.json({
            error: true,
            message: "An error occured, please try again!",
          });
          return;
        }
        res.json({
          messageEN: "We Got Your Message, Thanks For Choosing MAWGOOD !",
          messageAR: "لقت تلقينا رسالتك، شكراً لإختيارك  موجود!",
        });
      });
    }, 1000);
  });
});

// Run Port
app.listen("7000", () => {
  console.log("Server Running On Port 7000");
});

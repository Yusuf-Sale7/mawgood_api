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
        password,
      };
      users.push(newUser);

      writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          res.json({
            error: true,
            message: "An error occured, please try again!",
          });
          return;
        }
        delete newUser.password;
        const token = createToken(newUser);
        res.json({ user: newUser, token });
      });
    }
  });
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
    const user = users.find((user) => user.email === email);

    if (!email || !password) {
      return res.json({
        error: true,
        errorType: "missingCredentials",
      });
    } else if (!user) {
      return res.json({
        error: true,
        errorType: "userNotFound",
      });
    } else {
      if (password !== user.password) {
        return res.json({
          error: true,
          errorType: "incorrectPassword",
        });
      } else {
        delete user.password;
        const token = createToken(user);
        res.json({ user, token });
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
    res.json(categories);
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
    const category_products = products.filter(
      (product) => product.category === category
    );

    if (category_products.length > 0) {
      res.json(category_products);
    } else {
      const msg = `Can not find category named '${category}'`;
      res.json(msg);
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
  const minPrice = req.query.minPrice?.toLowerCase();
  const maxPrice = req.query.maxPrice?.toLowerCase();
  const rate = req.query.rate?.toLowerCase() || "all";
  const limit = req.query.limit?.toLowerCase() || "10";
  const sort = req.query.sort?.toLowerCase();

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
      ? result.filter((product) => product.title.toLowerCase().includes(query))
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
        ? result.filter((product) => product.rating.rate >= rate)
        : result;

    result =
      sort && sort === "high"
        ? result.sort((a, b) => b.price - a.price)
        : sort && sort === "low"
        ? result.sort((a, b) => a.price - b.price)
        : result;

    limitedList = limit ? result.slice(0, limit) : result;

    const response = {
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
    res.json(response);
  });
});

// Review product
app.patch("/api/products", (req, res) => {
  const { product_id } = req.body;
  const { user_review } = req.body;

  readFile(productsPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "Failed to send review, please try again!",
      });
      return;
    }

    const products = JSON.parse(data);
    const product = products.find((product) => product.id === product_id);
    const prevRate = product.rating.rate;
    const prevCount = product.rating.count;
    const prevComments = product.rating.comments;
    const newRate = {
      rate: (prevRate * prevCount + user_review.rate) / (prevCount + 1),
      count: prevCount + 1,
      comments: [...prevComments, user_review],
    };

    // updating rate
    product.rating = newRate;

    writeFile(productsPath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        res.status(400).json("Failed to send review, please try again!");
        return;
      }
      res.json("Your review sent successfully.");
    });
  });
});

// Product details
app.get("/api/products/:id", (req, res) => {
  const product_id = req.params.id;

  readFile(productsPath, "utf8", (error, data) => {
    if (error) {
      res.json({
        error: true,
        message: "An error ocured, please try again!",
      });
      return;
    }

    const products = JSON.parse(data);
    const product = products.find((product) => product.id == product_id);

    product
      ? res.json(product)
      : res.status(404).json(`No product found with id '${product_id}'!`);
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
      return msg;
    }

    const partners = JSON.parse(data);
    res.json(partners);
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
    return { product, quantity, price };
  });

  const { shipping } = cart;
  const { totalPrice } = cart;
  const user = users.find((user) => user.username === username);
  delete user.password;

  res.json({ user, shipping, totalPrice, cartProducts });
});

// Edit user's cart
app.patch("/api/cart/:username", (req, res) => {
  const username = req.body.username?.toLowerCase();
  const { id, quantity } = req.body;
  const message = "An error occured, please try again!";

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
      };

      userCart.items.push({
        id,
        quantity,
        price: productPrice,
      });
    }

    cartProduct.quantity = quantity;
    cartProduct.price = productPrice;

    if (quantity === 0) {
      userCart.items = userCart.items.filter((item) => item.id !== id);
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
      return { product, quantity, price };
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

// Add product to cart
app.post("/api/cart/:username", (req, res) => {
  const username = req.params.username?.toLowerCase();
  const { id, quantity, price } = req.body;

  readFile(cartsPath, "utf8", (error, data) => {
    if (error) {
      const msg = "An error occured, please try again!";
      return msg;
    }

    const carts = JSON.parse(data);
    const userCart = carts.find((cart) => cart.username === username);

    userCart.items.push({
      id,
      quantity,
      price,
    });

    let totalPrice = 0;
    for (var i = 0; i < userCart.items.length; i++) {
      totalPrice += userCart.items[i].price * userCart.items[i].quantity;

      userCart.totalPrice = totalPrice;
    }

    writeFile(cartsPath, JSON.stringify(carts, null, 2), (err) => {
      if (err) {
        res.status(400).json("Failed to update cart, please try again!");
        return;
      }
      res.json("Cart updated successfully.");
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

  res.json({ user, favorites });
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

// Remove product to favorites
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

// Run Port
app.listen("7000", () => {
  console.log("Server Running On Port 7000");
});

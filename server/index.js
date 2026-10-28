const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello dari server!");
});

app.get("/api/products", (req, res) => {
  const produk = [
    {
      id: 1,
      nama: "Cushion Vuebee Matte",
      harga: 95000,
    },
    {
      id: 2,
      nama: "Lip Tint Vuebee",
      harga: 65000,
    },
  ];
  res.json(produk);
});

app.listen(port, () => {
  console.log(`server berhasil berjalan! di http://localhost:${port}`);
});

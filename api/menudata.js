const menuData = {
  pizzas: [
    {
      nombre: "Muzzarella",
      tamaños: {
        chica: 7500,
        grande: 9500,
        gigante: 12000
      }
    },
    {
      nombre: "Napolitana",
      tamaños: {
        chica: 7900,
        grande: 9900,
        gigante: 12500
      }
    },
    {
      nombre: "Fugazzeta",
      tamaños: {
        chica: 8000,
        grande: 10000,
        gigante: 12800
      }
    }
    // Podés seguir agregando más pizzas con el mismo formato
  ],
  milanesas: [
    {
      nombre: "Napolitana",
      opciones: ["carne", "pollo"],
      precios: {
        chica: 8000,
        mediana: 9500,
        grande: 11500
      }
    },
    {
      nombre: "Fugazzeta",
      opciones: ["carne", "pollo"],
      precios: {
        chica: 8200,
        mediana: 9700,
        grande: 11800
      }
    }
    // Agregá más si querés, después te enseño cómo
  ]
};

export default menuData;

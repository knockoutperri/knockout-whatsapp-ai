// menuData.js

const menuData = {
  productos: [
    // Pizzas comunes
    {
      nombre: "Muzzarella",
      categoria: "Pizza",
      tamanos: { chica: 8600, grande: 12000, gigante: 25800, paraCocinar: 9700 },
      descripcion: "Pizza clásica con muzzarella."
    },
    {
      nombre: "Doble Muzza",
      categoria: "Pizza",
      tamanos: { chica: 11500, grande: 16000, gigante: 33200, paraCocinar: 13000 },
      descripcion: "Pizza con doble cantidad de muzzarella."
    },
    {
      nombre: "Muzza y Tomate Natural",
      categoria: "Pizza",
      tamanos: { chica: 8900, grande: 12500, gigante: 28800, paraCocinar: 10800 },
      descripcion: "Muzzarella y tomate natural, sin ajo ni perejil."
    },
    {
      nombre: "Napolitana",
      categoria: "Pizza",
      tamanos: { chica: 9900, grande: 13500, gigante: 30000, paraCocinar: 11000 },
      descripcion: "Muzzarella, tomate, ajo y perejil."
    },
    {
      nombre: "Pizza de Olio",
      categoria: "Pizza",
      tamanos: { chica: 8600, grande: 12000, gigante: 25800, paraCocinar: 9700 },
      descripcion: "Pizza sin muzzarella. Lleva salsa, tomate en rodajas, ajo y perejil."
    },
    {
      nombre: "Fugaza",
      categoria: "Pizza",
      tamanos: { chica: 8600, grande: 12000, gigante: 25800, paraCocinar: 9700 },
      descripcion: "Solo cebolla. Sin salsa ni muzzarella."
    },
    {
      nombre: "Fugazzeta",
      categoria: "Pizza",
      tamanos: { chica: 9900, grande: 13500, gigante: 30000, paraCocinar: 11000 },
      descripcion: "Cebolla y muzzarella."
    },

    // Pizzas especiales
    {
      nombre: "Super Ananá",
      categoria: "Pizza Especial",
      tamanos: { chica: 13800, grande: 19500, gigante: 44000, paraCocinar: 17000 },
      descripcion: "Jamón, ananá, salsa de caramelo y cereza."
    },
    {
      nombre: "Super Calabresa",
      categoria: "Pizza Especial",
      tamanos: { chica: 13800, grande: 19500, gigante: 44000, paraCocinar: 17000 },
      descripcion: "Longaniza y ají en vinagre."
    },
    {
      nombre: "Super Napolitana",
      categoria: "Pizza Especial",
      tamanos: { chica: 14500, grande: 20000, gigante: 46000, paraCocinar: 18000 },
      descripcion: "Roquefort, tomate, morrón, ajo y perejil."
    },
    {
      nombre: "Jamón Crudo y Rúcula",
      categoria: "Pizza Especial",
      tamanos: { chica: 16500, grande: 23800, gigante: 53200, paraCocinar: 21900 },
      descripcion: "Jamón crudo, rúcula y parmesano."
    },
    {
      nombre: "Jamón Crudo, Rúcula, Nuez y Roquefort",
      categoria: "Pizza Especial",
      tamanos: { chica: 19500, grande: 28000, gigante: 57000, paraCocinar: 24500 },
      descripcion: "Jamón crudo, rúcula, nuez, roquefort y parmesano."
    },

    // Tortillas
    {
      nombre: "Tortilla Española",
      categoria: "Tortilla",
      precio: 14000,
      descripcion: "Tortilla de papa, cebolla y longaniza."
    },

    // Fainá
    {
      nombre: "Fainá",
      categoria: "Fainá",
      precio: 1400,
      descripcion: "Fainá por porción."
    },
    {
      nombre: "Fainá con Muzzarella",
      categoria: "Fainá",
      precio: 2000,
      descripcion: "Fainá con muzzarella por porción."
    },

    // Empanadas (Ejemplo)
    {
      nombre: "Empanada de Carne",
      categoria: "Empanada",
      precioUnidad: 1800,
      precioDocena: 20000,
      descripcion: "Empanada de carne clásica."
    },

    // Podés seguir completando el resto acá...
  ]
};

export default menuData;

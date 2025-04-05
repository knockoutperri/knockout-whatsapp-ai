const pizzasComunes = [
  {
    name: "Muzzarella",
    chica: 8600,
    grande: 12000,
    gigante: 25800,
    paraCocinar: 9700,
  },
  {
    name: "Doble Muzza",
    chica: 11500,
    grande: 16000,
    gigante: 33200,
    paraCocinar: 13000,
  },
  {
    name: "Muzzarella y Tomate Natural",
    chica: 8900,
    grande: 12500,
    gigante: 28800,
    paraCocinar: 10800,
  },
  {
    name: "Muzzarella y Morrón",
    chica: 8900,
    grande: 12500,
    gigante: 28800,
    paraCocinar: 10800,
  },
  {
    name: "Muzzarella y Huevo",
    chica: 8900,
    grande: 12500,
    gigante: 28800,
    paraCocinar: 10800,
  },
  {
    name: "Muzzarella y Anchoas",
    chica: 10800,
    grande: 16000,
    gigante: 34500,
    paraCocinar: 12500,
  },
  {
    name: "Salsa y Anchoas",
    chica: 8600,
    grande: 12000,
    gigante: 25800,
    paraCocinar: 9700,
  },
  {
    name: "Ollio",
    chica: 8600,
    grande: 12000,
    gigante: 25800,
    paraCocinar: 9700,
  },
  {
    name: "Jamón",
    chica: 9900,
    grande: 13500,
    gigante: 30000,
    paraCocinar: 11000,
  },
  {
    name: "Jamón y Morrón",
    chica: 11000,
    grande: 16000,
    gigante: 34500,
    paraCocinar: 12500,
  },
  {
    name: "Jamón y Huevo",
    chica: 11000,
    grande: 16000,
    gigante: 34500,
    paraCocinar: 12500,
  },
  {
    name: "Primavera",
    chica: 11200,
    grande: 17000,
    gigante: 36000,
    paraCocinar: 13500,
  },
  {
    name: "Napolitana",
    chica: 9900,
    grande: 13500,
    gigante: 30000,
    paraCocinar: 11000,
  },
  {
    name: "Napolitana con Jamón",
    chica: 11200,
    grande: 16000,
    gigante: 34500,
    paraCocinar: 12500,
  },
  {
    name: "Napolitana con Anchoas",
    chica: 12500,
    grande: 17500,
    gigante: 36000,
    paraCocinar: 13500,
  },
  {
    name: "Provolone",
    chica: 11200,
    grande: 16000,
    gigante: 34500,
    paraCocinar: 12500,
  },
  {
    name: "Provolone con Jamón",
    chica: 12500,
    grande: 17500,
    gigante: 36000,
    paraCocinar: 13500,
  },
  {
    name: "Roquefort",
    chica: 11200,
    grande: 16000,
    gigante: 34500,
    paraCocinar: 12500,
  },
  {
    name: "Roquefort con Jamón",
    chica: 12500,
    grande: 17500,
    gigante: 36000,
    paraCocinar: 13500,
  },
  {
    name: "Calabresa",
    chica: 11200,
    grande: 16000,
    gigante: 34500,
    paraCocinar: 12500,
  },
  {
    name: "Calabresa con Provolone",
    chica: 12500,
    grande: 17500,
    gigante: 36000,
    paraCocinar: 13500,
  },
  {
    name: "Palmitos",
    chica: 11200,
    grande: 16000,
    gigante: 34500,
    paraCocinar: 12500,
  },
  {
    name: "Palmitos con Jamón",
    chica: 12500,
    grande: 17500,
    gigante: 36000,
    paraCocinar: 13500,
  },
  {
    name: "Palmitos con Jamón y Morrón",
    chica: 13200,
    grande: 18500,
    gigante: 37500,
    paraCocinar: 14500,
  },
  {
    name: "Palmitos con Jamón y Huevo",
    chica: 13200,
    grande: 18500,
    gigante: 37500,
    paraCocinar: 14500,
  },
  {
    name: "Palmitos con Jamón, Morrón y Huevo",
    chica: 13800,
    grande: 19500,
    gigante: 39000,
    paraCocinar: 15500,
  },
  {
    name: "Fugazza",
    chica: 8600,
    grande: 12000,
    gigante: 25800,
    paraCocinar: 9700,
  },
  {
    name: "Fugazzeta",
    chica: 9900,
    grande: 13500,
    gigante: 30000,
    paraCocinar: 11000,
  },
  {
    name: "Fugazzeta con Jamón",
    chica: 11000,
    grande: 16000,
    gigante: 34500,
    paraCocinar: 12500,
  },
  {
    name: "Ananá con Jamón",
    chica: 11200,
    grande: 16000,
    gigante: 34500,
    paraCocinar: 12500,
  },
];

const pizzasEspeciales = [
  {
    name: "Super Ananá",
    chica: 13800,
    grande: 19500,
    gigante: 44000,
    paraCocinar: 17000,
  },
  {
    name: "Super Calabresa",
    chica: 13800,
    grande: 19500,
    gigante: 44000,
    paraCocinar: 17000,
  },
  {
    name: "Super Napolitana",
    chica: 14500,
    grande: 20000,
    gigante: 46000,
    paraCocinar: 18000,
  },
  {
    name: "Jamón Crudo y Rúcula",
    chica: 16500,
    grande: 23800,
    gigante: 53200,
    paraCocinar: 21900,
  },
  {
    name: "Jamón Crudo, Rúcula, Nuez y Roquefort",
    chica: 19500,
    grande: 28000,
    gigante: 57000,
    paraCocinar: 24500,
  },
  {
    name: "Verdura",
    chica: 14500,
    grande: 20000,
    gigante: 46000,
    paraCocinar: 18000,
  },
  {
    name: "Vegetariana",
    chica: 15500,
    grande: 21500,
    gigante: 48000,
    paraCocinar: 19500,
  },
  {
    name: "3 Quesos",
    chica: 14500,
    grande: 20000,
    gigante: 46000,
    paraCocinar: 18000,
  },
  {
    name: "4 Quesos",
    chica: 15500,
    grande: 21500,
    gigante: 48000,
    paraCocinar: 19500,
  },
  {
    name: "Pollo",
    chica: 14500,
    grande: 20000,
    gigante: 46000,
    paraCocinar: 18000,
  },
  {
    name: "Ají y Morrón",
    chica: 14500,
    grande: 20000,
    gigante: 46000,
    paraCocinar: 18000,
  },
  {
    name: "Panceta",
    chica: 14500,
    grande: 20000,
    gigante: 46000,
    paraCocinar: 18000,
  },
  {
    name: "Panceta y Morrón",
    chica: 15500,
    grande: 21500,
    gigante: 48000,
    paraCocinar: 19500,
  },
  {
    name: "Panceta y Albahaca",
    chica: 15500,
    grande: 21500,
    gigante: 48000,
    paraCocinar: 19500,
  },
  {
    name: "Choclo",
    chica: 14500,
    grande: 20000,
    gigante: 46000,
    paraCocinar: 18000,
  },
  {
    name: "Capresse",
    chica: 14500,
    grande: 20000,
    gigante: 46000,
    paraCocinar: 18000,
  },
  {
    name: "Cochina",
    chica: 15500,
    grande: 21500,
    gigante: 48000,
    paraCocinar: 19500,
  },
  {
    name: "Salchicha",
    chica: 14500,
    grande: 20000,
    gigante: 46000,
    paraCocinar: 18000,
  },
  {
    name: "Zuquini",
    chica: 15500,
    grande: 21500,
    gigante: 48000,
    paraCocinar: 19500,
  },
  {
    name: "Knock Out",
    chica: 15500,
    grande: 21500,
    gigante: 48000,
    paraCocinar: 19500,
  },
  {
    name: "Super Knock Out",
    chica: 16500,
    grande: 23500,
    gigante: 50000,
    paraCocinar: 21500,
  },
  {
    name: "La Gran Knock Out",
    chica: 17500,
    grande: 25000,
    gigante: 52000,
    paraCocinar: 23000,
  },
];

export default {
  pizzasComunes,
  pizzasEspeciales,
};

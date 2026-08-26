const COLORS = [
  { name: "Dorado", value: "#EFB810" },
  { name: "Negro", value: "##0C0A09" },
  { name: "Gris", value: "#6b7280" },
  { name: "Rojo", value: "#FF0000" },
  { name: "Rojo oscuro", value: "#800000" },
  { name: "Amarillo", value: "#FFFF00" },
  { name: "Verde oliva", value: "#808000" },
  { name: "Verde lima", value: "#00FF00" },
  { name: "Verde", value: "#008000" },
  { name: "Aguamarina", value: "#00FFFF" },
  { name: "Turquesa", value: "#008080" },
  { name: "Azul", value: "#0000FF" },
  { name: "Azul navy", value: "#000080" },
  { name: "Fucsía", value: "#FF00FF" },
  { name: "Morado", value: "#800080" },
];

export const COLOR_BY_VALUE = new Map(
  COLORS.map((color) => [color.value.toLowerCase(), color.name])
);

export default COLORS;
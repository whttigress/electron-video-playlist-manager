// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
// import "/@/styles/main.scss";
import { aliases, mdi } from "vuetify/iconsets/mdi";

// Vuetify
import { createVuetify } from "vuetify";

export default createVuetify({
  theme: {
    defaultTheme: "dark",
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
});
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides

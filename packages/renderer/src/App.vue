<template>
  <v-app>
    <app-navigation />
    <router-view />
  </v-app>
</template>

<script>
import { defineComponent } from 'vue'
import AppNavigation from '/@/components/AppNavigation.vue'
export default defineComponent({
  name: 'App',
  components: {
    AppNavigation,
  },
})
</script>

<style>
body {
  background-color: #222;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  /* margin-top: 60px; */
}
a:link {
  color: lightblue;
  text-decoration: underline;
  cursor: auto;
}

a:link:active {
  color: lightskyblue;
}
a:visited {
  color: rgb(229, 214, 253);
  text-decoration: underline;
  cursor: auto;
}

a:visited:active {
  color: #ddabfe;
}
</style>

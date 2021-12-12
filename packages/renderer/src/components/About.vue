<script setup>
import { useRouter, useRoute } from 'vue-router'
const versions = window.versions

const router = useRouter()
const route = useRoute()
console.log(router.options.routes)
</script>
<template>
  <h2 id="versions">Lib versions</h2>
  <div>
    <p>{{ route?.path }}</p>
    <div v-if="route?.name">{{ route.name }}</div>
    <div v-if="router?.options?.routes?.length > 0">
      <li v-for="r in router?.options?.routes">{{ r.name }}</li>
    </div>
    <v-btn>test</v-btn>
    <ul aria-labelledby="versions">
      <li v-for="(version, lib) in versions" :key="lib">
        <strong>{{ lib }}</strong
        >: v{{ version }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
div {
  text-align: left;
  display: grid;
  justify-content: center;
}
</style>

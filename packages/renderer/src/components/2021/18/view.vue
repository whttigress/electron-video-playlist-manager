<script setup>
import { ref, reactive } from 'vue'
import input from './input.txt'

var items = input.split('\n').filter((x) => !!x)
</script>
<template>
  <div>
    <h2>{{ $route.name }}</h2>
    <h4>Puzzle 1</h4>

    <h4>Puzzle 2</h4>
  </div>
</template>
<style scoped></style>

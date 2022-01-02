<script setup>
import { ref, computed, watch, } from 'vue'
var props = defineProps({
  list: Array,
  title: String,
})
const newItem = ref('')
function addItem() {
  props.list.push(newItem.value)
  newItem.value = ''
}
function clearItem() {
  newItem.value = ''
}
function removeItem(value) {
  let i = props.list.indexOf(value)
  props.list.splice(i, 1)
}
</script>
<template>
  <div>
    <div class="text-lg font-bold my-2">{{ title }}</div>
    <div v-for="(item, x) in list" :key="x" class="flex justify-between">
      <span>
        {{ item }}
      </span>
      <span
        class="ml-1 mdi mdi-trash-can cursor-pointer"
        @click="removeItem(item)"
      ></span>
    </div>
    <input
      v-model="newItem"
      placeholder="add new"
      type="text"
      @keyup.enter="addItem"
      @keyup.esc="clearItem"
      class="
        appearance-none
        h-6
        p-0
        bg-transparent
        focus:outline-none focus:ring-0 focus:shadow-none
        my-2
        bg-slate-600
        border-b border-white
        w-5/6
      "
    />
  </div>
</template>
<style scoped></style>

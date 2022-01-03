<script setup>
import { computed, defineComponent, ref, watch } from 'vue'
let props = defineProps({
  dialog: Boolean,
})
let emit = defineEmits(['update:dialog'])
function closeDialog() {
  emit('update:dialog', false)
}
</script>
<template>
  <transition
    enter-active-class="duration-200"
    leave-active-class="duration-200"
    enter-from-class="opacity-0 "
    leave-to-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
  >
    <span
      v-if="props.dialog"
      @keyup.esc="closeDialog"
      class="relative inset-0 top-8"
    >
      <div class="fixed z-40 inset-0 top-8 opacity-50 bg-black"></div>
      <div
        class="fixed overflow-hidden h-full inset-0 top-8 z-50"
        @click="closeDialog"
      >
        <div
          class="
            relative
            w-auto
            h-screen
            flex
            items-center
            justify-center
            py-8
            mx-6
          "
        >
          <div
            @click.stop
            class="
              bg-gray-500
              w-full
              max-h-full
              rounded-lg
              shadow-xl
              border-2 border-gray-800
              p-4
              mb-6
              flex flex-col
              gap-2
            "
          >
            <slot></slot>
          </div>
        </div>
      </div>
    </span>
  </transition>
</template>
<style scoped></style>

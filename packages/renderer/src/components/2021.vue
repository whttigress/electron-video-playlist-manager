<template>
  <div>
    <v-main>
      <v-container class="fill-height">
        <div>2021</div>
        <span v-for="(n, index) in 25">
          <router-link  :to="`/2021/${n}`">
            {{ n }} </router-link
          >|
        </span>
        <router-view></router-view>
      </v-container>
    </v-main>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>

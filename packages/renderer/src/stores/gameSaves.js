import { defineStore } from "pinia";

const useGameSaves = defineStore({
  id: "gameSaveStore",
  state() {
    return {
      counter: 0,
    };
  },
  actions: {
    increment() {
      this.counter++;
    },
    decrement() {
      this.counter--;
    },
  },
});

export default useGameSaves;

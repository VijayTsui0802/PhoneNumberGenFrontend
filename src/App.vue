<template>
  <div id="app">
    <router-view />
    <AppFooter />
  </div>
</template>

<script>
import AppFooter from './components/AppFooter.vue';

export default {
  components: {
    AppFooter
  }
};
</script>

<style>
body {
  margin: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#app {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.router-view {
  flex: 1;
}
</style>

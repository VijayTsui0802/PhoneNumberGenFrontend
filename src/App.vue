<!-- src/App.vue -->
<template>
  <div id="app">
    <div class="content">
      <router-view />
    </div>
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

.router-view {
  flex: 1;
}
</style>

<template>
  <div class="alert-container">
    <div class="alert alert-danger alert-dismissible fade show" role="alert" v-for="(msg, index) in messages" :key="index">
      <strong>提示!</strong> {{ msg }}
      <button type="button" class="btn-close" @click="closeAlert(index)" aria-label="Close"></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlertMessage',
  props: {
    duration: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      messages: []
    };
  },
  methods: {
    addMessage(message) {
      this.messages.push(message);
      this.autoClose(this.messages.length - 1);
    },
    closeAlert(index) {
      this.messages.splice(index, 1);
    },
    autoClose(index) {
      setTimeout(() => {
        this.messages.splice(index, 1);
      }, this.duration);
    }
  }
};
</script>

<style scoped>
.alert-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeIn 0.5s, fadeOut 0.5s 4.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>

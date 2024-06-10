<template>
  <div class="task-progress">
    <div class="task-info">
      <span>Task ID: {{ taskId }}</span>
      <span>Status: {{ status }}</span>
    </div>
    <div class="progress-bar">
      <div :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['taskId', 'status', 'progress']
};
</script>

<style scoped>
.task-info {
  display: flex;
  justify-content: space-between;
}
.progress-bar {
  width: 100%;
  background: #f0f0f0;
}
.progress-bar > div {
  height: 20px;
  background: #4caf50;
}
</style>

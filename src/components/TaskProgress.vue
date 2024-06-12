<template>
  <div class="task-progress d-flex align-items-center justify-content-between">
    <div class="task-info d-flex flex-column flex-md-row">
      <span class="me-2">Task ID: {{ taskId }}</span>
      <span>Status: {{ status }}</span>
    </div>
    <div class="progress rounded-pill" style="width: 60%; margin-left: 10px;">
      <div class="progress-bar" role="progressbar" :style="{ width: progress + '%', background: progress < 50 ? 'red' : 'green' }"></div>
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
  flex-wrap: wrap;
  align-items: center;
}
.progress {
  height: 20px;
  background: #f0f0f0;
}
.progress-bar {
  height: 100%;
}
</style>

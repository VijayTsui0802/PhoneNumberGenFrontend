<template>
  <div class="container mt-4">
    <h1 class="mb-4 text-center">号码生成器</h1>

    <div class="form-group mb-3">
      <label for="prefix">前缀：</label>
      <div class="d-flex flex-wrap">
        <div v-for="(prefix, index) in prefixes" :key="index" class="input-group mb-2 me-2" :class="{'border-red': exhaustedPrefixes.includes(prefix)}" :title="exhaustedPrefixes.includes(prefix) ? '号段可能性耗尽' : ''" style="flex: 1 1 auto; min-width: 150px;">
          <input type="text" class="form-control" v-model="prefixes[index]" @input="validatePrefix(index)" required />
          <button type="button" class="btn btn-danger" @click="removePrefix(index)">移除</button>
        </div>
      </div>
    </div>

    <form @submit.prevent="generateNumbers" class="form-inline d-flex flex-wrap align-items-center justify-content-center mb-3">
      <button type="button" class="btn btn-secondary mb-3 me-2" @click="addPrefix">添加前缀</button>

      <div class="form-group mb-2 me-2 d-flex align-items-center">
        <label for="length" class="me-2">总长度：</label>
        <input type="number" class="form-control me-2" v-model="length" id="length" required style="max-width: 100px;" />
      </div>

      <div class="form-group mb-2 me-2 d-flex align-items-center">
        <label for="count" class="me-2">生成数量：</label>
        <input type="number" class="form-control me-2" v-model="count" id="count" required style="max-width: 100px;" />
      </div>

      <button type="submit" class="btn btn-primary mb-3 me-2">生成</button>
    </form>

    <div v-for="task in tasks" :key="task.taskId" class="mb-4 d-flex align-items-center">
      <TaskProgress :taskId="task.taskId" :status="task.status" :progress="task.progress" />
      <button v-if="!task.isCompleted" type="button" class="btn btn-danger ms-3" @click="stopTask(task.taskId)">停止</button>
      <button v-if="task.isCompleted" type="button" class="btn btn-success ms-3" @click="downloadTaskResult(task.taskId)">下载</button>
    </div>

    <AlertMessage ref="alertMessage" />
  </div>
</template>

<script>
import axios from 'axios';
import AlertMessage from './AlertMessage.vue';
import TaskProgress from './TaskProgress.vue';

export default {
  components: {
    AlertMessage,
    TaskProgress
  },
  data() {
    return {
      prefixes: JSON.parse(localStorage.getItem('prefixes') || '[""]'),
      length: parseInt(localStorage.getItem('length') || '10'),
      count: parseInt(localStorage.getItem('count') || '1'),
      tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
      prefixError: '',
      exhaustedPrefixes: [],
    };
  },
  watch: {
    prefixes: {
      handler(newVal) {
        localStorage.setItem('prefixes', JSON.stringify(newVal));
      },
      deep: true
    },
    length(newVal) {
      localStorage.setItem('length', newVal);
    },
    count(newVal) {
      localStorage.setItem('count', newVal);
    },
    tasks: {
      handler(newVal) {
        localStorage.setItem('tasks', JSON.stringify(newVal));
      },
      deep: true
    }
  },
  mounted() {
    this.tasks.forEach(task => {
      if (!task.isCompleted) {
        this.checkTaskStatus(task.taskId);
      }
    });
  },
  methods: {
    addPrefix() {
      this.prefixes.push('');
    },
    removePrefix(index) {
      this.prefixes.splice(index, 1);
    },
    validatePrefix(index) {
      const prefix = this.prefixes[index];
      if (!/^\d*$/.test(prefix)) {
        this.prefixError = '前缀只能是数字';
      } else {
        this.prefixError = '';
      }
    },
    async generateNumbers() {
      if (this.prefixError) {
        alert(this.prefixError);
        return;
      }

      const response = await axios.post('/api/tasks/start/', {
        prefixes: this.prefixes,
        length: this.length,
        count: this.count
      });
      const taskId = response.data.task_id;
      this.tasks.unshift({ taskId, status: 'running', progress: 0, isCompleted: false });
      this.checkTaskStatus(taskId);
    },
    async checkTaskStatus(taskId) {
      const task = this.tasks.find(t => t.taskId === taskId);
      if (task) {
        try {
          const response = await axios.get(`/api/tasks/${taskId}/status/`);
          const { status, progress } = response.data;  // 移除未使用的 result
          task.status = status;
          task.progress = progress;
          task.isCompleted = status === 'completed';
          if (!task.isCompleted) {
            setTimeout(() => this.checkTaskStatus(taskId), 1000);
          }
        } catch (error) {
          console.error('Error fetching task status:', error);
        }
      }
    },
    stopTask(/* taskId */) {
      // 实现停止任务的逻辑，可以是通过API调用告诉后端停止任务
    },
    async downloadTaskResult(taskId) {
      try {
        const response = await axios.get(`/api/tasks/${taskId}/download/`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', `task_${taskId}_result.txt`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading task result:', error);
      }
    }
  }
};
</script>

<style>
.container {
  max-width: 100%;
}
.input-group {
  flex: 1;
  min-width: 150px;
}
.border-red {
  border: 1px solid red;
}
</style>


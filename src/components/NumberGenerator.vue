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

    <div v-for="task in tasks" :key="task.taskId" class="mb-4">
      <TaskProgress :taskId="task.taskId" :status="task.status" :progress="task.progress" />
      <button v-if="!task.isCompleted" type="button" class="btn btn-danger ms-3" @click="stopTask(task.taskId)">停止</button>
      <button v-if="task.isCompleted" type="button" class="btn btn-success ms-3" @click="downloadTaskResult(task.taskId)">下载</button>
    </div>

    <AlertMessage ref="alertMessage" />

    <h5 class="mt-4">历史记录</h5>
    <ul class="list-group">
      <li class="list-group-item" v-for="history in paginatedHistories" :key="history.timestamp">
        {{ history.timestamp }} -
        <button @click="downloadHistory(history)" class="btn btn-link">{{ history.fileName }}</button>
      </li>
    </ul>
    <PaginationComponent :currentPage="currentPage" :totalPages="totalPages" @page-changed="changePage" />
  </div>
</template>

<script>
import axios from 'axios';
import AlertMessage from './AlertMessage.vue';
import PaginationComponent from './PaginationComponent.vue';
import TaskProgress from './TaskProgress.vue';

export default {
  components: {
    AlertMessage,
    PaginationComponent,
    TaskProgress
  },
  data() {
    return {
      prefixes: JSON.parse(localStorage.getItem('prefixes') || '[""]'),
      length: parseInt(localStorage.getItem('length') || '10'),
      count: parseInt(localStorage.getItem('count') || '1'),
      tasks: [],
      histories: JSON.parse(localStorage.getItem('histories') || '[]'),
      prefixError: '',
      exhaustedPrefixes: [],
      currentPage: 1,
      itemsPerPage: 15
    };
  },
  computed: {
    sortedHistories() {
      return this.histories.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    totalPages() {
      return Math.ceil(this.histories.length / this.itemsPerPage);
    },
    paginatedHistories() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedHistories.slice(start, end);
    }
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
    }
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
      this.tasks.push({ taskId, status: 'running', progress: 0, isCompleted: false });
      this.checkTaskStatus(taskId);
    },
    async checkTaskStatus(taskId) {
      const task = this.tasks.find(t => t.taskId === taskId);
      if (task) {
        try {
          const response = await axios.get(`/api/tasks/${taskId}/status/`);
          const { status, progress, result } = response.data;
          console.log(`Task ${taskId} status: ${status}, progress: ${progress}`);
          task.status = status;
          task.progress = progress;
          task.isCompleted = status === 'completed';
          if (!task.isCompleted) {
            setTimeout(() => this.checkTaskStatus(taskId), 1000);
          } else {
            this.addToHistory(taskId, result);
          }
        } catch (error) {
          console.error('Error fetching task status:', error);
        }
      }
    },
    stopTask(/* taskId */) {
      // 实现停止任务的逻辑，可以是通过API调用告诉后端停止任务
    },
    downloadTaskResult(taskId) {
      const task = this.tasks.find(t => t.taskId === taskId);
      if (task && task.isCompleted) {
        const blob = new Blob([task.result], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `task_${taskId}_result.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    addToHistory(taskId, result) {
      const timestamp = new Date().toLocaleString();
      const fileName = `generated_numbers_${timestamp.replace(/[/: ]/g, '_')}.txt`;
      const history = { timestamp, fileName, result };
      this.histories.push(history);
      localStorage.setItem('histories', JSON.stringify(this.histories));
    },
    downloadHistory(history) {
      const blob = new Blob([history.result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = history.fileName;
      a.click();
      URL.revokeObjectURL(url);
    },
    changePage(page) {
      this.currentPage = page;
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

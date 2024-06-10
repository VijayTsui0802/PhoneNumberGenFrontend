<template>
  <div class="container mt-4">
    <h1 class="mb-4 text-center">号码生成器</h1>

    <!-- Prefix Section -->
    <div class="form-group mb-3">
      <label for="prefix">前缀：</label>
      <div class="d-flex flex-wrap">
        <div v-for="(prefix, index) in prefixes" :key="index" class="input-group mb-2 me-2" :class="{'border-red': exhaustedPrefixes.includes(prefix)}" :title="exhaustedPrefixes.includes(prefix) ? '号段可能性耗尽' : ''" style="flex: 1 1 auto; min-width: 150px;">
          <input type="text" class="form-control" v-model="prefixes[index]" @input="validatePrefix(index)" required />
          <button type="button" class="btn btn-danger" @click="removePrefix(index)">移除</button>
        </div>
      </div>
    </div>

    <!-- Other Inputs Section -->
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

    <!-- Progress Bar Section -->
    <div v-if="progress > 0" class="d-flex align-items-center mb-4">
      <div class="progress" style="flex-grow: 1;">
        <div class="progress-bar" role="progressbar" :style="{ width: progress + '%', backgroundColor: progress === 100 ? 'green' : '' }" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">{{ progress.toFixed(2) }}%</div>
      </div>
      <button v-if="isLoading" type="button" class="btn btn-danger ms-3" @click="stopGeneration">停止</button>
      <button v-if="!isLoading && progress === 100" type="button" class="btn btn-success ms-3" @click="downloadNumbers">下载</button>
    </div>

    <!-- Alert Messages -->
    <AlertMessage ref="alertMessage" />

    <!-- History Section -->
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

export default {
  components: {
    AlertMessage,
    PaginationComponent
  },
  data() {
    return {
      prefixes: JSON.parse(localStorage.getItem('prefixes') || '[""]'),
      length: parseInt(localStorage.getItem('length') || '10'),
      count: parseInt(localStorage.getItem('count') || '1'),
      numbers: [],
      histories: JSON.parse(localStorage.getItem('histories') || '[]'),
      isLoading: false,
      progress: 0,
      prefixError: '',
      stopRequested: false,
      errorMessage: '',
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
      this.isLoading = true;
      this.progress = 0;
      this.stopRequested = false;
      this.errorMessage = '';
      this.exhaustedPrefixes = [];
      const prefixArray = this.prefixes.filter(p => p.trim());
      const totalRequests = this.count;
      let completedRequests = 0;
      const numbersPerPrefix = Math.ceil(this.count / prefixArray.length);

      const updateProgress = () => {
        completedRequests += 1;
        this.progress = (completedRequests / totalRequests) * 100;
        if (completedRequests >= totalRequests || this.stopRequested) {
          this.isLoading = false;
          this.progress = 100; // Ensure progress is set to 100% on completion
        }
      };

      this.numbers = [];

      for (let prefix of prefixArray) {
        if (this.stopRequested) break;
        for (let i = 0; i < numbersPerPrefix; i++) {
          if (this.stopRequested) break;
          if (this.numbers.length >= this.count) break;
          if (this.exhaustedPrefixes.includes(prefix)) continue;
          try {
            const response = await axios.post('/api/numbers/generate/', {
              prefixes: [prefix],
              length: this.length,
              count: 1
            });
            if (response.status === 207) {
              this.exhaustedPrefixes.push(prefix);
              this.numbers.push(...response.data.numbers);
              this.$refs.alertMessage.addMessage(`前缀 ${response.data.exhausted_prefixes.join(', ')} 已经无新的号码可以生成`);
              if (this.exhaustedPrefixes.length === prefixArray.length) {
                this.$refs.alertMessage.addMessage('所有前缀段都已无新的号码可以生成');
                this.isLoading = false;
                this.progress = 100;
                return;
              }
            } else {
              this.numbers.push(...response.data);
              updateProgress();
            }
          } catch (error) {
            console.error('生成号码时出错：', error);
            this.$refs.alertMessage.addMessage('生成号码时发生错误，请重试');
            this.isLoading = false;
            this.progress = 100;
            return;
          }
        }
      }

      this.isLoading = false;
      this.addToHistory(this.numbers);
      this.progress = 100;
    },
    stopGeneration() {
      this.stopRequested = true;
      this.isLoading = false;
      this.progress = 100;
    },
    downloadNumbers() {
      const blob = new Blob([this.numbers.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated_numbers.txt';
      a.click();
      URL.revokeObjectURL(url);
    },
    addToHistory(numbers) {
      const timestamp = new Date().toLocaleString();
      const fileName = `generated_numbers_${timestamp.replace(/[/: ]/g, '_')}.txt`;
      const history = { timestamp, fileName, numbers };
      this.histories.push(history);
      localStorage.setItem('histories', JSON.stringify(this.histories));
    },
    downloadHistory(history) {
      const blob = new Blob([history.numbers.join('\n')], { type: 'text/plain' });
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
.progress {
  display: flex;
  align-items: center;
}
.progress-bar {
  flex: 1;
}
</style>

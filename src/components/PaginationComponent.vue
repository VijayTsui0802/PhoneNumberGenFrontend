// src/components/PaginationComponent.vue
<template>
  <div class="pagination-container">
    <div class="d-flex align-items-center flex-wrap justify-content-center">
      <label for="pageSize" class="me-2 mb-2">每页显示:</label>
      <select v-model.number="pageSize" @change="updatePageSize" id="pageSize" class="form-select me-2 mb-2">
        <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
      </select>
      <nav aria-label="Page navigation" class="mb-2">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" aria-label="First" @click.prevent="changePage(1)">
              <span aria-hidden="true">&laquo;&laquo;</span>
            </a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" aria-label="Previous" @click.prevent="changePage(currentPage - 1)">
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          <li class="page-item" v-for="page in pagesToShow" :key="page" :class="{ active: currentPage === page }">
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" aria-label="Next" @click.prevent="changePage(currentPage + 1)">
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" aria-label="Last" @click.prevent="changePage(totalPages)">
              <span aria-hidden="true">&raquo;&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
      <input type="number" class="form-control ms-2 mb-2" v-model.number="inputPage" @keyup.enter="jumpToPage" min="1" :max="totalPages" style="width: 70px;" />
      <button class="btn btn-primary ms-2 mb-2" @click="jumpToPage">跳转</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaginationComponent',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      inputPage: this.currentPage,
      pageSize: 5,
      pageSizes: [5, 10, 20, 50]
    };
  },
  computed: {
    pagesToShow() {
      const range = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      return range;
    }
  },
  methods: {
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.$emit('page-changed', page);
        this.inputPage = page;
      }
    },
    jumpToPage() {
      if (this.inputPage > 0 && this.inputPage <= this.totalPages) {
        this.changePage(this.inputPage);
      }
    },
    updatePageSize() {
      this.$emit('page-size-changed', this.pageSize);
    }
  }
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.page-item.disabled .page-link {
  pointer-events: none;
  cursor: not-allowed;
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

input[type="number"] {
  width: 70px;
}

select {
  width: auto;
}
</style>

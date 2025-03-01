<template>
  <div class="pagination">
    <div class="pagination-info">
      显示 {{ startItem }}-{{ endItem }} 条，共 {{ total }} 条
    </div>
    <div class="pagination-controls">
      <button 
        class="pagination-btn" 
        :disabled="currentPage === 1"
        @click="changePage(1)"
      >
        «
      </button>
      <button 
        class="pagination-btn" 
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        ‹
      </button>
      
      <template v-for="page in visiblePages">
        <span v-if="page === '...'" :key="'ellipsis-' + page" class="pagination-ellipsis">...</span>
        <button 
          v-else
          :key="page"
          class="pagination-btn" 
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </template>
      
      <button 
        class="pagination-btn" 
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        ›
      </button>
      <button 
        class="pagination-btn" 
        :disabled="currentPage === totalPages"
        @click="changePage(totalPages)"
      >
        »
      </button>
    </div>
    <div class="pagination-per-page">
      <select v-model="itemsPerPage" class="form-control">
        <option value="10">10条/页</option>
        <option value="20">20条/页</option>
        <option value="50">50条/页</option>
        <option value="100">100条/页</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TablePagination',  // 修改为多词组件名
  props: {
    total: {
      type: Number,
      required: true
    },
    perPage: {
      type: Number,
      default: 10
    },
    currentPage: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      itemsPerPage: this.perPage
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.itemsPerPage);
    },
    startItem() {
      return this.total === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.total);
    },
    visiblePages() {
      const pages = [];
      const maxVisiblePages = 7;
      
      if (this.totalPages <= maxVisiblePages) {
        // 如果总页数小于最大可见页数，显示所有页码
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 总是显示第一页
        pages.push(1);
        
        // 计算中间页码的范围
        let startPage = Math.max(2, this.currentPage - 2);
        let endPage = Math.min(this.totalPages - 1, this.currentPage + 2);
        
        // 调整以确保显示5个页码
        if (startPage > 2) pages.push('...');
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        
        if (endPage < this.totalPages - 1) pages.push('...');
        
        // 总是显示最后一页
        pages.push(this.totalPages);
      }
      
      return pages;
    }
  },
  methods: {
    changePage(page) {
      this.$emit('page-changed', page);
    }
  },
  watch: {
    itemsPerPage() {
      this.$emit('update:per-page', this.itemsPerPage);
      // 切换每页显示数量时，重置到第一页
      this.$emit('page-changed', 1);
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 14px;
}

.pagination-info {
  color: rgba(0, 0, 0, 0.6);
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.pagination-btn {
  min-width: 32px;
  height: 32px;
  margin: 0 4px;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
}

.pagination-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.04);
}

.pagination-btn:disabled {
  color: rgba(0, 0, 0, 0.26);
  cursor: not-allowed;
}

.pagination-btn.active {
  background-color: var(--primary);
  color: var(--on-primary);
}

.pagination-ellipsis {
  margin: 0 4px;
  color: rgba(0, 0, 0, 0.6);
}

.pagination-per-page {
  width: 120px;
}

.pagination-per-page .form-control {
  height: 32px;
  padding: 4px 8px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .pagination-info, .pagination-controls, .pagination-per-page {
    margin-bottom: 12px;
  }
}
</style>
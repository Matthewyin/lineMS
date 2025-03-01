<template>
  <div class="column-selector-overlay" @click="close">
    <div class="column-selector-modal" @click.stop>
      <div class="modal-header">
        <h3>自定义显示列</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="modal-body">
        <div class="column-list">
          <div 
            v-for="column in columns" 
            :key="column.key"
            class="column-item"
          >
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                :value="column.key" 
                v-model="selectedColumnKeys"
                :disabled="isRequired(column)"
              />
              <span class="checkbox-custom"></span>
              <span class="column-label">{{ column.label }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-text" @click="selectAll">全选</button>
        <button class="btn btn-text" @click="selectNone" :disabled="hasRequiredColumns">清除</button>
        <button class="btn btn-primary" @click="applyChanges">应用</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColumnSelector',
  props: {
    columns: {
      type: Array,
      required: true
    },
    selectedColumns: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedColumnKeys: [...this.selectedColumns]
    };
  },
  computed: {
    hasRequiredColumns() {
      return this.columns.some(column => column.required);
    }
  },
  methods: {
    isRequired(column) {
      return column.required;
    },
    selectAll() {
      this.selectedColumnKeys = this.columns.map(column => column.key);
    },
    selectNone() {
      this.selectedColumnKeys = this.columns
        .filter(column => column.required)
        .map(column => column.key);
    },
    applyChanges() {
      this.$emit('update:selected-columns', this.selectedColumnKeys);
      this.close();
    },
    close() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.column-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.column-selector-modal {
  background-color: var(--surface);
  border-radius: 4px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.54);
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.column-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 12px;
}

.column-item {
  margin-bottom: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  position: relative;
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 2px solid rgba(0, 0, 0, 0.54);
  border-radius: 2px;
  margin-right: 8px;
}

.checkbox-label:hover input ~ .checkbox-custom {
  border-color: var(--primary);
}

.checkbox-label input:checked ~ .checkbox-custom {
  background-color: var(--primary);
  border-color: var(--primary);
}

.checkbox-custom:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-label input:checked ~ .checkbox-custom:after {
  display: block;
}

.checkbox-label .checkbox-custom:after {
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label input:disabled ~ .checkbox-custom {
  background-color: #e0e0e0;
  border-color: rgba(0, 0, 0, 0.26);
}

.column-label {
  font-size: 14px;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: flex-end;
}

.modal-footer button {
  margin-left: 8px;
}
</style>
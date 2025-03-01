export default {
  namespaced: true,
  state: {
    filters: {
      isp: '',
      payer: '',
      local: '',
      remote: '',
      purpose: ''
    }
  },
  getters: {
    activeFilters: state => {
      const active = {};
      for (const key in state.filters) {
        if (state.filters[key]) {
          active[key] = state.filters[key];
        }
      }
      return active;
    },
    hasActiveFilters: (state, getters) => Object.keys(getters.activeFilters).length > 0
  },
  mutations: {
    SET_FILTER(state, { key, value }) {
      state.filters[key] = value;
    },
    RESET_FILTERS(state) {
      for (const key in state.filters) {
        state.filters[key] = '';
      }
    }
  },
  actions: {
    setFilter({ commit }, { key, value }) {
      commit('SET_FILTER', { key, value });
    },
    resetFilters({ commit }) {
      commit('RESET_FILTERS');
    }
  }
};
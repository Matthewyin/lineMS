export default {
  namespaced: true,
  state: {
    perPage: 10,
    selectedColumns: [],
    theme: localStorage.getItem('theme') || 'auto' // 'light', 'dark', 'auto'
  },
  mutations: {
    SET_PER_PAGE(state, perPage) {
      state.perPage = perPage;
    },
    SET_SELECTED_COLUMNS(state, columns) {
      state.selectedColumns = columns;
    },
    SET_THEME(state, theme) {
      state.theme = theme;
      localStorage.setItem('theme', theme);
    }
  },
  actions: {
    setPerPage({ commit }, perPage) {
      commit('SET_PER_PAGE', perPage);
    },
    setSelectedColumns({ commit }, columns) {
      commit('SET_SELECTED_COLUMNS', columns);
    },
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme);
      document.documentElement.setAttribute('data-theme', theme);
    },
    initTheme({ state }) {
      const theme = state.theme;
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
};
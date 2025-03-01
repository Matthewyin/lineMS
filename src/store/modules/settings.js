export default {
  namespaced: true,
  state: {
    perPage: 10,
    selectedColumns: []
  },
  mutations: {
    SET_PER_PAGE(state, perPage) {
      state.perPage = perPage;
    },
    SET_SELECTED_COLUMNS(state, columns) {
      state.selectedColumns = columns;
    }
  },
  actions: {
    setPerPage({ commit }, perPage) {
      commit('SET_PER_PAGE', perPage);
    },
    setSelectedColumns({ commit }, columns) {
      commit('SET_SELECTED_COLUMNS', columns);
    }
  }
};
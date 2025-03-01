import data2025 from '@/assets/data/2025.json';
import data2026 from '@/assets/data/2026.json';

export default {
  namespaced: true,
  state: {
    data2025: data2025,
    data2026: data2026,
    currentYear: 2025
  },
  getters: {
    data2025: state => state.data2025,
    data2026: state => state.data2026,
    currentData: state => state.currentYear === 2025 ? state.data2025 : state.data2026
  },
  mutations: {
    SET_CURRENT_YEAR(state, year) {
      state.currentYear = year;
    }
  },
  actions: {
    setCurrentYear({ commit }, year) {
      commit('SET_CURRENT_YEAR', year);
    }
  }
};
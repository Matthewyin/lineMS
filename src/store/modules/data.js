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
    currentData: state => {
      console.log('Getting currentData for year:', state.currentYear);
      return state.currentYear === 2025 ? state.data2025 : state.data2026;
    }
  },
  mutations: {
    SET_CURRENT_YEAR(state, year) {
      console.log('Setting current year to:', year);
      state.currentYear = year;
    }
  },
  actions: {
    setCurrentYear({ commit }, year) {
      // 如果年份是字符串格式，需要解析
      const yearValue = typeof year === 'string' ? parseInt(year.replace(/[^0-9]/g, '')) : year;
      console.log('Action setCurrentYear called with:', year, 'parsed as:', yearValue);
      commit('SET_CURRENT_YEAR', yearValue);
    }
  }
};
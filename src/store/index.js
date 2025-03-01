import { createStore } from 'vuex';
import dataModule from './modules/data';
import filterModule from './modules/filter';
import settingsModule from './modules/settings';

export default createStore({
  modules: {
    data: dataModule,
    filter: filterModule,
    settings: settingsModule
  }
});
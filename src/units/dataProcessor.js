/**
 * 根据筛选条件过滤数据
 * @param {Array} data 原始数据
 * @param {Object} filters 筛选条件
 * @returns {Array} 过滤后的数据
 */
export const filterData = (data, filters) => {
  return data.filter(item => {
    for (const key in filters) {
      if (filters[key] && item[key] !== filters[key]) {
        return false;
      }
    }
    return true;
  });
};

/**
 * 从数据中提取唯一值
 * @param {Array} data 数据
 * @param {String} field 字段名
 * @returns {Array} 唯一值数组
 */
export const getUniqueValues = (data, field) => {
  const values = data.map(item => item[field]).filter(Boolean);
  return [...new Set(values)].sort();
};

/**
 * 按字段分组数据
 * @param {Array} data 数据
 * @param {String} groupField 分组字段
 * @param {String} valueField 值字段
 * @returns {Object} 分组后的数据
 */
export const groupData = (data, groupField, valueField) => {
  const result = {};
  
  data.forEach(item => {
    const groupValue = item[groupField] || '未分类';
    
    if (!result[groupValue]) {
      result[groupValue] = {
        count: 0,
        total: 0
      };
    }
    
    result[groupValue].count += 1;
    result[groupValue].total += parseFloat(item[valueField] || 0);
  });
  
  return result;
};

/**
 * 比较两组数据
 * @param {Array} data1 第一组数据
 * @param {Array} data2 第二组数据
 * @param {String} groupField 分组字段
 * @param {String} compareField 比较字段
 * @returns {Object} 比较结果
 */
export const compareData = (data1, data2, groupField, compareField) => {
  const result = {};
  
  // 处理第一组数据
  data1.forEach(item => {
    const groupValue = item[groupField] || '未分类';
    
    if (!result[groupValue]) {
      result[groupValue] = {
        data1: 0,
        data2: 0,
        difference: 0,
        percentChange: 0
      };
    }
    
    result[groupValue].data1 += parseFloat(item[compareField] || 0);
  });
  
  // 处理第二组数据
  data2.forEach(item => {
    const groupValue = item[groupField] || '未分类';
    
    if (!result[groupValue]) {
      result[groupValue] = {
        data1: 0,
        data2: 0,
        difference: 0,
        percentChange: 0
      };
    }
    
    result[groupValue].data2 += parseFloat(item[compareField] || 0);
  });
  
  // 计算差异和变化率
  for (const key in result) {
    result[key].difference = result[key].data2 - result[key].data1;
    
    if (result[key].data1 !== 0) {
      result[key].percentChange = (result[key].difference / result[key].data1) * 100;
    } else if (result[key].data2 !== 0) {
      result[key].percentChange = 100; // 从0增长到非0，变化率为100%
    } else {
      result[key].percentChange = 0; // 两者都为0，变化率为0
    }
  }
  
  return result;
};
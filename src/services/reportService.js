import axios from 'axios';
import API_BASE_URL from '../config/api';

/**
 * Service để tương tác với Report APIs
 */
const reportAPI = {
  /**
   * Tạo báo cáo sử dụng phòng
   * @param {number} userId - ID của user
   * @param {Date|string} periodStart - Ngày bắt đầu
   * @param {Date|string} periodEnd - Ngày kết thúc
   * @param {string} accessToken - JWT access token
   * @returns {Promise} Report object
   */
  createUsageReport: async function(userId, periodStart, periodEnd, accessToken) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/report/usage`,
        {
          id: userId,
          periodStart: periodStart instanceof Date ? periodStart.toISOString() : periodStart,
          periodEnd: periodEnd instanceof Date ? periodEnd.toISOString() : periodEnd
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      console.log('✅ Báo cáo sử dụng đã tạo:', response.data.metaData.newReport);
      return response.data.metaData.newReport;
    } catch (error) {
      console.error('Error creating usage report:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Lấy chi tiết báo cáo sử dụng theo ID
   * @param {number} reportId - ID của báo cáo
   * @param {string} accessToken - JWT access token
   * @returns {Promise} Report object
   */
  getUsageReport: async function(reportId, accessToken) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/report/usage/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return response.data.metaData || response.data.data;
    } catch (error) {
      console.error('Error getting usage report:', error);
      throw error;
    }
  },

  /**
   * Tạo báo cáo năng lượng
   * @param {number} userId - ID của user
   * @param {Date|string} periodStart - Ngày bắt đầu
   * @param {Date|string} periodEnd - Ngày kết thúc
   * @param {string} accessToken - JWT access token
   * @returns {Promise} Report object
   */
  createEnergyReport: async function(userId, periodStart, periodEnd, accessToken) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/report/energy`,
        {
          id: userId,
          periodStart: periodStart instanceof Date ? periodStart.toISOString() : periodStart,
          periodEnd: periodEnd instanceof Date ? periodEnd.toISOString() : periodEnd
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      console.log('✅ Báo cáo năng lượng đã tạo:', response.data.metaData.newReport);
      return response.data.metaData.newReport;
    } catch (error) {
      console.error('Error creating energy report:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Lấy chi tiết báo cáo năng lượng theo ID
   * @param {number} reportId - ID của báo cáo
   * @param {string} accessToken - JWT access token
   * @returns {Promise} Report object
   */
  getEnergyReport: async function(reportId, accessToken) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/report/energy/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      return response.data.metaData || response.data.data;
    } catch (error) {
      console.error('Error getting energy report:', error);
      throw error;
    }
  },

  /**
   * Tạo báo cáo sử dụng cho tháng hiện tại
   * @param {number} userId - ID của user
   * @param {string} accessToken - JWT access token
   * @returns {Promise} Report object
   */
  createCurrentMonthReport: async function(userId, accessToken) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    return this.createUsageReport(userId, periodStart, periodEnd, accessToken);
  },

  /**
   * Tạo báo cáo sử dụng cho năm hiện tại
   * @param {number} userId - ID của user
   * @param {string} accessToken - JWT access token
   * @returns {Promise} Report object
   */
  createCurrentYearReport: async function(userId, accessToken) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), 0, 1);
    const periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    
    return this.createUsageReport(userId, periodStart, periodEnd, accessToken);
  },

  /**
   * Tạo báo cáo năng lượng cho tháng hiện tại
   * @param {number} userId - ID của user
   * @param {string} accessToken - JWT access token
   * @returns {Promise} Report object
   */
  createCurrentMonthEnergyReport: async function(userId, accessToken) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    return this.createEnergyReport(userId, periodStart, periodEnd, accessToken);
  }
};

export default reportAPI;

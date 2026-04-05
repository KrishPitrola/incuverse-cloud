import retirementAPI from '../services/api';

const PDFReportGenerator = {
  async downloadReport(formData, analysis, projection, strategies, simulationResults) {
    console.log('downloadReport called with:', {
      formData,
      analysis,
      projection,
      strategies,
      simulationResults,
    });

    try {
      const data = await retirementAPI.generateReport(formData, projection, simulationResults);
      
      console.log('PDF generation response:', data);

      if (data.download_url) {
        window.open(data.download_url, '_blank');
      } else {
        throw new Error('No download_url returned from backend');
      }
    } catch (error) {
      console.error('PDFReportGenerator error:', error);
      throw error;
    }
  }
};

export default PDFReportGenerator;
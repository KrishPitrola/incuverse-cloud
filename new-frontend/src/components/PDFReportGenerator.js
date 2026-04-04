// PDF Report Generator - No external dependencies

const PDFReportGenerator = {
  // Generate simple text-based report
  generateReport: async (formData, analysis, projection, strategies, simulationResults = null) => {
    const reportData = {
      title: 'FinAI Retirement Planning Report',
      date: new Date().toLocaleDateString('en-IN'),
      personalInfo: {
        age: formData.age,
        retirementAge: formData.retirement_age,
        annualIncome: formData.annual_income,
        monthlyExpenses: formData.monthly_expenses,
        currentSavings: formData.current_savings,
        monthlySavings: formData.monthly_savings,
        targetCorpus: formData.retirement_goal
      },
      analysis: analysis,
      projection: projection,
      strategies: strategies,
      simulationResults: simulationResults
    };

    return reportData;
  },

  // Download report as text file (works without external dependencies)
  downloadReport: async (formData, analysis, projection, strategies, simulationResults = null) => {
    console.log('PDFReportGenerator.downloadReport called with:', {
      formData: !!formData,
      analysis: !!analysis,
      projection: !!projection,
      strategies: !!strategies,
      simulationResults: !!simulationResults
    });
    
    try {
      const reportData = await PDFReportGenerator.generateReport(formData, analysis, projection, strategies, simulationResults);
      console.log('Report data generated:', !!reportData);
      
      // Create comprehensive text-based report
      let reportText = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                           FINAI RETIREMENT PLANNING REPORT                   ║
║                              Generated on: ${reportData.date}                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                              PERSONAL INFORMATION                           │
└─────────────────────────────────────────────────────────────────────────────┘

Current Age: ${reportData.personalInfo.age} years
Target Retirement Age: ${reportData.personalInfo.retirementAge} years
Years to Retirement: ${reportData.personalInfo.retirementAge - reportData.personalInfo.age} years
Annual Income: ₹${parseFloat(reportData.personalInfo.annualIncome).toLocaleString('en-IN')}
Monthly Expenses: ₹${parseFloat(reportData.personalInfo.monthlyExpenses).toLocaleString('en-IN')}
Current Savings: ₹${parseFloat(reportData.personalInfo.currentSavings).toLocaleString('en-IN')}
Monthly Savings: ₹${parseFloat(reportData.personalInfo.monthlySavings).toLocaleString('en-IN')}
Target Retirement Corpus: ₹${parseFloat(reportData.personalInfo.targetCorpus).toLocaleString('en-IN')}

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FINANCIAL ANALYSIS                             │
└─────────────────────────────────────────────────────────────────────────────┘

${analysis?.summary || 'Analysis summary not available'}

┌─────────────────────────────────────────────────────────────────────────────┐
│                                KEY METRICS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Retirement Readiness Score: ${projection?.readiness_percentage?.toFixed(1) || 0}%
Projected Corpus at Retirement: ₹${projection?.projected_corpus?.toLocaleString('en-IN') || 0}
Target Retirement Goal: ₹${parseFloat(formData.retirement_goal).toLocaleString('en-IN')}
Financial Gap/Surplus: ₹${Math.abs((projection?.projected_corpus || 0) - (formData.retirement_goal || 0)).toLocaleString('en-IN')}
Status: ${(projection?.projected_corpus || 0) >= (formData.retirement_goal || 0) ? '✅ ON TRACK' : '⚠️ NEEDS ATTENTION'}

┌─────────────────────────────────────────────────────────────────────────────┐
│                               KEY INSIGHTS                                  │
└─────────────────────────────────────────────────────────────────────────────┘
${analysis?.key_insights?.map((insight, index) => `${index + 1}. ${insight}`).join('\n') || 'No insights available'}

┌─────────────────────────────────────────────────────────────────────────────┐
│                               RISK FACTORS                                 │
└─────────────────────────────────────────────────────────────────────────────┘
${analysis?.risk_factors?.map((risk, index) => `${index + 1}. ${risk}`).join('\n') || 'No risk factors identified'}

┌─────────────────────────────────────────────────────────────────────────────┐
│                          RECOMMENDED STRATEGIES                             │
└─────────────────────────────────────────────────────────────────────────────┘
${strategies?.strategies?.map((strategy, index) => `
${index + 1}. ${strategy.title}
   • Impact Level: ${strategy.expected_impact}
   • Implementation Difficulty: ${strategy.difficulty}
   • Timeframe: ${strategy.timeframe}
   • Description: ${strategy.description}
   • Expected Benefits: ${strategy.expected_benefits}
   • Implementation Steps:
${strategy.implementation_steps?.map((step, stepIndex) => `     ${stepIndex + 1}. ${step}`).join('\n') || '     No steps provided'}
`).join('\n') || 'No strategies available'}

┌─────────────────────────────────────────────────────────────────────────────┐
│                         IMPLEMENTATION ROADMAP                              │
└─────────────────────────────────────────────────────────────────────────────┘
${strategies?.implementation_order?.map((strategyTitle, index) => `${index + 1}. ${strategyTitle}`).join('\n') || 'No implementation order provided'}

${simulationResults ? `
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SIMULATION RESULTS                                │
└─────────────────────────────────────────────────────────────────────────────┘

AI Analysis Summary:
${simulationResults.ai_comparison || 'No AI analysis available'}

Recommendations:
${simulationResults.recommendations?.map((rec, index) => `${index + 1}. ${rec}`).join('\n') || 'No recommendations available'}

Best Scenario: ${simulationResults.best_scenario || 'Not determined'}

Scenario Comparison:
${simulationResults.scenarios?.map((scenario, index) => `
${index + 1}. ${scenario.name} (${scenario.lifestyle})
   • Retirement Age: ${scenario.retirement_age}
   • Monthly Savings: ₹${scenario.monthly_savings?.toLocaleString('en-IN')}
   • Final Corpus: ₹${scenario.total_corpus?.toLocaleString('en-IN')}
   • Monthly Pension: ₹${scenario.monthly_pension?.toLocaleString('en-IN')}
   • Adequacy Ratio: ${scenario.corpus_ratio}x
   • Total Invested: ₹${scenario.total_invested?.toLocaleString('en-IN')}
   • Wealth Created: ₹${scenario.wealth_created?.toLocaleString('en-IN')}
`).join('\n') || 'No simulation scenarios available'}
` : ''}

┌─────────────────────────────────────────────────────────────────────────────┐
│                              NEXT STEPS                                     │
└─────────────────────────────────────────────────────────────────────────────┘

1. Review your current investment portfolio
2. Implement the recommended strategies in the suggested order
3. Set up automatic SIP investments for consistency
4. Review and rebalance your portfolio annually
5. Consider consulting a financial advisor for personalized advice

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DISCLAIMER                                     │
└─────────────────────────────────────────────────────────────────────────────┘

This report is generated by FinAI Retirement Planner for educational and planning purposes only. 
Past performance does not guarantee future results. Please consult with a qualified financial 
advisor before making investment decisions. All calculations are estimates based on current 
market conditions and assumptions.

Generated by FinAI Retirement Planner
Report Date: ${new Date().toLocaleDateString('en-IN')}
For more information, visit: ${window.location.origin}/dashboard
      `;

      // Create and download text file
      console.log('Creating blob with report text length:', reportText.length);
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      console.log('Created blob URL:', url);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `FinAI_Retirement_Report_${new Date().toISOString().split('T')[0]}.txt`;
      console.log('Triggering download with filename:', link.download);
      link.click();
      URL.revokeObjectURL(url);
      console.log('PDF download completed');

    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report. Please try again.');
    }
  }
};

export default PDFReportGenerator;
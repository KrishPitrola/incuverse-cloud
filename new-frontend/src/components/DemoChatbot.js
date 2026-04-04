import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X, MessageCircle } from 'lucide-react';

const DemoChatbot = ({ userContext = null, onClose = null }) => {
  console.log('DemoChatbot component rendered with userContext:', !!userContext);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! I\'m FinAI, your retirement planning assistant. I can help you understand your retirement analysis, explain investment strategies, and answer questions about your financial future. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [conversationContext, setConversationContext] = useState({
    userGreeted: false,
    lastTopic: null,
    questionCount: 0
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Get user context data for personalized responses
  const getUserData = () => {
    if (!userContext) return null;
    const { formData, projection } = userContext;
    return {
      age: formData?.age || 30,
      retirementAge: formData?.retirement_age || 60,
      monthlySavings: formData?.monthly_savings || 25000,
      targetCorpus: formData?.retirement_goal || 50000000,
      readinessScore: projection?.readiness_percentage || 0,
      projectedCorpus: projection?.projected_corpus || 0,
      yearsToRetirement: (formData?.retirement_age || 60) - (formData?.age || 30)
    };
  };

  // Enhanced response system with conversation memory
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    const userData = getUserData();
    
    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      questionCount: prev.questionCount + 1,
      lastTopic: getTopicFromMessage(message)
    }));
    
    // Greeting responses with variety
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('good morning') || message.includes('good afternoon')) {
      const greetings = [
        `Hello there! 👋 I'm FinAI, your retirement planning assistant. I can see you're ${userData?.age} years old and planning to retire at ${userData?.retirementAge}. How can I help you today?`,
        `Hi! Great to see you! I'm here to help with your retirement planning. At ${userData?.age} years old with ${userData?.yearsToRetirement} years until retirement, we have plenty to discuss. What's on your mind?`,
        `Hey! Welcome back! I'm FinAI, your personal retirement planning assistant. I notice you're ${userData?.age} years old - perfect time to optimize your retirement strategy. What would you like to explore?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Retirement planning questions with detailed responses
    if (message.includes('retirement') || message.includes('retire') || message.includes('pension')) {
      const score = userData?.readinessScore || 0;
      const responses = [
        `Excellent question! 🎯 You have ${userData?.yearsToRetirement} years until retirement at age ${userData?.retirementAge}. Your current readiness score is ${score.toFixed(1)}%. ${score >= 80 ? 'You\'re doing great! 🎉' : score >= 60 ? 'You\'re on the right track! 👍' : 'There\'s definitely room for improvement! 📈'} Would you like me to break down your retirement analysis?`,
        `Retirement planning is crucial! 💰 With ${userData?.yearsToRetirement} years to go, you're in a ${userData?.yearsToRetirement >= 25 ? 'excellent' : userData?.yearsToRetirement >= 15 ? 'good' : 'challenging'} position. Your readiness score of ${score.toFixed(1)}% shows ${score >= 80 ? 'you\'re well-prepared!' : 'there\'s work to be done.'} Let me help you understand what this means.`,
        `Great focus on retirement! 🏖️ At ${userData?.age} years old, you have ${userData?.yearsToRetirement} years to build wealth. Your ${score.toFixed(1)}% readiness score indicates ${score >= 80 ? 'strong preparation' : 'areas for improvement'}. I can help you create a roadmap to retirement success!`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Investment questions with specific advice
    if (message.includes('invest') || message.includes('investment') || message.includes('sip') || message.includes('mutual fund') || message.includes('portfolio')) {
      const riskProfile = userData?.age < 35 ? 'aggressive' : userData?.age < 50 ? 'moderate' : 'conservative';
      const responses = [
        `Smart thinking about investments! 📈 For someone your age (${userData?.age}), I recommend a ${riskProfile} approach: ${riskProfile === 'aggressive' ? '70-80% equity, 20-30% debt' : riskProfile === 'moderate' ? '60-70% equity, 30-40% debt' : '40-50% equity, 50-60% debt'}. Your ₹${userData?.monthlySavings?.toLocaleString('en-IN')} monthly savings is a great start! Consider increasing it by 10% annually.`,
        `Investment strategy is key! 💡 At ${userData?.age} years old, you can afford to be ${riskProfile === 'aggressive' ? 'more aggressive' : riskProfile === 'moderate' ? 'balanced' : 'more conservative'}. I suggest: 1) SIP in equity funds, 2) PPF/EPF for tax benefits, 3) NPS for additional tax savings, 4) Gold for diversification. Your current ₹${userData?.monthlySavings?.toLocaleString('en-IN')} can be optimized!`,
        `Excellent investment mindset! 🚀 With ${userData?.yearsToRetirement} years to retirement, you have time for wealth creation. For your age (${userData?.age}), focus on: 60% equity funds, 25% debt funds, 10% PPF/EPF, 5% gold. Your ₹${userData?.monthlySavings?.toLocaleString('en-IN')} monthly investment is solid - consider increasing it annually!`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Corpus and money questions with calculations
    if (message.includes('corpus') || message.includes('amount') || message.includes('money') || message.includes('target') || message.includes('goal')) {
      const gap = Math.abs((userData?.projectedCorpus || 0) - (userData?.targetCorpus || 0));
      const status = (userData?.projectedCorpus || 0) >= (userData?.targetCorpus || 0) ? 'surplus' : 'shortfall';
      const responses = [
        `Let's talk numbers! 💰 Your target corpus of ₹${userData?.targetCorpus?.toLocaleString('en-IN')} is ${status === 'surplus' ? 'exceeded by' : 'short by'} ₹${gap.toLocaleString('en-IN')}. Your projected corpus is ₹${userData?.projectedCorpus?.toLocaleString('en-IN')}. ${status === 'shortfall' ? 'Don\'t worry! We can bridge this gap by increasing monthly savings or extending retirement age.' : 'Fantastic! You\'re exceeding your goals! 🎉'}`,
        `Great question about your financial goals! 🎯 You're targeting ₹${userData?.targetCorpus?.toLocaleString('en-IN')} but currently projected to reach ₹${userData?.projectedCorpus?.toLocaleString('en-IN')}. That's a ${status === 'shortfall' ? 'shortfall' : 'surplus'} of ₹${gap.toLocaleString('en-IN')}. ${status === 'shortfall' ? 'Let me help you create a plan to bridge this gap!' : 'Excellent work! You\'re ahead of your goals!'}`,
        `Money matters! 💵 Your retirement goal of ₹${userData?.targetCorpus?.toLocaleString('en-IN')} is ${status === 'shortfall' ? 'challenging but achievable' : 'well within reach'}. Current projection: ₹${userData?.projectedCorpus?.toLocaleString('en-IN')} (${status === 'shortfall' ? 'short by' : 'exceeding by'} ₹${gap.toLocaleString('en-IN')}). ${status === 'shortfall' ? 'I can help you optimize your strategy!' : 'You\'re doing amazing! 🚀'}`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Tax optimization questions
    if (message.includes('tax') || message.includes('saving') || message.includes('deduction') || message.includes('80c')) {
      const responses = [
        `Tax optimization is crucial! 🧾 Maximize your savings with: EPF (₹1.5L), PPF (₹1.5L), NPS (₹50K), ELSS (₹1.5L). That's ₹5L in tax deductions! Your ₹${userData?.monthlySavings?.toLocaleString('en-IN')} monthly savings can be structured for maximum tax benefits. Want me to create a tax-efficient investment plan?`,
        `Smart tax planning! 💡 You can save up to ₹5L annually through: EPF ₹1.5L, PPF ₹1.5L, NPS ₹50K, ELSS ₹1.5L. Your current ₹${userData?.monthlySavings?.toLocaleString('en-IN')} monthly investment is perfect for this strategy. I can help you optimize your tax savings!`,
        `Tax efficiency matters! 📊 With ₹${userData?.monthlySavings?.toLocaleString('en-IN')} monthly savings, you can maximize deductions: EPF ₹1.5L, PPF ₹1.5L, NPS ₹50K, ELSS ₹1.5L = ₹5L total savings! This strategy will significantly reduce your tax burden while building wealth.`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Risk and safety questions
    if (message.includes('risk') || message.includes('safe') || message.includes('secure') || message.includes('volatile')) {
      const riskProfile = userData?.age < 35 ? 'aggressive' : userData?.age < 50 ? 'moderate' : 'conservative';
      const responses = [
        `Risk management is key! ⚖️ At ${userData?.age} years old, you can take a ${riskProfile} approach. ${riskProfile === 'aggressive' ? 'Focus on equity-heavy portfolios (70-80% equity) for long-term growth.' : riskProfile === 'moderate' ? 'Balance between equity and debt (60-70% equity) for steady growth.' : 'Gradually shift to debt-heavy portfolios (40-50% equity) for stability.'} Review and rebalance annually!`,
        `Great question about risk! 🛡️ Your age (${userData?.age}) allows for a ${riskProfile} investment strategy. ${riskProfile === 'aggressive' ? 'You can handle market volatility for higher returns.' : riskProfile === 'moderate' ? 'You need a balanced approach for steady growth.' : 'You should prioritize capital preservation.'} I can help you create a risk-appropriate portfolio!`,
        `Risk assessment is crucial! 📊 For someone your age (${userData?.age}), a ${riskProfile} strategy works best. ${riskProfile === 'aggressive' ? 'Equity-heavy portfolios (70-80%) will maximize long-term returns.' : riskProfile === 'moderate' ? 'Balanced portfolios (60-70% equity) provide steady growth.' : 'Conservative portfolios (40-50% equity) protect your capital.'} Let me help you build the right mix!`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Readiness score questions
    if (message.includes('readiness') || message.includes('score') || message.includes('how am i doing') || message.includes('progress')) {
      const score = userData?.readinessScore || 0;
      const responses = [
        `Your retirement readiness score is ${score.toFixed(1)}%! 📊 ${score >= 100 ? 'Outstanding! You\'re fully prepared for retirement! 🎉' : score >= 80 ? 'Excellent! You\'re well on track with minor adjustments needed! 👍' : score >= 60 ? 'Good progress! You need to increase savings or adjust your timeline! 📈' : 'Room for improvement! Consider increasing monthly savings or extending retirement age! 🚀'} This score reflects your current savings, target corpus, and time horizon.`,
        `Let's check your progress! 📈 Your readiness score of ${score.toFixed(1)}% shows ${score >= 80 ? 'you\'re doing great!' : score >= 60 ? 'you\'re on the right track!' : 'there\'s work to be done!'} ${score >= 80 ? 'Keep up the excellent work!' : score >= 60 ? 'Small adjustments will get you there!' : 'Don\'t worry - we can improve this together!'} Would you like specific recommendations to boost your score?`,
        `Great question about your progress! 🎯 Your ${score.toFixed(1)}% readiness score indicates ${score >= 80 ? 'strong preparation for retirement!' : score >= 60 ? 'good progress with room for improvement!' : 'significant opportunities for enhancement!'} ${score >= 80 ? 'You\'re ahead of the game!' : score >= 60 ? 'You\'re making good progress!' : 'We can definitely improve this!'} I can help you create a plan to reach 100%!`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Strategy and improvement questions
    if (message.includes('strategy') || message.includes('recommend') || message.includes('improve') || message.includes('advice') || message.includes('suggest')) {
      const responses = [
        `Here's your personalized strategy! 🎯 1) Increase monthly savings by 10% annually, 2) Maximize tax-saving investments (EPF, PPF, NPS), 3) Maintain 60-70% equity allocation, 4) Review portfolio annually, 5) Consider additional income sources. Your current ₹${userData?.monthlySavings?.toLocaleString('en-IN')} monthly savings is a great foundation!`,
        `Smart thinking about strategy! 💡 Based on your profile, focus on: 1) Systematic investment plans (SIPs), 2) Tax optimization through EPF/PPF/NPS, 3) Diversified portfolio (equity + debt), 4) Regular portfolio reviews, 5) Emergency fund maintenance. Your ₹${userData?.monthlySavings?.toLocaleString('en-IN')} monthly investment is perfect for this approach!`,
        `Excellent strategic thinking! 🚀 Your action plan: 1) Boost monthly savings by 10% yearly, 2) Maximize tax benefits (₹5L total), 3) Maintain balanced portfolio (60-70% equity), 4) Annual portfolio rebalancing, 5) Explore additional income streams. With ₹${userData?.monthlySavings?.toLocaleString('en-IN')} monthly savings, you're on the right track!`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Age and timeline questions
    if (message.includes('age') || message.includes('young') || message.includes('old') || message.includes('time') || message.includes('timeline')) {
      const responses = [
        `Age is just a number in retirement planning! 🎂 At ${userData?.age} years old, you have ${userData?.yearsToRetirement} years until retirement. This is ${userData?.yearsToRetirement >= 25 ? 'excellent time for wealth creation!' : userData?.yearsToRetirement >= 15 ? 'good time to build wealth!' : 'limited time, but still achievable!'} ${userData?.yearsToRetirement >= 25 ? 'You can take calculated risks and benefit from compounding!' : 'Focus on maximizing savings and consider extending your working years!'}`,
        `Great question about timing! ⏰ Your age (${userData?.age}) gives you ${userData?.yearsToRetirement} years to build wealth. This is ${userData?.yearsToRetirement >= 25 ? 'perfect for aggressive growth strategies!' : userData?.yearsToRetirement >= 15 ? 'good for balanced growth approaches!' : 'challenging but manageable with the right strategy!'} ${userData?.yearsToRetirement >= 25 ? 'Time is your biggest advantage!' : 'We need to optimize every year!'}`,
        `Timing matters in retirement planning! 📅 At ${userData?.age} years old, you have ${userData?.yearsToRetirement} years until retirement. This is ${userData?.yearsToRetirement >= 25 ? 'an excellent timeframe for wealth building!' : userData?.yearsToRetirement >= 15 ? 'a good timeframe with focused effort!' : 'a tight timeframe requiring aggressive action!'} ${userData?.yearsToRetirement >= 25 ? 'You can afford to be patient and strategic!' : 'We need to be aggressive and efficient!'}`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Default responses with more variety and personality
    const defaultResponses = [
      `That's a great question! 🤔 Based on your retirement profile (${userData?.age} years old, targeting ₹${userData?.targetCorpus?.toLocaleString('en-IN')} corpus), I'd recommend focusing on consistent SIP investments and maximizing tax benefits. What specific aspect would you like to explore further?`,
      `Interesting point! 💭 For retirement planning, the key is starting early and staying disciplined. Your current plan with ₹${userData?.monthlySavings?.toLocaleString('en-IN')} monthly savings looks solid - would you like me to suggest some optimizations?`,
      `I understand your concern! 😊 Retirement planning can seem complex, but the basics are simple: save regularly, invest wisely, and review annually. With ${userData?.yearsToRetirement} years to go, you have time to build wealth. What specific area would you like to dive into?`,
      `That's a thoughtful question! 🧠 Based on your situation (${userData?.age} years old, ₹${userData?.monthlySavings?.toLocaleString('en-IN')} monthly savings), you're in a good position. The key is consistency and optimization. What would you like to focus on improving?`,
      `Great thinking! 💡 Retirement planning is about making smart choices consistently. Your current setup shows you're serious about your future. With ${userData?.yearsToRetirement} years until retirement, we can definitely optimize your strategy. What's your biggest concern?`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };
  
  // Helper function to identify conversation topics
  const getTopicFromMessage = (message) => {
    if (message.includes('retirement') || message.includes('retire')) return 'retirement';
    if (message.includes('invest') || message.includes('investment')) return 'investment';
    if (message.includes('tax') || message.includes('saving')) return 'tax';
    if (message.includes('risk') || message.includes('safe')) return 'risk';
    if (message.includes('score') || message.includes('readiness')) return 'score';
    return 'general';
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(input);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border-4 border-orange-500 z-50 flex flex-col" style={{ backgroundColor: '#fef7ed' }}>
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">FinAI Assistant</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && (
                  <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.type === 'user' && (
                  <User className="w-4 h-4 mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setInput("How is my retirement readiness score?")}
            className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-2 rounded-full transition-colors font-medium"
          >
            📊 Readiness Score
          </button>
          <button
            onClick={() => setInput("What investment strategy should I follow?")}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-full transition-colors font-medium"
          >
            💰 Investment Tips
          </button>
          <button
            onClick={() => setInput("How can I improve my retirement plan?")}
            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-full transition-colors font-medium"
          >
            🚀 Improve Plan
          </button>
          <button
            onClick={() => setInput("What are the tax benefits I can get?")}
            className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-full transition-colors font-medium"
          >
            🧾 Tax Benefits
          </button>
          <button
            onClick={() => setInput("What's my risk profile?")}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-full transition-colors font-medium"
          >
            ⚖️ Risk Analysis
          </button>
          <button
            onClick={() => setInput("Help me with retirement planning")}
            className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-full transition-colors font-medium"
          >
            🎯 Get Started
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about retirement planning..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Floating chat button component
export const ChatButton = ({ onClick }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '60px',
      height: '60px',
      backgroundColor: 'red',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      zIndex: 9999,
      boxShadow: '0 4px 20px rgba(255, 0, 0, 0.5)'
    }} onClick={onClick}>
      💬
    </div>
  );
};

export default DemoChatbot;

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Navigator, useNavigate } from "react-router-dom";
// Custom color palette
const COLORS = ["#38bdf8", "#4ade80", "#fb923c", "#f87171"];

// Custom sentiment data type
type SentimentData = {
  name: string;
  value: number;
};

const LandingPage = () => {
  // Enhanced initial data with more sentiment categories
  const [data, setData] = useState<SentimentData[]>([
    { name: "Positive", value: 40 },
    { name: "Neutral", value: 30 },
    { name: "Negative", value: 20 },
    { name: "Very Negative", value: 10 },
  ]);

  // Animation for data simulation
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Simulate real-time data updates
  const updateData = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const newData = data.map(item => ({
        ...item,
        value: Math.max(5, Math.floor(item.value + (Math.random() * 20 - 10)))
      }));
      
      setData(newData);
      setIsLoading(false);
    }, 1000);
    navigate("analyzetweets")
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold">{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Tweet<span className="text-blue-500">Pulse</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-lg mx-auto">
          Real-time sentiment analysis of Twitter conversations. 
          Understand the mood behind the tweets that matter to you.
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-8">
        {/* Left side - Features */}
        <div className="w-full md:w-1/2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Discover Insights</h2>
            <ul className="space-y-3">
              {[
                "Track sentiment in real-time",
                "Analyze trending hashtags",
                "Monitor brand mentions",
                "Compare sentiment over time"
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mr-3">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          {/* CTA Button */}
          <button 
            onClick={updateData}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-lg text-white font-medium text-lg transition-all ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600 hover:shadow-lg"
            }`}
          >
            {isLoading ? "Analyzing..." : "Analyze Tweets Now"}
          </button>
        </div>

        {/* Right side - Chart */}
        <div className="w-full md:w-1/2 bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-center">Current Sentiment</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-gray-500">
        <p>© 2025 TweetPulse. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Custom color palette with more sentiment variations
const COLORS: string[] = ["#4ade80", "#f87171", "#a78bfa", "#fbbf24", "#60a5fa"];

type SentimentData = {
  name: string;
  value: number;
};

type SentimentResult = {
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage?: number;
  tweet_count?: number;
  username?: string;
};

const AnalyzeTweets = () => {
  const [username, setUsername] = useState("");
  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweetCount, setTweetCount] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Sample data for demonstration when API is not available
  const loadSampleData = () => {
    setLoading(true);
    setTimeout(() => {
      const sampleResult: SentimentResult = {
        positive_percentage: 65,
        negative_percentage: 25,
        neutral_percentage: 10,
        tweet_count: 42,
        username: username || "elonmusk"
      };
      
      handleResult(sampleResult);
      setLoading(false);
    }, 1500);
  };

  const handleResult = (result: SentimentResult) => {
    const newData = [
      { name: "Positive", value: result.positive_percentage },
      { name: "Negative", value: result.negative_percentage },
    ];
    
    // Add neutral sentiment if available
    if (result.neutral_percentage) {
      newData.push({ name: "Neutral", value: result.neutral_percentage });
    }
    
    setData(newData);
    if (result.tweet_count) {
      setTweetCount(result.tweet_count);
    }
  };

  const fetchSentiment = async () => {
    if (!username) {
      setError("Please enter a Twitter username");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/analyze_tweets?username=${username}`);
  
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
  
      const result: SentimentResult = await response.json();
  
      // Ensure positive & negative percentages are numbers
      if (typeof result.positive_percentage !== "number" || typeof result.negative_percentage !== "number") {
        throw new Error("Invalid response format");
      }
  
      handleResult(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Using sample data instead.");
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };
  

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
          <p className="font-semibold text-gray-800">{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          Tweet<span className="text-blue-500">Pulse</span>
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto">
          Analyze the sentiment of tweets in real-time and visualize the mood of Twitter users.
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">@</span>
            </div>
            <input
              type="text"
              placeholder="Enter Twitter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={fetchSentiment}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 hover:shadow-md"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </div>
            ) : (
              "Analyze"
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 text-red-500 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Result Card */}
      {data.length > 0 ? (
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6 transition-all duration-500 ease-in-out">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Sentiment Analysis for @{username}
          </h2>
          
          {tweetCount && (
            <p className="text-center text-gray-600 mb-6">
              Based on analysis of {tweetCount} recent tweets
            </p>
          )}
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={4}
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Summary</h3>
            <p className="text-gray-700">
              {data[0].value > data[1].value 
                ? `The tweets from @${username} are predominantly positive (${data[0].value}%), showing an overall optimistic tone.`
                : `The tweets from @${username} tend to be more negative (${data[1].value}%), indicating potential concerns or criticism.`
              }
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="mt-6 flex justify-center gap-4">
            <button 
              onClick={() => setUsername("")}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              New Analysis
            </button>
            <button 
              onClick={loadSampleData}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              Try Sample Data
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white bg-opacity-70 shadow-lg rounded-xl p-8 text-center">
          <p className="text-gray-500">
            Enter a Twitter username and click "Analyze" to see sentiment analysis results
          </p>
          <button
            onClick={loadSampleData}
            className="mt-4 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            Try Sample Data
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© 2025 TweetPulse. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AnalyzeTweets;
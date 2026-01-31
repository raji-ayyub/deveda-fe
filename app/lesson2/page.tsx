'use client'

import { useState, useEffect } from 'react';
import { 
  Play, Code, Cloud, Zap, CheckCircle, 
  AlertCircle, Thermometer, ArrowRight,
  RefreshCw, Eye, Wand2, MousePointerClick
} from 'lucide-react';

const WeatherAPIExplained = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [userCity, setUserCity] = useState('London');
  const [apiKey, setApiKey] = useState('xxxxx');


    const simulateWeatherAPI = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate different temperatures for different cities
    const mockTemperatures: Record<string, number> = {
      'London': 18.5,
      'Paris': 22.3,
      'Tokyo': 25.7,
      'New York': 20.1,
      'Sydney': 28.9,
      'Moscow': 12.4,
      'Dubai': 35.2,
      'Toronto': 19.8
    };
    
    const temp = mockTemperatures[userCity] || 21.5;
    
    setWeatherData({
      temp: temp.toFixed(1),
      city: userCity
    });
    
    setIsLoading(false);
  };

  const nextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const steps = [
    {
      id: 0,
      title: "What is an API?",
      icon: <Cloud className="w-8 h-8" />,
      description: "An API (Application Programming Interface) is like a waiter in a restaurant. You tell it what you want, and it brings you data from somewhere else.",
      visual: (
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">You</span>
              </div>
              <div className="text-sm font-medium text-white">You</div>
            </div>
            <ArrowRight className="w-8 h-8 text-yellow-400" />
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">API</span>
              </div>
              <div className="text-sm font-medium text-white">API Server</div>
            </div>
            <ArrowRight className="w-8 h-8 text-yellow-400" />
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">🌤️</span>
              </div>
              <div className="text-sm font-medium text-white">Weather Data</div>
            </div>
          </div>
          
          <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
            <div className="flex space-x-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-150" />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-300" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-3" />
                <span className="text-blue-200">You ask: "What's the weather in London?"</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3" />
                <span className="text-green-200">API sends request to weather service</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-400 rounded-full mr-3" />
                <span className="text-purple-200">You get back: "It's 18°C in London"</span>
              </div>
            </div>
          </div>
        </div>
      ),
      keyPoints: [
        "APIs let apps talk to each other",
        "Like ordering food from a menu",
        "You get exactly what you ask for"
      ]
    },
    {
      id: 1,
      title: "Understanding the Code",
      icon: <Code className="w-8 h-8" />,
      description: "Let's break down the simple weather fetching code line by line.",
      visual: (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex space-x-2 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          
          <div className="space-y-4">
            {/* Line 1 */}
            <div className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 font-mono text-sm">1</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-300 mb-1">The async function</div>
                <code className="text-green-400 font-mono">async function getWeather() {"{"}</code>
                <div className="text-gray-400 text-xs mt-1">This makes the function work asynchronously (without blocking)</div>
              </div>
            </div>
            
            {/* Line 2-3 */}
            <div className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 font-mono text-sm">2-3</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-purple-300 mb-1">Making the request</div>
                <code className="text-cyan-400 font-mono">const response = await fetch("...");</code>
                <div className="text-gray-400 text-xs mt-1">Sends request and waits for response (like waiting for a delivery)</div>
              </div>
            </div>
            
            {/* Line 5 */}
            <div className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 font-mono text-sm">5</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-green-300 mb-1">Getting the data</div>
                <code className="text-yellow-400 font-mono">const data = await response.json();</code>
                <div className="text-gray-400 text-xs mt-1">Converts the response to usable JavaScript data</div>
              </div>
            </div>
            
            {/* Line 7-8 */}
            <div className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 font-mono text-sm">7-8</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-yellow-300 mb-1">Displaying the data</div>
                <code className="text-pink-400 font-mono">document.getElementById(...).innerText = ...;</code>
                <div className="text-gray-400 text-xs mt-1">Puts the temperature on the webpage for users to see</div>
              </div>
            </div>
          </div>
        </div>
      ),
      keyPoints: [
        "async/await makes code wait nicely",
        "fetch() gets data from internet",
        "json() makes data readable",
        "innerText shows it to users"
      ]
    },
    {
      id: 2,
      title: "The API Request URL",
      icon: <Zap className="w-8 h-8" />,
      description: "Breaking down what each part of the URL means and does.",
      visual: (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Full API Request URL:</div>
              <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm break-all">
                <span className="text-green-400">https://api.openweathermap.org/data/2.5/weather</span>
                <span className="text-yellow-400">?</span>
                <span className="text-blue-400">q=London</span>
                <span className="text-gray-500">&</span>
                <span className="text-cyan-400">units=metric</span>
                <span className="text-gray-500">&</span>
                <span className="text-purple-400">appid=xxxxx</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800">
                <div className="text-blue-300 text-sm font-medium mb-2">Base URL</div>
                <div className="text-green-400 font-mono text-xs">api.openweathermap.org/...</div>
                <div className="text-gray-400 text-xs mt-2">The address of the weather service</div>
              </div>
              
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-800">
                <div className="text-purple-300 text-sm font-medium mb-2">Parameters</div>
                <div className="space-y-1">
                  <div className="text-blue-300 text-xs">q=London</div>
                  <div className="text-cyan-300 text-xs">units=metric</div>
                  <div className="text-pink-300 text-xs">appid=xxxxx</div>
                </div>
                <div className="text-gray-400 text-xs mt-2">Options for what data we want</div>
              </div>
              
              <div className="bg-green-900/30 p-4 rounded-lg border border-green-800">
                <div className="text-green-300 text-sm font-medium mb-2">Result</div>
                <div className="text-white text-xs">Gets weather data in Celsius for London</div>
                <div className="text-gray-400 text-xs mt-2">Temperature in °C instead of °F</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <div className="font-medium">Try Changing the City:</div>
                <input
                  type="text"
                  value={userCity}
                  onChange={(e) => setUserCity(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg mt-1 w-full max-w-xs"
                  placeholder="Enter a city name"
                />
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              The <code className="text-blue-300">q=London</code> part tells the API which city's weather you want. Try changing it to "Paris", "Tokyo", or your city!
            </div>
          </div>
        </div>
      ),
      keyPoints: [
        "Base URL = Where to get data from",
        "q= specifies which city",
        "units=metric gives Celsius",
        "appid= is your API key (like a password)"
      ]
    },
    {
      id: 3,
      title: "Handling the Response",
      icon: <Eye className="w-8 h-8" />,
      description: "What data comes back from the API and how we use it.",
      visual: (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">What the API returns (JSON format):</div>
              <div className="bg-gray-900 p-4 rounded-lg font-mono text-xs">
                <span className="text-gray-500">{"{"}</span>
                <div className="ml-4">
                  <div><span className="text-green-400">"main"</span><span className="text-gray-500">: {"{"}</span></div>
                  <div className="ml-4">
                    <div><span className="text-blue-400">"temp"</span><span className="text-gray-500">: </span><span className="text-yellow-400">18.5</span><span className="text-gray-500">,</span></div>
                    <div><span className="text-blue-400">"feels_like"</span><span className="text-gray-500">: </span><span className="text-yellow-400">17.2</span><span className="text-gray-500">,</span></div>
                    <div><span className="text-blue-400">"humidity"</span><span className="text-gray-500">: </span><span className="text-yellow-400">65</span></div>
                  </div>
                  <div><span className="text-gray-500">{"}"}</span></div>
                </div>
                <span className="text-gray-500">{"}"}</span>
              </div>
            </div>
            
            <div className="bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wand2 className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-medium">How we access the temperature:</span>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm">
                <span className="text-gray-400">// The data object has everything</span><br/>
                <span className="text-green-400">const</span> temperature = data
                <span className="text-yellow-400">.</span>main
                <span className="text-yellow-400">.</span>temp<span className="text-gray-500">;</span><br/>
                <br/>
                <span className="text-gray-400">// This gets us: </span>
                <span className="text-yellow-400">18.5</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-800">
              <div className="text-green-300 text-sm font-medium mb-2">✅ Good Way</div>
              <div className="text-xs font-mono text-green-200">
                data.main.temp
              </div>
              <div className="text-gray-400 text-xs mt-2">
                Dot notation - clean and easy to read
              </div>
            </div>
            
            <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-800">
              <div className="text-yellow-300 text-sm font-medium mb-2">⚠️ Another Way</div>
              <div className="text-xs font-mono text-yellow-200">
                data["main"]["temp"]
              </div>
              <div className="text-gray-400 text-xs mt-2">
                Bracket notation - useful for dynamic keys
              </div>
            </div>
          </div>
        </div>
      ),
      keyPoints: [
        "Data comes as JSON (JavaScript Object Notation)",
        "Use data.main.temp to get temperature",
        "JSON is like a JavaScript object",
        "Dot notation accesses nested data"
      ]
    },
    {
      id: 4,
      title: "Showing on the Webpage",
      icon: <MousePointerClick className="w-8 h-8" />,
      description: "How we take the data and put it on the webpage for users to see.",
      visual: (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">HTML Setup:</div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-cyan-300 font-mono text-sm">
                  &lt;div <span className="text-green-400">id="weather"</span>&gt;<br/>
                  &nbsp;&nbsp;<span className="text-gray-500">&lt;!-- Weather will appear here --&gt;</span><br/>
                  &lt;/div&gt;
                </div>
                <div className="text-gray-400 text-xs mt-3">
                  This creates an empty box on the webpage with the ID "weather"
                </div>
              </div>
            </div>
            
            <div className="bg-purple-900/20 rounded-lg p-4">
              <div className="text-purple-300 font-medium mb-2">JavaScript that updates it:</div>
              <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm">
                <span className="text-green-400">document</span>
                <span className="text-yellow-400">.</span>
                <span className="text-blue-400">getElementById</span>
                <span className="text-gray-500">(</span>
                <span className="text-cyan-400">"weather"</span>
                <span className="text-gray-500">)</span>
                <span className="text-yellow-400">.</span>
                <span className="text-pink-400">innerText</span>
                <span className="text-gray-500"> = </span>
                <span className="text-orange-400">"Temperature: " + data.main.temp + "°C"</span>
                <span className="text-gray-500">;</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-green-500">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Live Preview:</div>
              <div id="weather-preview" className="text-3xl font-bold text-white mb-4">
                {weatherData ? (
                  <>
                    <Thermometer className="w-8 h-8 inline-block mr-2 text-yellow-400" />
                    Temperature: {weatherData.temp}°C
                  </>
                ) : (
                  <span className="text-gray-500">Weather data will appear here...</span>
                )}
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-sm text-gray-300 mb-2">What's happening:</div>
                <div className="text-xs text-gray-400">
                  1. JavaScript finds the div with id="weather"<br/>
                  2. Sets its text to our temperature string<br/>
                  3. The webpage automatically updates to show the new text
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      keyPoints: [
        "getElementById finds elements on page",
        "innerText changes what text shows",
        "Webpage updates instantly",
        "No page refresh needed!"
      ]
    },
    {
      id: 5,
      title: "Try It Yourself!",
      icon: <Play className="w-8 h-8" />,
      description: "Now let's see the complete code in action. Click to simulate getting weather data.",
      visual: (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm">
              <span className="text-purple-400">async</span> <span className="text-green-400">function</span> <span className="text-yellow-400">getWeather</span><span className="text-gray-500">() {"{"}</span><br/>
              &nbsp;&nbsp;<span className="text-gray-400">// 1. Make the API request</span><br/>
              &nbsp;&nbsp;<span className="text-green-400">const</span> response = <span className="text-purple-400">await</span> <span className="text-blue-400">fetch</span><span className="text-gray-500">(</span><br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-400">"https://api.openweathermap.org/data/2.5/weather"</span> +<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-400">"?q={userCity}&units=metric&appid={apiKey}"</span><br/>
              &nbsp;&nbsp;<span className="text-gray-500">)</span><span className="text-gray-500">;</span><br/>
              <br/>
              &nbsp;&nbsp;<span className="text-gray-400">// 2. Get the data as JSON</span><br/>
              &nbsp;&nbsp;<span className="text-green-400">const</span> data = <span className="text-purple-400">await</span> response
              <span className="text-yellow-400">.</span>
              <span className="text-blue-400">json</span>
              <span className="text-gray-500">()</span><span className="text-gray-500">;</span><br/>
              <br/>
              &nbsp;&nbsp;<span className="text-gray-400">// 3. Show it on the webpage</span><br/>
              &nbsp;&nbsp;<span className="text-green-400">document</span>
              <span className="text-yellow-400">.</span>
              <span className="text-blue-400">getElementById</span>
              <span className="text-gray-500">(</span>
              <span className="text-cyan-400">"weather"</span>
              <span className="text-gray-500">)</span>
              <span className="text-yellow-400">.</span>
              <span className="text-pink-400">innerText</span> = <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-orange-400">"Temperature: " + data.main.temp + "°C"</span>
              <span className="text-gray-500">;</span><br/>
              <span className="text-gray-500">{"}"}</span>
            </div>
            
            <button
              onClick={() => copyToClipboard()}
              className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              {codeCopied ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Code Copied!</span>
                </>
              ) : (
                <>
                  <Code className="w-5 h-5" />
                  <span>Copy Complete Code</span>
                </>
              )}
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-700">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-white mb-2">Run the Simulation</div>
              <div className="text-gray-300">
                Click below to see how the API call works step by step
              </div>
            </div>
            
            <button
              onClick={simulateWeatherAPI}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-3 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>Getting Weather Data...</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  <span>Get Weather for {userCity}</span>
                </>
              )}
            </button>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Sending Request</div>
                  <div className="text-xs text-gray-400">fetch() sends request to weather API</div>
                </div>
                {isLoading && <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />}
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Processing Data</div>
                  <div className="text-xs text-gray-400">Converting response to JSON format</div>
                </div>
                {isLoading && <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />}
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Displaying Result</div>
                  <div className="text-xs text-gray-400">Updating the webpage with temperature</div>
                </div>
                {weatherData && <div className="w-3 h-3 bg-green-500 rounded-full" />}
              </div>
            </div>
          </div>
        </div>
      ),
      keyPoints: [
        "Everything works together",
        "Click run to see it in action",
        "Copy code to use in your project",
        "Change city to see different weather"
      ]
    }
  ];

  const copyToClipboard = () => {
    const code = `async function getWeather() {
  const response = await fetch(
    "https://api.openweathermap.org/data/2.5/weather?q=${userCity}&units=metric&appid=${apiKey}"
  );

  const data = await response.json();

  document.getElementById("weather").innerText = 
    "Temperature: " + data.main.temp + "°C";
}`;
    
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-purple-900 border-b border-blue-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Cloud className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Weather API for Beginners</h1>
                <p className="text-blue-200 text-sm">Learn how to fetch and display weather data with JavaScript</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="px-3 py-1 bg-blue-800/50 rounded-full">Step {activeStep + 1} of {steps.length}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Your Progress</span>
            <span className="text-sm font-medium">
              {Math.round(((activeStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 sticky top-8">
              <h3 className="font-semibold text-lg mb-4">Lesson Steps</h3>
              <div className="space-y-2">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      activeStep === step.id
                        ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-l-4 border-cyan-500'
                        : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeStep === step.id 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                          : 'bg-gray-700'
                      }`}>
                        {step.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-gray-400">
                          Step {step.id + 1}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-3">Quick Tips:</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Click each step to jump around</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Try changing the city name</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Click buttons to interact</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Current Step */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden mb-8">
              {/* Step Header */}
              <div className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                      {steps[activeStep].icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{steps[activeStep].title}</h2>
                      <p className="text-gray-300">{steps[activeStep].description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevStep}
                      disabled={activeStep === 0}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-30 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={activeStep === steps.length - 1}
                      className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 rounded-lg disabled:opacity-30 transition-opacity"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Visual */}
                  <div className="lg:col-span-2">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-cyan-400" />
                      Visual Explanation
                    </h3>
                    <div className="bg-gray-900/50 rounded-xl p-4">
                      {steps[activeStep].visual}
                    </div>
                  </div>

                  {/* Key Points */}
                  <div className="lg:col-span-1">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                      Key Things to Know
                    </h3>
                    <div className="space-y-3">
                      {steps[activeStep].keyPoints.map((point, index) => (
                        <div 
                          key={index}
                          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-blue-400 text-sm">{index + 1}</span>
                            </div>
                            <div className="text-sm">{point}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Simple Summary */}
                    <div className="mt-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-4 border border-blue-800">
                      <div className="text-sm text-blue-300 font-medium mb-2">Simple Summary:</div>
                      {activeStep === 0 && (
                        <p className="text-sm">APIs are like waiters that bring you data from other services.</p>
                      )}
                      {activeStep === 1 && (
                        <p className="text-sm">async/await lets your code wait nicely for data to arrive.</p>
                      )}
                      {activeStep === 2 && (
                        <p className="text-sm">The URL tells the API exactly what data you want and where.</p>
                      )}
                      {activeStep === 3 && (
                        <p className="text-sm">The API sends back JSON data that we can easily use in JavaScript.</p>
                      )}
                      {activeStep === 4 && (
                        <p className="text-sm">We use getElementById to find where on the page to show the data.</p>
                      )}
                      {activeStep === 5 && (
                        <p className="text-sm">Put it all together and you can get live weather data on your website!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step Navigation */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={prevStep}
                      disabled={activeStep === 0}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium disabled:opacity-30 transition-colors flex items-center space-x-2"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>Previous Step</span>
                    </button>
                    
                    <div className="flex space-x-1">
                      {steps.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveStep(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            activeStep === index
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 w-4'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={nextStep}
                      disabled={activeStep === steps.length - 1}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 rounded-lg font-medium disabled:opacity-30 transition-opacity flex items-center space-x-2"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Takeaway Card */}
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-6 border border-green-800">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-300 mb-2">What You've Learned</h3>
                  <p className="text-gray-300">
                    You now understand how to use JavaScript to ask a weather service for data, 
                    get the response, and show it on a webpage. This same pattern works for 
                    hundreds of other APIs too - from news articles to sports scores!
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-800/50 text-green-300 rounded-full text-sm">async/await</span>
                    <span className="px-3 py-1 bg-blue-800/50 text-blue-300 rounded-full text-sm">fetch() API</span>
                    <span className="px-3 py-1 bg-purple-800/50 text-purple-300 rounded-full text-sm">JSON Data</span>
                    <span className="px-3 py-1 bg-yellow-800/50 text-yellow-300 rounded-full text-sm">DOM Manipulation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherAPIExplained;
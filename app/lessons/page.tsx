'use client'

import { useState, useEffect, useRef, ReactNode } from 'react';
import { 
  Play, Code, Cloud, Zap, Database, 
  ChevronLeft, ChevronRight, Copy, Check,
  Wifi, WifiOff, Loader, RefreshCw,
  Globe, Thermometer, Wind, Droplets,
  Cat, Sparkles, LucideIcon
} from 'lucide-react';

// Define types
interface Post {
  id: number;
  title: string;
  body: string;
}

interface Weather {
  temp: number;
  feels_like: number;
  description: string;
  humidity: number;
  wind_speed: number;
  clouds: number;
}

interface CatImage {
  id: number;
  url: string;
}

interface ApiData {
  posts: Post[];
  weather: Weather | null;
  cats: CatImage[];
  loading: {
    posts: boolean;
    weather: boolean;
    cats: boolean;
  };
}

interface SlideContent {
  description: string;
  code?: string;
  visual: ReactNode;
}

interface Slide {
  id: number;
  title: string;
  color: string;
  icon: ReactNode;
  content: SlideContent;
}

interface RecentActivity {
  id: number;
  action: string;
  title: string;
  time: string;
  score?: number;
  icon: LucideIcon;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  difficulty: string;
  duration: number;
  totalLessons: number;
  instructor?: string;
  slug: string;
}

const AsynchronousAPILesson = () => {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [apiData, setApiData] = useState<ApiData>({
    posts: [],
    weather: null,
    cats: [],
    loading: {
      posts: false,
      weather: false,
      cats: false
    }
  });
  const [copiedCode, setCopiedCode] = useState<string>('');
  const [simulateLatency, setSimulateLatency] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const slides: Slide[] = [
    {
      id: 0,
      title: "Understanding Async APIs",
      color: "from-blue-500 to-cyan-500",
      icon: <Wifi className="w-12 h-12" />,
      content: {
        description: "APIs work asynchronously, meaning your code doesn't wait for the response. It continues executing while waiting for the API to respond.",
        visual: (
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-medium">Your Code</div>
              </div>
              <div className="relative">
                <div className="w-32 h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400" />
                <div className="absolute -top-2 left-0 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-medium">External API</div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex space-x-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  <code className="text-green-400">1. Send API Request</code>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse delay-100" />
                  <code className="text-yellow-400">2. Continue with other code</code>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse delay-200" />
                  <code className="text-cyan-400">3. Process response when received</code>
                </div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 1,
      title: "Making API Calls with Fetch",
      color: "from-purple-500 to-pink-500",
      icon: <Code className="w-12 h-12" />,
      content: {
        description: "The Fetch API is built into modern browsers and provides a promise-based way to make HTTP requests.",
        code: `// Basic fetch structure
fetch('https://api.example.com/data')
  .then(response => response.json())  // Parse JSON
  .then(data => {
    // Handle successful response
    console.log(data);
    updateUI(data);
  })
  .catch(error => {
    // Handle errors
    console.error('Error:', error);
  });`,
        visual: (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg">
              <div>
                <div className="text-sm text-gray-400">Request Method</div>
                <div className="text-green-400 font-mono">GET</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Status</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  <span className="text-green-400">Pending...</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {['Request Sent', 'Processing...', 'Response Received'].map((step, index) => (
                <div key={step} className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    index === 0 ? 'bg-green-500' : 
                    index === 1 ? 'bg-yellow-500' : 'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-xs text-gray-400">{step}</div>
                </div>
              ))}
            </div>
          </div>
        )
      }
    },
    {
      id: 2,
      title: "JSONPlaceholder Example",
      color: "from-emerald-500 to-teal-500",
      icon: <Database className="w-12 h-12" />,
      content: {
        description: "JSONPlaceholder provides fake REST API data for testing. Let's fetch some posts and display them.",
        code: `// Fetch posts from JSONPlaceholder
async function fetchPosts() {
  try {
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/posts?_limit=4'
    );
    const posts = await response.json();
    displayPosts(posts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }
}

// Display posts in the DOM
function displayPosts(posts) {
  const container = document.getElementById('posts-container');
  container.innerHTML = posts.map(post => \`
    <div class="post-card">
      <h3>\${post.title}</h3>
      <p>\${post.body}</p>
    </div>
  \`).join('');
}`,
        visual: (
          <div className="space-y-4">
            {apiData.posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apiData.posts.slice(0, 4).map((post, index) => (
                  <div 
                    key={post.id}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border-l-4 border-emerald-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h4 className="font-semibold text-white mb-2 line-clamp-1">
                      {post.title}
                    </h4>
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {post.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No posts loaded yet</p>
              </div>
            )}
            
            <button
              onClick={() => fetchJsonPlaceholder()}
              disabled={apiData.loading.posts}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {apiData.loading.posts ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Fetching Posts...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Fetch Sample Posts</span>
                </>
              )}
            </button>
          </div>
        )
      }
    },
    {
      id: 3,
      title: "Weather API Example",
      color: "from-cyan-500 to-blue-500",
      icon: <Cloud className="w-12 h-12" />,
      content: {
        description: "Fetch real-time weather data and update the DOM dynamically. This demonstrates handling JSON responses.",
        code: `// Fetch weather data (using OpenWeatherMap structure)
async function fetchWeather(city = 'London') {
  const apiKey = 'YOUR_API_KEY';
  const url = \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${apiKey}&units=metric\`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Update DOM with weather data
    document.getElementById('temperature').textContent = 
      \`\${Math.round(data.main.temp)}°C\`;
    document.getElementById('weather-desc').textContent = 
      data.weather[0].description;
    document.getElementById('humidity').textContent = 
      \`\${data.main.humidity}%\`;
    document.getElementById('wind-speed').textContent = 
      \`\${data.wind.speed} m/s\`;
  } catch (error) {
    console.error('Weather fetch error:', error);
  }
}`,
        visual: (
          <div className="space-y-4">
            {apiData.weather ? (
              <div className="bg-gradient-to-br from-cyan-900 to-blue-900 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">London</h3>
                    <p className="text-cyan-200">United Kingdom</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">
                      {apiData.weather.temp}°C
                    </div>
                    <p className="text-cyan-200 capitalize">
                      {apiData.weather.description}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Thermometer className="w-6 h-6 text-cyan-300" />
                    <div>
                      <div className="text-sm text-cyan-200">Feels Like</div>
                      <div className="font-semibold">{apiData.weather.feels_like}°C</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-6 h-6 text-cyan-300" />
                    <div>
                      <div className="text-sm text-cyan-200">Humidity</div>
                      <div className="font-semibold">{apiData.weather.humidity}%</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Wind className="w-6 h-6 text-cyan-300" />
                    <div>
                      <div className="text-sm text-cyan-200">Wind Speed</div>
                      <div className="font-semibold">{apiData.weather.wind_speed} m/s</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Cloud className="w-6 h-6 text-cyan-300" />
                    <div>
                      <div className="text-sm text-cyan-200">Clouds</div>
                      <div className="font-semibold">{apiData.weather.clouds}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center">
                <Cloud className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No weather data loaded</p>
                <p className="text-sm text-gray-500 mt-2">Click below to simulate weather data</p>
              </div>
            )}
            
            <button
              onClick={() => fetchWeatherData()}
              disabled={apiData.loading.weather}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {apiData.loading.weather ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Fetching Weather...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-5 h-5" />
                  <span>Get Weather Data</span>
                </>
              )}
            </button>
          </div>
        )
      }
    },
    {
      id: 4,
      title: "The Cat API Example",
      color: "from-orange-500 to-red-500",
      icon: <Cat className="w-12 h-12" />,
      content: {
        description: "Load random cat images from The Cat API. This shows how to handle image data and error cases.",
        code: `// Fetch random cat images
async function fetchCatImages(limit = 3) {
  try {
    const response = await fetch(
      \`https://api.thecatapi.com/v1/images/search?limit=\${limit}\`
    );
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const cats = await response.json();
    displayCatImages(cats);
  } catch (error) {
    showError('Failed to fetch cats: ' + error.message);
  }
}

// Display images in a gallery
function displayCatImages(cats) {
  const gallery = document.getElementById('cat-gallery');
  gallery.innerHTML = cats.map(cat => \`
    <img 
      src="\${cat.url}" 
      alt="Cute cat"
      class="cat-image rounded-lg shadow-lg"
      onerror="this.src='/fallback-cat.jpg'"
    >
  \`).join('');
}`,
        visual: (
          <div className="space-y-4">
            {apiData.cats.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {apiData.cats.map((cat, index) => (
                  <div 
                    key={cat.id}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden relative group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <Cat className="w-12 h-12 text-white" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Cat #{index + 1}</span>
                        <span className="text-xs text-gray-400">800x600</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center">
                <Cat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No cats loaded yet</p>
                <p className="text-sm text-gray-500 mt-2">Click below to fetch random cats</p>
              </div>
            )}
            
            <button
              onClick={() => fetchCatImages()}
              disabled={apiData.loading.cats}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {apiData.loading.cats ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Loading Cats...</span>
                </>
              ) : (
                <>
                  <Cat className="w-5 h-5" />
                  <span>Fetch Random Cats</span>
                </>
              )}
            </button>
          </div>
        )
      }
    },
    {
      id: 5,
      title: "Error Handling & Best Practices",
      color: "from-rose-500 to-pink-500",
      icon: <Zap className="w-12 h-12" />,
      content: {
        description: "Learn how to handle errors, manage loading states, and follow best practices for API calls.",
        code: `// Complete API call with error handling
async function makeAPICall(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! Status: \${response.status}\`);
    }
    
    const data = await response.json();
    return { success: true, data };
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    
    return { success: false, error: error.message };
  }
}

// Usage example
async function fetchDataSafely() {
  const result = await makeAPICall('https://api.example.com/data');
  
  if (result.success) {
    console.log('Data:', result.data);
  } else {
    console.error('Error:', result.error);
    // Show user-friendly error message
  }
}`,
        visual: (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Always Check Response Status</h4>
                    <p className="text-gray-400 text-sm">Use response.ok or check status codes</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Loader className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Show Loading States</h4>
                    <p className="text-gray-400 text-sm">Provide feedback while waiting</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <WifiOff className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Handle Errors Gracefully</h4>
                    <p className="text-gray-400 text-sm">Network errors, timeouts, invalid data</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Implement Retry Logic</h4>
                    <p className="text-gray-400 text-sm">For transient failures</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="simulateLatency"
                  checked={simulateLatency}
                  onChange={(e) => setSimulateLatency(e.target.checked)}
                  className="rounded text-blue-500"
                />
                <label htmlFor="simulateLatency" className="text-sm text-gray-300">
                  Simulate network latency
                </label>
              </div>
              <button
                onClick={() => simulateError()}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
              >
                Simulate Error
              </button>
            </div>
          </div>
        )
      }
    }
  ];

  const simulateDelay = (): Promise<void> => {
    return simulateLatency 
      ? new Promise(resolve => setTimeout(resolve, 1500))
      : Promise.resolve();
  };

  const fetchJsonPlaceholder = async (): Promise<void> => {
    setApiData(prev => ({ ...prev, loading: { ...prev.loading, posts: true } }));
    setErrorState(null);
    
    try {
      await simulateDelay();
      
      const mockPosts: Post[] = [
        { id: 1, title: "Understanding Async/Await", body: "Learn how async/await makes asynchronous code easier to read and write." },
        { id: 2, title: "Fetch API Deep Dive", body: "Explore all the features of the modern Fetch API in JavaScript." },
        { id: 3, title: "Error Handling Strategies", body: "Best practices for handling errors in asynchronous operations." },
        { id: 4, title: "API Rate Limiting", body: "Understand how to handle rate limits when making multiple API calls." }
      ];
      
      setApiData(prev => ({
        ...prev,
        posts: mockPosts,
        loading: { ...prev.loading, posts: false }
      }));
    } catch (error) {
      setErrorState("Failed to fetch posts: " + (error instanceof Error ? error.message : 'Unknown error'));
      setApiData(prev => ({
        ...prev,
        loading: { ...prev.loading, posts: false }
      }));
    }
  };

  const fetchWeatherData = async (): Promise<void> => {
    setApiData(prev => ({ ...prev, loading: { ...prev.loading, weather: true } }));
    setErrorState(null);
    
    try {
      await simulateDelay();
      
      const mockWeather: Weather = {
        temp: 18,
        feels_like: 17,
        description: "partly cloudy",
        humidity: 65,
        wind_speed: 5.2,
        clouds: 40
      };
      
      setApiData(prev => ({
        ...prev,
        weather: mockWeather,
        loading: { ...prev.loading, weather: false }
      }));
    } catch (error) {
      setErrorState("Failed to fetch weather: " + (error instanceof Error ? error.message : 'Unknown error'));
      setApiData(prev => ({
        ...prev,
        loading: { ...prev.loading, weather: false }
      }));
    }
  };

  const fetchCatImages = async (): Promise<void> => {
    setApiData(prev => ({ ...prev, loading: { ...prev.loading, cats: true } }));
    setErrorState(null);
    
    try {
      await simulateDelay();
      
      const mockCats: CatImage[] = Array(3).fill(null).map((_, i) => ({
        id: i + 1,
        url: `https://example.com/cat-${i + 1}.jpg`
      }));
      
      setApiData(prev => ({
        ...prev,
        cats: mockCats,
        loading: { ...prev.loading, cats: false }
      }));
    } catch (error) {
      setErrorState("Failed to fetch cat images: " + (error instanceof Error ? error.message : 'Unknown error'));
      setApiData(prev => ({
        ...prev,
        loading: { ...prev.loading, cats: false }
      }));
    }
  };

  const simulateError = (): void => {
    setErrorState("Simulated network error: Failed to connect to API server. Please check your connection and try again.");
  };

  const copyToClipboard = (code: string | undefined, slideId: number): void => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(slideId.toString());
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const nextSlide = (): void => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (): void => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    fetchJsonPlaceholder();
  }, []);

  // Helper functions for the original homepage (if needed elsewhere)
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'web-dev': 'bg-blue-100 text-blue-800',
      'data-science': 'bg-purple-100 text-purple-800',
      'mobile': 'bg-green-100 text-green-800',
      'design': 'bg-pink-100 text-pink-800',
      'business': 'bg-yellow-100 text-yellow-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors: Record<string, string> = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[difficulty.toLowerCase()] || colors.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Asynchronous API Calls</h1>
                <p className="text-gray-400 text-sm">Mastering API calls with JavaScript</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-300">Online</span>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Practice Exercises
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson Overview */}
        <div className="mb-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Learn Async API Calls</h2>
              <p className="text-gray-300 max-w-3xl">
                Understand how to make asynchronous API calls in JavaScript, handle responses, 
                update the DOM dynamically, and manage errors effectively.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm">
                Interactive Lesson
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-sm">
                Real-time Examples
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">JSON Data</h3>
              <p className="text-gray-400 text-sm">
                Work with JSONPlaceholder to understand REST API patterns
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Data</h3>
              <p className="text-gray-400 text-sm">
                Simulate weather data fetching and dynamic updates
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <Cat className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Media APIs</h3>
              <p className="text-gray-400 text-sm">
                Handle image data and media APIs with The Cat API
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Slides Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 sticky top-8">
              <h3 className="font-semibold mb-4">Lesson Sections</h3>
              <div className="space-y-2">
                {slides.map((slide) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(slide.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      activeSlide === slide.id
                        ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-l-4 border-blue-500'
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${slide.color} flex items-center justify-center`}>
                        {slide.icon}
                      </div>
                      <div>
                        <div className="font-medium">{slide.title}</div>
                        <div className="text-xs text-gray-400">
                          {slide.id === 0 && "Introduction"}
                          {slide.id === 1 && "Basic Concepts"}
                          {slide.id === 2 && "Practice Example"}
                          {slide.id === 3 && "Practice Example"}
                          {slide.id === 4 && "Practice Example"}
                          {slide.id === 5 && "Best Practices"}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-medium">
                    {Math.round(((activeSlide + 1) / slides.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((activeSlide + 1) / slides.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Slide Content */}
          <div className="lg:col-span-2">
            {/* Error Display */}
            {errorState && (
              <div className="mb-6 bg-gradient-to-r from-rose-900/30 to-rose-800/20 border border-rose-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <WifiOff className="w-5 h-5 text-rose-400" />
                    <span className="font-medium text-rose-300">API Error</span>
                  </div>
                  <button
                    onClick={() => setErrorState(null)}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    ×
                  </button>
                </div>
                <p className="mt-2 text-rose-200/80 text-sm">{errorState}</p>
              </div>
            )}

            {/* Current Slide */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
              {/* Slide Header */}
              <div className={`bg-gradient-to-r ${slides[activeSlide].color} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      {slides[activeSlide].icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{slides[activeSlide].title}</h2>
                      <p className="text-white/90">Slide {activeSlide + 1} of {slides.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevSlide}
                      className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Slide Content */}
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-300 text-lg">
                    {slides[activeSlide].content.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Code Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Code Example</h3>
                      <button
                        onClick={() => copyToClipboard(slides[activeSlide].content.code, slides[activeSlide].id)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                      >
                        {copiedCode === slides[activeSlide].id.toString() ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute top-3 left-4 flex space-x-1.5">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      </div>
                      
                      <div className="bg-gray-950 rounded-xl pt-10 pb-4 px-6 overflow-x-auto">
                        <pre className="text-sm font-mono">
                          <code className="text-gray-300">
                            {slides[activeSlide].content.code || '// No code example for this slide'}
                          </code>
                        </pre>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                        <Zap className="w-4 h-4" />
                        <span>Key Points</span>
                      </div>
                      <ul className="space-y-1 text-sm text-gray-300">
                        {activeSlide === 0 && (
                          <>
                            <li>• Non-blocking operations keep your app responsive</li>
                            <li>• Use promises or async/await for async operations</li>
                            <li>• Handle both success and error cases</li>
                          </>
                        )}
                        {activeSlide === 1 && (
                          <>
                            <li>• Fetch returns a Promise</li>
                            <li>• Always check response.ok or status</li>
                            <li>• Parse JSON with response.json()</li>
                          </>
                        )}
                        {activeSlide === 2 && (
                          <>
                            <li>• Use try/catch for error handling</li>
                            <li>• Limit data with query parameters</li>
                            <li>• Update DOM after receiving data</li>
                          </>
                        )}
                        {activeSlide === 3 && (
                          <>
                            <li>• API keys usually required for real APIs</li>
                            <li>• Handle different response formats</li>
                            <li>• Update multiple DOM elements dynamically</li>
                          </>
                        )}
                        {activeSlide === 4 && (
                          <>
                            <li>• Always check response.ok</li>
                            <li>• Handle image loading errors</li>
                            <li>• Use fallback images when needed</li>
                          </>
                        )}
                        {activeSlide === 5 && (
                          <>
                            <li>• Implement timeout logic</li>
                            <li>• Show user-friendly error messages</li>
                            <li>• Consider retry mechanisms</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Visual Demo Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Live Demo</h3>
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-gray-800 min-h-[300px] flex flex-col justify-center">
                      {slides[activeSlide].content.visual}
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span>What's Happening</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {activeSlide === 0 && "The animation shows how your code continues executing while waiting for API responses."}
                        {activeSlide === 1 && "Demonstrates the flow of a fetch request from initiation to response processing."}
                        {activeSlide === 2 && "Click the button to simulate fetching blog posts from JSONPlaceholder API."}
                        {activeSlide === 3 && "Get simulated weather data and see how it would update a weather widget."}
                        {activeSlide === 4 && "Fetch random cat images (simulated) to understand media API handling."}
                        {activeSlide === 5 && "Toggle network latency and simulate errors to see proper error handling."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Slide Navigation */}
                <div className="mt-8 pt-6 border-t border-gray-700 flex items-center justify-between">
                  <button
                    onClick={prevSlide}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  
                  <div className="flex space-x-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeSlide === index
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-6'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={nextSlide}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-lg transition-opacity"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mt-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-6">API Reference Cheatsheet</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h4 className="font-semibold text-emerald-400 mb-4">JSONPlaceholder</h4>
              <div className="space-y-3">
                <code className="block text-sm bg-gray-900 p-2 rounded">GET /posts</code>
                <code className="block text-sm bg-gray-900 p-2 rounded">GET /posts/1</code>
                <code className="block text-sm bg-gray-900 p-2 rounded">GET /posts?_limit=5</code>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h4 className="font-semibold text-cyan-400 mb-4">Weather API</h4>
              <div className="space-y-3">
                <code className="block text-sm bg-gray-900 p-2 rounded">GET /weather?q=London</code>
                <code className="block text-sm bg-gray-900 p-2 rounded">GET /forecast?lat=51.5&lon=0.1</code>
                <code className="block text-sm bg-gray-900 p-2 rounded">GET /air_pollution</code>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h4 className="font-semibold text-orange-400 mb-4">The Cat API</h4>
              <div className="space-y-3">
                <code className="block text-sm bg-gray-900 p-2 rounded">GET /images/search</code>
                <code className="block text-sm bg-gray-900 p-2 rounded">GET /images/search?limit=3</code>
                <code className="block text-sm bg-gray-900 p-2 rounded">GET /breeds</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsynchronousAPILesson;
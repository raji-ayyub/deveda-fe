'use client'

import { useState } from 'react';
import {
  Grid, Box, Columns, ChevronRight, ChevronLeft, Code, Play, RefreshCw,
  Copy, CheckCircle, Zap, Target, BookOpen, HelpCircle, ArrowRight,
  Layout, Square, Circle, Maximize2
} from 'lucide-react';

const FlexboxLesson = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [containerStyle, setContainerStyle] = useState({
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexWrap: 'nowrap',
    gap: '10px'
  });
  const [itemStyles, setItemStyles] = useState([
    { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0, alignSelf: 'auto' },
    { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0, alignSelf: 'auto' },
    { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0, alignSelf: 'auto' },
    { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0, alignSelf: 'auto' },
    { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0, alignSelf: 'auto' }
  ]);
  const [copiedCode, setCopiedCode] = useState('');

  const slides = [
    {
      id: 0,
      title: "What is Flexbox?",
      color: "from-blue-500 to-cyan-500",
      icon: <Layout className="w-8 h-8" />,
      content: {
        description: "Flexbox is a CSS layout module that makes it easy to design flexible and responsive layouts. It works by distributing space and aligning items in containers.",
        code: `/* Basic Flexbox Setup */
.container {
  display: flex; /* Turns container into flex container */
}

/* All direct children become flex items */
.item {
  /* Automatic flex properties */
}`,
        visual: (
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Square className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-medium">Flex Container</div>
              </div>
              <ArrowRight className="w-8 h-8 text-blue-400" />
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 bg-white rounded"></div>
                    <div className="w-4 h-4 bg-white rounded"></div>
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                </div>
                <div className="text-sm font-medium">Flex Items</div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex space-x-2 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse delay-150" />
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-300" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                  <code className="text-blue-400">Parent element becomes a flex container</code>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2" />
                  <code className="text-cyan-400">Children automatically become flex items</code>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                  <code className="text-purple-400">Items can grow, shrink, and align automatically</code>
                </div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 1,
      title: "Flex Container Properties",
      color: "from-purple-500 to-pink-500",
      icon: <Box className="w-8 h-8" />,
      content: {
        description: "The container controls how items are arranged. Key properties include flex-direction, justify-content, align-items, and flex-wrap.",
        code: `.container {
  display: flex; /* Creates flex container */
  flex-direction: row; /* Main axis direction */
  justify-content: flex-start; /* Main axis alignment */
  align-items: stretch; /* Cross axis alignment */
  flex-wrap: nowrap; /* Single or multiple lines */
  gap: 10px; /* Space between items */
}`,
        visual: (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="mb-4">
                <h4 className="font-semibold text-white mb-2">Live Flex Container</h4>
                <div 
                  className="flex p-4 bg-gray-900/50 rounded-lg border-2 border-dashed border-blue-500/30 min-h-[200px] transition-all duration-300"
                  style={{
                    flexDirection: containerStyle.flexDirection as any,
                    justifyContent: containerStyle.justifyContent as any,
                    alignItems: containerStyle.alignItems as any,
                    flexWrap: containerStyle.flexWrap as any,
                    gap: containerStyle.gap
                  }}
                >
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div 
                      key={item}
                      className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg min-w-[60px] min-h-[60px] transition-all duration-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    flex-direction
                  </label>
                  <select 
                    value={containerStyle.flexDirection}
                    onChange={(e) => setContainerStyle(prev => ({ ...prev, flexDirection: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="row">row</option>
                    <option value="row-reverse">row-reverse</option>
                    <option value="column">column</option>
                    <option value="column-reverse">column-reverse</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    justify-content
                  </label>
                  <select 
                    value={containerStyle.justifyContent}
                    onChange={(e) => setContainerStyle(prev => ({ ...prev, justifyContent: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                    <option value="space-evenly">space-evenly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 2,
      title: "Flex Item Properties",
      color: "from-green-500 to-emerald-500",
      icon: <Square className="w-8 h-8" />,
      content: {
        description: "Individual flex items can be controlled with properties like flex-grow, flex-shrink, flex-basis, order, and align-self.",
        code: `.item {
  flex-grow: 0; /* Can item grow? 0=no, 1=yes */
  flex-shrink: 1; /* Can item shrink? 1=yes */
  flex-basis: auto; /* Initial size before growing/shrinking */
  order: 0; /* Display order (lower numbers first) */
  align-self: auto; /* Override container's align-items */
}`,
        visual: (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-2">Flex Items Demo</h4>
                <div className="flex p-4 bg-gray-900/50 rounded-lg border-2 border-dashed border-green-500/30 min-h-[200px] gap-4">
                  {itemStyles.map((itemStyle, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg min-w-[60px] min-h-[60px] transition-all duration-300"
                      style={{
                        flexGrow: itemStyle.flexGrow,
                        flexShrink: itemStyle.flexShrink,
                        flexBasis: itemStyle.flexBasis,
                        order: itemStyle.order,
                        alignSelf: itemStyle.alignSelf
                      }}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Control Item 3
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-400">flex-grow</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="3" 
                        value={itemStyles[2].flexGrow}
                        onChange={(e) => {
                          const newStyles = [...itemStyles];
                          newStyles[2].flexGrow = parseInt(e.target.value);
                          setItemStyles(newStyles);
                        }}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-300">{itemStyles[2].flexGrow}</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-400">order</span>
                      <input 
                        type="range" 
                        min="-2" 
                        max="5" 
                        value={itemStyles[2].order}
                        onChange={(e) => {
                          const newStyles = [...itemStyles];
                          newStyles[2].order = parseInt(e.target.value);
                          setItemStyles(newStyles);
                        }}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-300">{itemStyles[2].order}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 3,
      title: "Flex Direction & Axis",
      color: "from-orange-500 to-red-500",
      icon: <ArrowRight className="w-8 h-8" />,
      content: {
        description: "Understanding the main axis and cross axis is crucial. flex-direction defines the main axis direction.",
        code: `/* Main axis = primary direction */
.container {
  flex-direction: row; /* Left to right */
  flex-direction: row-reverse; /* Right to left */
  flex-direction: column; /* Top to bottom */
  flex-direction: column-reverse; /* Bottom to top */
}

/* justify-content works along MAIN axis */
/* align-items works along CROSS axis */`,
        visual: (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-red-500 mb-2"></div>
                  <div className="text-sm font-medium text-orange-400">Main Axis</div>
                  <div className="text-xs text-gray-400">justify-content</div>
                </div>
                <div className="text-center">
                  <div className="w-1 h-20 bg-gradient-to-b from-cyan-500 to-blue-500 mb-2"></div>
                  <div className="text-sm font-medium text-cyan-400">Cross Axis</div>
                  <div className="text-xs text-gray-400">align-items</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-400 mb-2">Row Layout</div>
                  <div className="flex p-4 bg-gray-900/50 rounded-lg border border-orange-500/30 h-32">
                    <div className="flex-1 border-r border-orange-500/30 flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="flex-1 border-l border-cyan-500/30 flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-cyan-400 rotate-90" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mt-2">Main: Horizontal, Cross: Vertical</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-400 mb-2">Column Layout</div>
                  <div className="flex flex-col p-4 bg-gray-900/50 rounded-lg border border-orange-500/30 h-32">
                    <div className="flex-1 border-b border-orange-500/30 flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-orange-400 rotate-90" />
                    </div>
                    <div className="flex-1 border-t border-cyan-500/30 flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mt-2">Main: Vertical, Cross: Horizontal</div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 4,
      title: "Common Layout Patterns",
      color: "from-yellow-500 to-amber-500",
      icon: <Grid className="w-8 h-8" />,
      content: {
        description: "Flexbox makes common layouts easy. Here are some practical examples you'll use every day.",
        code: `/* Centered content */
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* Navigation bar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

/* Card grid */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

/* Sidebar layout */
.layout {
  display: flex;
  height: 100vh;
}
.sidebar { flex: 0 0 250px; }
.content { flex: 1; }`,
        visual: (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Navbar Example */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Navigation Bar</h4>
                  <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg border border-yellow-500/30">
                    <div className="text-white font-bold">Logo</div>
                    <div className="flex space-x-4">
                      <div className="w-8 h-2 bg-yellow-500/50 rounded"></div>
                      <div className="w-8 h-2 bg-yellow-500/50 rounded"></div>
                      <div className="w-8 h-2 bg-yellow-500/50 rounded"></div>
                    </div>
                  </div>
                </div>
                
                {/* Centered Content */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Centered Content</h4>
                  <div className="flex justify-center items-center p-4 bg-gray-900/50 rounded-lg border border-yellow-500/30 h-24">
                    <div className="text-white font-bold">Perfectly Centered!</div>
                  </div>
                </div>
                
                {/* Card Grid */}
                <div className="space-y-3 md:col-span-2">
                  <h4 className="font-semibold text-white">Card Grid</h4>
                  <div className="flex flex-wrap gap-4 p-4 bg-gray-900/50 rounded-lg border border-yellow-500/30">
                    {[1, 2, 3, 4].map((card) => (
                      <div key={card} className="flex-1 min-w-[150px] p-4 bg-gray-800 rounded-lg">
                        <div className="w-full h-4 bg-yellow-500/30 rounded mb-2"></div>
                        <div className="w-3/4 h-3 bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 5,
      title: "Practice Challenge",
      color: "from-pink-500 to-rose-500",
      icon: <Target className="w-8 h-8" />,
      content: {
        description: "Test your understanding with this interactive challenge. Create a responsive navbar using flexbox.",
        code: `/* Complete the navbar CSS */
.navbar {
  display: ______;
  justify-content: ______;
  align-items: ______;
  padding: 1rem 2rem;
  background: #333;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: ______;
  gap: 2rem;
  list-style: none;
}`,
        visual: (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-4">Create a Responsive Navbar</h4>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        display
                      </label>
                      <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        <option value="">Select...</option>
                        <option value="flex">flex</option>
                        <option value="block">block</option>
                        <option value="grid">grid</option>
                      </select>
                    </div>
                    
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        justify-content
                      </label>
                      <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        <option value="">Select...</option>
                        <option value="space-between">space-between</option>
                        <option value="center">center</option>
                        <option value="flex-start">flex-start</option>
                      </select>
                    </div>
                    
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        align-items
                      </label>
                      <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        <option value="">Select...</option>
                        <option value="center">center</option>
                        <option value="flex-start">flex-start</option>
                        <option value="flex-end">flex-end</option>
                      </select>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-medium">
                    Check Solution
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <h4 className="font-semibold text-white mb-4">Preview</h4>
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg border border-pink-500/30">
                  <div className="text-white font-bold">MyWebsite</div>
                  <div className="flex space-x-4">
                    <div className="text-gray-300">Home</div>
                    <div className="text-gray-300">About</div>
                    <div className="text-gray-300">Contact</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    }
  ];

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode('flexbox');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const resetDemo = () => {
    setContainerStyle({
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      flexWrap: 'nowrap',
      gap: '10px'
    });
    setItemStyles([
      { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0, alignSelf: 'auto' },
      { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0, alignSelf: 'auto' },
      { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0, alignSelf: 'auto' },
      { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0, alignSelf: 'auto' },
      { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', order: 0, alignSelf: 'auto' }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-purple-900 border-b border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Layout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CSS Flexbox Masterclass</h1>
                <p className="text-blue-200 text-sm">Learn modern CSS layout with interactive examples</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
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
              <h2 className="text-3xl font-bold mb-2">Master CSS Flexbox</h2>
              <p className="text-gray-300 max-w-3xl">
                Flexbox is the modern way to create flexible, responsive layouts without floats or positioning hacks.
                Learn through interactive examples and build real layouts.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-sm">
                Interactive
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm">
                Beginner Friendly
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Container Properties</h3>
              <p className="text-gray-400 text-sm">
                Learn how to control layout direction, alignment, and wrapping
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <Square className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Item Properties</h3>
              <p className="text-gray-400 text-sm">
                Control individual items with grow, shrink, order, and alignment
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <Grid className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Real Layouts</h3>
              <p className="text-gray-400 text-sm">
                Build navbars, grids, and responsive layouts with practical examples
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Slides Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 sticky top-8">
              <h3 className="font-semibold text-lg mb-4">Lesson Sections</h3>
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
                        <div className="font-medium text-sm">{slide.title}</div>
                        <div className="text-xs text-gray-400">
                          {slide.id === 0 && "Introduction"}
                          {slide.id === 1 && "Container Basics"}
                          {slide.id === 2 && "Item Controls"}
                          {slide.id === 3 && "Axis System"}
                          {slide.id === 4 && "Layout Patterns"}
                          {slide.id === 5 && "Practice"}
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
              
              <div className="mt-6">
                <button
                  onClick={resetDemo}
                  className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset All Demos</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Slide Content */}
          <div className="lg:col-span-2">
            {/* Current Slide */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden mb-8">
              {/* Slide Header */}
              <div className={`bg-gradient-to-r ${slides[activeSlide].color} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      {slides[activeSlide].icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{slides[activeSlide].title}</h2>
                      <p className="text-white/90">Section {activeSlide + 1} of {slides.length}</p>
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
                      <h3 className="font-semibold flex items-center">
                        <Code className="w-5 h-5 mr-2" />
                        Code Example
                      </h3>
                      <button
                        onClick={() => copyToClipboard(slides[activeSlide].content.code || '')}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                      >
                        {copiedCode === 'flexbox' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
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
                            <li>• display: flex creates a flex container</li>
                            <li>• All direct children become flex items</li>
                            <li>• Works in one dimension (row OR column)</li>
                            <li>• Perfect for navigation, grids, and alignment</li>
                          </>
                        )}
                        {activeSlide === 1 && (
                          <>
                            <li>• flex-direction sets main axis direction</li>
                            <li>• justify-content aligns items on main axis</li>
                            <li>• align-items aligns items on cross axis</li>
                            <li>• flex-wrap controls single/multi-line layout</li>
                          </>
                        )}
                        {activeSlide === 2 && (
                          <>
                            <li>• flex-grow: allows item to expand</li>
                            <li>• flex-shrink: allows item to shrink</li>
                            <li>• order: controls display order</li>
                            <li>• align-self: overrides container alignment</li>
                          </>
                        )}
                        {activeSlide === 3 && (
                          <>
                            <li>• Main axis = direction set by flex-direction</li>
                            <li>• Cross axis = perpendicular to main axis</li>
                            <li>• justify-content works on main axis</li>
                            <li>• align-items works on cross axis</li>
                          </>
                        )}
                        {activeSlide === 4 && (
                          <>
                            <li>• Navigation bars use space-between</li>
                            <li>• Centering is easy with justify-content: center</li>
                            <li>• Card grids use flex-wrap and gap</li>
                            <li>• Sidebars use flex-basis or flex shorthand</li>
                          </>
                        )}
                        {activeSlide === 5 && (
                          <>
                            <li>• Navbars typically use space-between</li>
                            <li>• Set display: flex on the container</li>
                            <li>• Use align-items: center for vertical centering</li>
                            <li>• Add gap for spacing between items</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Visual Demo Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center">
                        <Play className="w-5 h-5 mr-2" />
                        Interactive Demo
                      </h3>
                      {slides[activeSlide].content.code && (
                        <button 
                          onClick={resetDemo}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Reset Demo</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="bg-gray-900/50 rounded-xl p-4">
                      {slides[activeSlide].content.visual}
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                        <HelpCircle className="w-4 h-4" />
                        <span>Try This</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {activeSlide === 0 && "Try changing container properties to see how items behave"}
                        {activeSlide === 1 && "Experiment with different flex-direction and justify-content values"}
                        {activeSlide === 2 && "Adjust flex-grow and order values to control item sizing and position"}
                        {activeSlide === 3 && "Observe how main and cross axes change with flex-direction"}
                        {activeSlide === 4 && "Build your own layout by combining different flex properties"}
                        {activeSlide === 5 && "Complete the navbar challenge by selecting the correct values"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mb-12">
              <button
                onClick={prevSlide}
                disabled={activeSlide === 0}
                className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all ${
                  activeSlide === 0
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeSlide === index
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-8'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all ${
                  activeSlide === slides.length - 1
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                <span>
                  {activeSlide === slides.length - 1 ? 'Complete Lesson' : 'Next'}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Additional Resources */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Resources & Practice
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h4 className="font-medium mb-2">Quick Reference</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <code className="text-blue-400">display: flex</code>
                      <span>Creates flex container</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="text-blue-400">flex-direction</code>
                      <span>Row/column direction</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="text-blue-400">justify-content</code>
                      <span>Main axis alignment</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="text-blue-400">align-items</code>
                      <span>Cross axis alignment</span>
                    </div>
                    <div className="flex justify-between">
                      <code className="text-blue-400">flex-wrap</code>
                      <span>Single/multi-line</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h4 className="font-medium mb-2">Common Layouts</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left p-2 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Centered Content</span>
                        <Maximize2 className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                    <button className="w-full text-left p-2 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Navigation Bar</span>
                        <Columns className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                    <button className="w-full text-left p-2 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Card Grid</span>
                        <Grid className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-2">Practice Exercise</h4>
                    <p className="text-sm text-gray-400">
                      Build a responsive sidebar layout with flexbox
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-medium">
                    Start Exercise
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-black border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Layout className="w-5 h-5" />
              </div>
              <span className="font-semibold">Flexbox Masterclass</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Interactive Learning</span>
              <span>•</span>
              <span>CSS Layout</span>
              <span>•</span>
              <span>Web Development</span>
            </div>
            
            <div className="mt-4 md:mt-0 text-sm text-gray-500">
              Complete all {slides.length} lessons to master Flexbox
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlexboxLesson;
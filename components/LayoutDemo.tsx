// components/LayoutDemo.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface Box {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  className: string;
  zIndex: number;
  parentId?: string;
}

interface ToolboxItem {
  label: string;
  width: number;
  height: number;
}

export default function LayoutDemo() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [output, setOutput] = useState<string>('');
  const [bgImage, setBgImage] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const boxStartPos = useRef({ left: 0, top: 0, width: 0, height: 0 });

  const toolboxItems: ToolboxItem[] = [
    { label: 'Small', width: 80, height: 56 },
    { label: 'Medium', width: 120, height: 72 },
    { label: 'Large', width: 180, height: 110 },
  ];

  useEffect(() => {
    // Load saved data from localStorage
    const savedBoxes = localStorage.getItem('layout_demo_boxes');
    const savedImage = localStorage.getItem('layout_demo_image');
    
    if (savedBoxes) {
      setBoxes(JSON.parse(savedBoxes));
    }
    if (savedImage) {
      setBgImage(savedImage);
    }
  }, []);

  useEffect(() => {
    // Save boxes to localStorage
    localStorage.setItem('layout_demo_boxes', JSON.stringify(boxes));
  }, [boxes]);

  const generateId = () => `box-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleDrop = (e: React.DragEvent, containerEl: HTMLDivElement) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    const template = JSON.parse(data);
    if (!containerRef.current) return;

    const rect = containerEl.getBoundingClientRect();
    const left = Math.max(0, Math.round(e.clientX - rect.left - template.width / 2));
    const top = Math.max(0, Math.round(e.clientY - rect.top - template.height / 2));

    const newBox: Box = {
      id: generateId(),
      left,
      top,
      width: template.width,
      height: template.height,
      className: '',
      zIndex: boxes.length + 1,
    };

    setBoxes([...boxes, newBox]);
  };

  const handleDragStart = (item: ToolboxItem) => (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBgImage(dataUrl);
      localStorage.setItem('layout_demo_image', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (boxId: string, type: 'move' | 'resize', e: React.MouseEvent) => {
    e.stopPropagation();
    const box = boxes.find(b => b.id === boxId);
    if (!box) return;

    setSelectedBox(boxId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    boxStartPos.current = { left: box.left, top: box.top, width: box.width, height: box.height };

    if (type === 'move') {
      setIsDragging(true);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else if (type === 'resize') {
      setIsResizing(true);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!selectedBox) return;

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    setBoxes(prev => prev.map(box => {
      if (box.id !== selectedBox) return box;

      if (isDragging) {
        return {
          ...box,
          left: Math.max(0, boxStartPos.current.left + dx),
          top: Math.max(0, boxStartPos.current.top + dy),
          zIndex: Math.max(...boxes.map(b => b.zIndex)) + 1,
        };
      } else if (isResizing) {
        return {
          ...box,
          width: Math.max(50, boxStartPos.current.width + dx),
          height: Math.max(50, boxStartPos.current.height + dy),
        };
      }
      return box;
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const removeBox = (id: string) => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  const updateClassName = (id: string, className: string) => {
    setBoxes(boxes.map(box => 
      box.id === id ? { ...box, className } : box
    ));
  };

  const generateHTML = () => {
    const html = boxes.map(box => 
      `<div class="${box.className || 'box'}" style="position: absolute; left: ${box.left}px; top: ${box.top}px; width: ${box.width}px; height: ${box.height}px; z-index: ${box.zIndex}; border: 2px dashed #ff6600; background: rgba(255, 165, 0, 0.1);"></div>`
    ).join('\n');
    
    const containerHTML = `<div class="container" style="position: relative; width: 800px; height: 600px;">\n${html}\n</div>`;
    setOutput(containerHTML);
    return containerHTML;
  };

  const clearAll = () => {
    if (confirm('Remove all boxes and clear saved layout?')) {
      setBoxes([]);
      setBgImage('');
      localStorage.removeItem('layout_demo_boxes');
      localStorage.removeItem('layout_demo_image');
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output || generateHTML());
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="flex-1 p-4 border-r border-gray-200 flex flex-col">
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <label className="relative">
            <span className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center gap-2">
              📁 Choose Image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
          
          <button
            onClick={clearAll}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            Clear Layout
          </button>
          
          <div className="flex-1"></div>
          
          <div className="text-sm text-gray-600 max-w-md">
            Instructions: Drag toolbox boxes onto the image to create groups. 
            Drag box body to move. Drag bottom-right handle to resize. 
            Click on a box to rename its class.
          </div>
        </div>

        {/* Preview Area */}
        <div
          ref={containerRef}
          className="flex-1 border-2 border-dashed border-gray-300 bg-white rounded-lg relative overflow-hidden min-h-[400px]"
          style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (containerRef.current) {
              handleDrop(e, containerRef.current);
            }
          }}
        >
          {boxes.map(box => (
            <div
              key={box.id}
              className="absolute border-2 border-dashed border-orange-500 bg-orange-50 cursor-move group"
              style={{
                left: `${box.left}px`,
                top: `${box.top}px`,
                width: `${box.width}px`,
                height: `${box.height}px`,
                zIndex: box.zIndex,
              }}
              onMouseDown={(e) => handleMouseDown(box.id, 'move', e)}
            >
              <div className="absolute -top-6 left-0 px-2 py-1 bg-black/70 text-white text-xs rounded truncate max-w-[120px]">
                {box.className || 'Unnamed'}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeBox(box.id);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-colors"
              >
                ×
              </button>
              
              <div
                className="absolute bottom-1 right-1 w-3 h-3 bg-gray-200 border border-gray-400 rounded cursor-se-resize"
                onMouseDown={(e) => handleMouseDown(box.id, 'resize', e)}
              />
              
              <input
                type="text"
                value={box.className}
                onChange={(e) => updateClassName(box.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-1 left-1 px-2 py-1 text-xs w-[calc(100%-1rem)] bg-white/90 border border-gray-300 rounded"
                placeholder="Enter class name"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-80 p-4 bg-gray-50 flex flex-col gap-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Toolbox</h3>
        
        <div className="flex flex-wrap gap-3">
          {toolboxItems.map((item, index) => (
            <div
              key={index}
              className="border-2 border-blue-600 rounded-lg bg-blue-50 flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform active:scale-95"
              style={{ width: item.width, height: item.height }}
              draggable
              onDragStart={handleDragStart(item)}
            >
              <span className="text-sm font-medium text-blue-700">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => generateHTML()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Show HTML Structure
          </button>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            Copy
          </button>
        </div>

        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify({ boxes, bgImage }, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'layout-state.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
        >
          Download JSON
        </button>

        <pre className="flex-1 bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm font-mono mt-4">
          {output || '// Click "Show HTML Structure" to generate code'}
        </pre>
      </div>
    </div>
  );
}
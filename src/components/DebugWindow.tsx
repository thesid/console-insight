import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

interface LogEntry {
  type: 'log' | 'network' | 'error' | 'performance' | 'image';
  message: string;
  timestamp: number;
  details?: any;
}

interface PerformanceMetrics {
  fps: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
  mousePosition: { x: number; y: number };
  screenSize: { width: number; height: number };
}

const DebugWindow: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: { usedJSHeapSize: 0, totalJSHeapSize: 0 },
    mousePosition: { x: 0, y: 0 },
    screenSize: { width: window.innerWidth, height: window.innerHeight },
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const performanceContainerRef = useRef<HTMLDivElement>(null);
  const lastFrameTime = useRef(performance.now());
  const frameCount = useRef(0);

  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalFetch = window.fetch;

    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' ');
      setLogs(prevLogs => [...prevLogs, { type: 'log', message, timestamp: Date.now() }]);
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' ');
      setLogs(prevLogs => [...prevLogs, { 
        type: 'error', 
        message, 
        timestamp: Date.now(),
        details: args[0] instanceof Error ? {
          name: args[0].name,
          message: args[0].message,
          stack: args[0].stack
        } : undefined
      }]);
      originalConsoleError.apply(console, args);
    };

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(input, init);
        const endTime = Date.now();
        const duration = endTime - startTime;
        const url = typeof input === 'string' ? input : input.url;
        const clone = response.clone();
        const responseData = await clone.text();
        setLogs(prevLogs => [...prevLogs, {
          type: 'network',
          message: `${url} - Status: ${response.status} - Duration: ${duration}ms`,
          timestamp: endTime,
          details: {
            url,
            method: init?.method || 'GET',
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            responseData
          }
        }]);
        return response;
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const url = typeof input === 'string' ? input : input.url;
        setLogs(prevLogs => [...prevLogs, {
          type: 'error',
          message: `${url} - Error: ${error} - Duration: ${duration}ms`,
          timestamp: endTime,
          details: { error: error instanceof Error ? error.message : String(error) }
        }]);
        throw error;
      }
    };

    const handleImageError = (event: ErrorEvent) => {
      const target = event.target as HTMLImageElement;
      setLogs(prevLogs => [...prevLogs, {
        type: 'image',
        message: `Error loading image: ${target.src}`,
        timestamp: Date.now(),
        details: {
          src: target.src,
          error: event.error?.message || 'Unknown error',
          stack: event.error?.stack
        }
      }]);
    };

    window.addEventListener('error', (event) => {
      if (event.target instanceof HTMLImageElement) {
        handleImageError(event);
      }
    }, true);

    const updatePerformanceMetrics = () => {
      const now = performance.now();
      const elapsed = now - lastFrameTime.current;
      frameCount.current++;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / elapsed);
        setPerformanceMetrics(prev => ({
          ...prev,
          fps,
          memory: {
            usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
            totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
          },
          screenSize: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        }));
        frameCount.current = 0;
        lastFrameTime.current = now;
      }

      requestAnimationFrame(updatePerformanceMetrics);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setPerformanceMetrics(prev => ({
        ...prev,
        mousePosition: { x: e.clientX, y: e.clientY },
      }));
    };

    const handleResize = () => {
      setPerformanceMetrics(prev => ({
        ...prev,
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      }));
    };

    updatePerformanceMetrics();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      window.fetch = originalFetch;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
    if (performanceContainerRef.current) {
      performanceContainerRef.current.scrollTop = performanceContainerRef.current.scrollHeight;
    }
  }, [logs, performanceMetrics]);

  const toggleExpand = (index: number) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setPosition({
        x: e.clientX - e.currentTarget.getBoundingClientRect().left,
        y: e.clientY - e.currentTarget.getBoundingClientRect().top,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - position.x;
      const newY = e.clientY - position.y;
      e.currentTarget.style.left = `${newX}px`;
      e.currentTarget.style.top = `${newY}px`;
    }
    if (isResizing) {
      const newWidth = e.clientX - e.currentTarget.getBoundingClientRect().left;
      const newHeight = e.clientY - e.currentTarget.getBoundingClientRect().top;
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const getThirdPartyLibraries = () => {
    const dependencies = (window as any).__STACKBLITZ_DEPENDENCIES__ || {};
    return Object.entries(dependencies).map(([name, version]) => `${name}@${version}`);
  };

  if (!isVisible) {
    return (
      <button
        className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full"
        onClick={() => setIsVisible(true)}
      >
        Show Debug
      </button>
    );
  }

  const windowClass = isMaximized
    ? "fixed inset-4 bg-black bg-opacity-75 text-white rounded-lg overflow-hidden flex flex-col"
    : "fixed bg-black bg-opacity-75 text-white rounded-lg overflow-hidden flex flex-col";

  const windowStyle = isMaximized
    ? {}
    : {
        width: `${size.width}px`,
        height: isMinimized ? '40px' : `${size.height}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
      };

  return (
    <div
      className={windowClass}
      style={windowStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex justify-between items-center p-2 bg-gray-800 cursor-move">
        <h3 className="text-xs font-semibold">Debug Window</h3>
        <div className="flex space-x-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-gray-400 hover:text-white">
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={() => setIsMaximized(!isMaximized)} className="text-gray-400 hover:text-white">
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      </div>
      {!isMinimized && (
        <div className="flex-1 flex overflow-hidden">
          <div ref={logContainerRef} className="flex-1 overflow-y-auto p-2 text-[10px]">
            {logs.map((log, index) => (
              <div key={index} className={`mb-1 ${
                log.type === 'network' ? 'text-blue-300' : 
                log.type === 'error' || log.type === 'image' ? 'text-red-300' : 
                'text-green-300'
              }`}>
                <div className="flex items-center">
                  <span className="mr-2">
                    {log.details && (
                      <button 
                        onClick={() => toggleExpand(index)} 
                        className="text-gray-400 hover:text-white transform transition-transform duration-200 ease-in-out"
                        style={{ transform: expandedLogs.has(index) ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        <ChevronRight size={10} />
                      </button>
                    )}
                  </span>
                  <span>[{new Date(log.timestamp).toLocaleTimeString()}] {log.message}</span>
                </div>
                {expandedLogs.has(index) && log.details && (
                  <pre className="mt-1 ml-4 text-gray-400 whitespace-pre-wrap text-[8px]">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
          <div ref={performanceContainerRef} className="w-64 overflow-y-auto p-2 text-[10px] border-l border-gray-700">
            <h4 className="font-semibold mb-2">Performance Analytics</h4>
            <div className="space-y-1">
              <div><span className="font-medium">FPS:</span> {performanceMetrics.fps}</div>
              <div><span className="font-medium">Used JS Heap:</span> {(performanceMetrics.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2)} MB</div>
              <div><span className="font-medium">Total JS Heap:</span> {(performanceMetrics.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2)} MB</div>
              <div><span className="font-medium">Mouse Position:</span> ({performanceMetrics.mousePosition.x}, {performanceMetrics.mousePosition.y})</div>
              <div><span className="font-medium">Screen Size:</span> {performanceMetrics.screenSize.width}x{performanceMetrics.screenSize.height}</div>
              <div><span className="font-medium">User Agent:</span> {navigator.userAgent}</div>
            </div>
            <h4 className="font-semibold mt-4 mb-2">Third-party Libraries</h4>
            <div className="space-y-1">
              {getThirdPartyLibraries().map((lib, index) => (
                <div key={index}>{lib}</div>
              ))}
            </div>
          </div>
        </div>
      )}
      {!isMaximized && !isMinimized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
};

export default DebugWindow;
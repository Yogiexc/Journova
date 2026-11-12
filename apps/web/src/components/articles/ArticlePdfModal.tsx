'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

interface ArticlePdfModalProps {
  title: string;
  pdfUrl?: string | null;
  doi?: string | null;
}

export function ArticlePdfModal({ title, pdfUrl, doi }: ArticlePdfModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!pdfUrl) {
    return (
      <Button
        variant="outline"
        disabled
        className="w-full sm:w-auto gap-2 opacity-60 cursor-not-allowed"
      >
        <FileText className="w-4 h-4" /> PDF Galley Pending
      </Button>
    );
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 175));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoom(100);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 shadow-xs"
      >
        <FileText className="w-4 h-4" /> Read Online
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div
            className={`flex flex-col bg-slate-900 text-white rounded-xl overflow-hidden shadow-2xl border border-slate-800 transition-all ${
              isFullscreen
                ? 'w-screen h-screen rounded-none fixed inset-0'
                : 'w-full max-w-6xl h-[90vh]'
            }`}
          >
            {/* Toolbar Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 shrink-0 gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <h3 className="text-sm font-medium truncate text-slate-200 max-w-md sm:max-w-xl">
                  {title}
                </h3>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Zoom buttons (hidden on tiny screens) */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 rounded-md p-0.5 border border-slate-700/60">
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1.5 text-slate-300">{zoom}%</span>
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    title="Reset Zoom"
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                {/* Direct download */}
                <a
                  href={pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md text-slate-200 transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                {/* Fullscreen toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>

                {/* Close modal */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Reader"
                  className="p-1.5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-md transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 bg-slate-900 overflow-auto flex items-center justify-center p-2 sm:p-4">
              <div
                style={{ width: `${zoom}%`, height: '100%', transition: 'width 0.15s ease' }}
                className="max-w-full h-full shadow-2xl rounded-md overflow-hidden bg-slate-800"
              >
                <iframe
                  src={`${pdfUrl}#toolbar=1&navpanes=0`}
                  title={title}
                  className="w-full h-full border-none rounded-md"
                />
              </div>
            </div>

            {/* Footer Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="font-mono text-[11px] truncate max-w-xs">
                {doi ? `DOI: ${doi}` : 'Journova Open Access Reader'}
              </span>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-white transition-colors text-[11px]"
              >
                <span>Open in Native Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


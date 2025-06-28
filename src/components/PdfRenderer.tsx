"use client";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  Bookmark,
  BookmarkCheck,
  Download,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  Eye,
  EyeOff,
  Highlighter,
  Palette,
  Eraser,
  Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useToast } from "./ui/use-toast";

import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect, useRef, useCallback } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

import SimpleBar from "simplebar-react";
import PdfFullScreen from "./PdfFullScreen";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  url: string;
}

interface Highlight {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: string;
  timestamp: number;
}

interface Bookmark {
  id: string;
  page: number;
  title: string;
  timestamp: number;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();

  // Core PDF state
  const [numPages, setNumPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  // Highlighting functionality
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isHighlightMode, setIsHighlightMode] = useState<boolean>(false);
  const [currentHighlightColor, setCurrentHighlightColor] = useState<string>("#ffeb3b");
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);

  // Theme and UI state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [showHighlights, setShowHighlights] = useState<boolean>(false);
  const [readingProgress, setReadingProgress] = useState<number>(0);

  const isLoading = renderedScale !== scale;
  const pageContainerRef = useRef<HTMLDivElement>(null);
  
  // Separate refs for desktop and mobile
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  // Use resize detector with separate refs
  const { width: desktopWidth } = useResizeDetector({
    targetRef: desktopContainerRef,
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 200,
  });

  const { width: mobileWidth } = useResizeDetector({
    targetRef: mobileContainerRef,
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 200,
  });

  // Highlight colors
  const highlightColors = [
    { name: "Yellow", value: "#ffeb3b", bg: "bg-yellow-300" },
    { name: "Green", value: "#4caf50", bg: "bg-green-300" },
    { name: "Blue", value: "#2196f3", bg: "bg-blue-300" },
    { name: "Pink", value: "#e91e63", bg: "bg-pink-300" },
    { name: "Orange", value: "#ff9800", bg: "bg-orange-300" },
    { name: "Purple", value: "#9c27b0", bg: "bg-purple-300" },
  ];

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= (numPages || 1)),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  // Load saved preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('pdf-theme');
      const savedBookmarks = localStorage.getItem(`pdf-bookmarks-${url}`);
      const savedHighlights = localStorage.getItem(`pdf-highlights-${url}`);
      
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      }
      
      if (savedBookmarks) {
        try {
          setBookmarks(JSON.parse(savedBookmarks));
        } catch (error) {
          console.error('Error parsing bookmarks:', error);
        }
      }

      if (savedHighlights) {
        try {
          setHighlights(JSON.parse(savedHighlights));
        } catch (error) {
          console.error('Error parsing highlights:', error);
        }
      }
    }
  }, [url]);

  // Save theme preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pdf-theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  // Save bookmarks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`pdf-bookmarks-${url}`, JSON.stringify(bookmarks));
    }
  }, [bookmarks, url]);

  // Save highlights
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`pdf-highlights-${url}`, JSON.stringify(highlights));
    }
  }, [highlights, url]);

  // Update reading progress
  useEffect(() => {
    if (numPages) {
      setReadingProgress((currentPage / numPages) * 100);
    }
  }, [currentPage, numPages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'h':
        case 'H':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setIsHighlightMode(!isHighlightMode);
          }
          break;
        case 'Escape':
          setIsHighlightMode(false);
          setIsSelecting(false);
          setSelectionStart(null);
          setSelectionEnd(null);
          break;
        case 'ArrowLeft':
          if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            setValue("page", String(currentPage - 1));
          }
          break;
        case 'ArrowRight':
          if (numPages && currentPage < numPages) {
            setCurrentPage(prev => prev + 1);
            setValue("page", String(currentPage + 1));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, numPages, setValue, isHighlightMode]);

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrentPage(Number(page));
    setValue("page", String(page));
  };

  // Handle mouse events for highlighting
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isHighlightMode || !pageContainerRef.current) return;
    
    const rect = pageContainerRef.current.getBoundingClientRect();
    setIsSelecting(true);
    setSelectionStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setSelectionEnd(null);
  }, [isHighlightMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart || !pageContainerRef.current) return;
    
    const rect = pageContainerRef.current.getBoundingClientRect();
    setSelectionEnd({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart || !selectionEnd) {
      setIsSelecting(false);
      return;
    }

    // Create highlight if selection is large enough
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);

    if (width > 10 && height > 10) {
      const newHighlight: Highlight = {
        id: `highlight-${Date.now()}-${Math.random()}`,
        pageNumber: currentPage,
        x: Math.min(selectionStart.x, selectionEnd.x),
        y: Math.min(selectionStart.y, selectionEnd.y),
        width,
        height,
        color: currentHighlightColor,
        text: "Highlighted text",
        timestamp: Date.now()
      };

      setHighlights(prev => [...prev, newHighlight]);
      toast({
        title: "Highlight Added",
        description: "Text has been highlighted successfully",
      });
    }

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd, currentPage, currentHighlightColor, toast]);

  // Delete highlight
  const deleteHighlight = (highlightId: string) => {
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
    setSelectedHighlight(null);
    toast({
      title: "Highlight Removed",
      description: "Highlight has been deleted",
    });
  };

  // Clear all highlights for current page
  const clearPageHighlights = () => {
    setHighlights(prev => prev.filter(h => h.pageNumber !== currentPage));
    toast({
      title: "Page Highlights Cleared",
      description: `All highlights on page ${currentPage} have been removed`,
    });
  };

  // Clear all highlights
  const clearAllHighlights = () => {
    setHighlights([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`pdf-highlights-${url}`);
    }
    toast({
      title: "All Highlights Cleared",
      description: "All highlights have been removed from the document",
    });
  };

  // Navigate to highlight
  const navigateToHighlight = (highlight: Highlight) => {
    if (highlight.pageNumber !== currentPage) {
      setCurrentPage(highlight.pageNumber);
      setValue("page", String(highlight.pageNumber));
    }
    setSelectedHighlight(highlight.id);
    setShowHighlights(false);
  };

  // Bookmark functionality
  const toggleBookmark = () => {
    const existingBookmark = bookmarks.find(b => b.page === currentPage);
    
    if (existingBookmark) {
      setBookmarks(prev => prev.filter(b => b.id !== existingBookmark.id));
      toast({
        title: "Bookmark Removed",
        description: `Page ${currentPage} bookmark removed`,
      });
    } else {
      const newBookmark: Bookmark = {
        id: `bookmark-${Date.now()}`,
        page: currentPage,
        title: `Page ${currentPage}`,
        timestamp: Date.now(),
      };
      setBookmarks(prev => [...prev, newBookmark]);
      toast({
        title: "Bookmark Added",
        description: `Page ${currentPage} bookmarked`,
      });
    }
  };

  const navigateToBookmark = (page: number) => {
    setCurrentPage(page);
    setValue("page", String(page));
    setShowBookmarks(false);
  };

  // Download functionality
  const handleDownload = async () => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "PDF download has begun",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the PDF",
        variant: "destructive",
      });
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PDF Document',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Document link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Could not copy link to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const isBookmarked = bookmarks.some(b => b.page === currentPage);
  const currentPageHighlights = highlights.filter(h => h.pageNumber === currentPage);

  return (
    <TooltipProvider>
      <div className={cn(
        "w-full rounded-md sm:rounded-2xl shadow-lg sm:shadow-2xl flex flex-col border transition-all duration-500 hover:shadow-xl sm:hover:shadow-3xl",
        isDarkMode 
          ? "bg-gray-900/95 border-gray-700 backdrop-blur-xl" 
          : "bg-white/95 border-zinc-100 backdrop-blur-xl"
      )}>
        {/* Reading Progress Bar - Hidden on Mobile */}
        <div className="relative w-full h-1 rounded-t-md sm:rounded-t-2xl overflow-hidden hidden sm:block">
          <Progress 
            value={readingProgress} 
            className={cn(
              "h-full transition-all duration-300",
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            )} 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" 
               style={{ width: `${readingProgress}%` }} />
        </div>

        {/* Header */}
        <div className={cn(
          "h-12 sm:h-16 w-full border-b flex items-center justify-between px-2 sm:px-4 rounded-t-md sm:rounded-t-2xl",
          isDarkMode 
            ? "bg-gray-800/90 border-gray-700" 
            : "bg-gradient-to-r from-blue-50/70 via-white/80 to-fuchsia-50/70 border-zinc-200"
        )}>
          {/* Left Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              disabled={currentPage <= 1}
              onClick={() => {
                setCurrentPage((prev) => Math.max(1, prev - 1));
                setValue("page", String(Math.max(1, currentPage - 1)));
              }}
              variant="ghost"
              size="sm"
              className="p-1.5 sm:p-2 hover:bg-blue-100 active:scale-95 transition-all duration-200"
              aria-label="previous page"
            >
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <Input
                {...register("page")}
                className={cn(
                  "w-8 sm:w-12 h-6 sm:h-8 text-xs sm:text-sm text-center font-semibold rounded-md border focus:ring-2 focus:ring-blue-400 transition-all duration-200",
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-white" 
                    : "bg-white border-zinc-200",
                  errors.page && "focus-visible:ring-red-500"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(handlePageSubmit)();
                  }
                }}
              />
              <p className={cn("text-zinc-700 text-xs sm:text-sm space-x-1", isDarkMode ? "text-gray-300" : "text-zinc-700")}>
                <span>/</span>
                <span>{numPages ?? "x"}</span>
              </p>
            </div>

            <Button
              disabled={numPages === undefined || currentPage === numPages}
              onClick={() => {
                const nextPage = Math.min(numPages || 1, currentPage + 1);
                setCurrentPage(nextPage);
                setValue("page", String(nextPage));
              }}
              variant="ghost"
              size="sm"
              className="p-1.5 sm:p-2 hover:bg-blue-100 active:scale-95 transition-all duration-200"
              aria-label="next page"
            >
              <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Center - Desktop Only Page Info */}
          <div className="hidden md:flex items-center gap-4">
            {isHighlightMode && (
              <Badge variant="outline" className="animate-pulse bg-yellow-100 text-yellow-800 border-yellow-300">
                <Highlighter className="h-3 w-3 mr-1" />
                Highlight Mode Active
              </Badge>
            )}
            
            {currentPageHighlights.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Highlighter className="h-3 w-3" />
                {currentPageHighlights.length} highlights
              </Badge>
            )}
            
            {isBookmarked && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <BookmarkCheck className="h-3 w-3" />
                Bookmarked
              </Badge>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile: Simplified Controls */}
            <div className="md:hidden flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-1 sm:gap-1.5 text-xs sm:text-sm" aria-label="zoom" variant="ghost" size="sm">
                    <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                    {Math.round(scale * 100)}%
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setScale(0.5)}>
                    50%
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(0.75)}>
                    75%
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(1)}>
                    100%
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(1.25)}>
                    125%
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(1.5)}>
                    150%
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(2)}>
                    200%
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => setRotation((prev) => prev + 90)}
                variant="ghost"
                aria-label="rotate 90 degrees"
                size="sm"
                className="p-1.5 sm:p-2"
              >
                <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <PdfFullScreen fileUrl={url} />
            </div>

            {/* Desktop: Full Controls */}
            <div className="hidden md:flex items-center gap-1">
              {/* Highlight Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsHighlightMode(!isHighlightMode)}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "transition-all duration-200",
                      isHighlightMode && "bg-yellow-100 text-yellow-600"
                    )}
                  >
                    <Highlighter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Highlight Mode (Ctrl+H)</TooltipContent>
              </Tooltip>

              {/* Color Picker */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="transition-all duration-200"
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}>
                  <div className="p-2">
                    <div className="text-xs font-medium mb-2 text-center">Highlight Colors</div>
                    <div className="grid grid-cols-3 gap-2">
                      {highlightColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setCurrentHighlightColor(color.value)}
                          className={cn(
                            "w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110",
                            currentHighlightColor === color.value 
                              ? "ring-2 ring-blue-500 scale-110" 
                              : "hover:ring-1 hover:ring-gray-300"
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Highlights Panel Toggle */}
              {highlights.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowHighlights(!showHighlights)}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "transition-all duration-200",
                        showHighlights && "bg-blue-100 text-blue-600"
                      )}
                    >
                      <Eye className="h-4 w-4" />
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {highlights.length}
                      </Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show all highlights</TooltipContent>
                </Tooltip>
              )}

              {/* Bookmark Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleBookmark}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "transition-all duration-200",
                      isBookmarked && "bg-yellow-100 text-yellow-600"
                    )}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isBookmarked ? "Remove bookmark" : "Add bookmark"}
                </TooltipContent>
              </Tooltip>

              {/* Bookmarks Panel Toggle */}
              {bookmarks.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowBookmarks(!showBookmarks)}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "transition-all duration-200",
                        showBookmarks && "bg-blue-100 text-blue-600"
                      )}
                    >
                      <Menu className="h-4 w-4" />
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {bookmarks.length}
                      </Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show bookmarks</TooltipContent>
                </Tooltip>
              )}

              {/* Zoom Controls */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="gap-1.5 hover:bg-blue-100 active:scale-95 transition-all duration-200"
                    variant="ghost"
                    size="sm"
                  >
                    {scale <= 0.75 ? (
                      <ZoomOut className="h-4 w-4" />
                    ) : scale >= 1.5 ? (
                      <ZoomIn className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {Math.round(scale * 100)}%
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}>
                  <DropdownMenuItem onSelect={() => setScale(0.5)}>
                    <ZoomOut className="mr-2 h-4 w-4" />
                    50%
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(0.75)}>75%</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(1)}>100%</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(1.25)}>125%</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(1.5)}>150%</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(2)}>
                    <ZoomIn className="mr-2 h-4 w-4" />
                    200%
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setScale(2.5)}>250%</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}>
                  <DropdownMenuItem onClick={() => setRotation((prev) => (prev + 90) % 360)}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Rotate
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={clearPageHighlights}
                    disabled={currentPageHighlights.length === 0}
                  >
                    <Eraser className="mr-2 h-4 w-4" />
                    Clear Page Highlights
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={clearAllHighlights}
                    disabled={highlights.length === 0}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear All Highlights
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                    {isDarkMode ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark Mode
                      </>
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <PdfFullScreen fileUrl={url} />
            </div>
          </div>
        </div>

        {/* Desktop: Highlights Panel */}
        {showHighlights && highlights.length > 0 && (
          <div className={cn(
            "border-b p-2 sm:p-4 animate-in slide-in-from-top-2 duration-200 max-h-32 sm:max-h-48 overflow-y-auto hidden md:block",
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className={cn("text-sm sm:text-base font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
                All Highlights ({highlights.length})
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowHighlights(false)}
                className="p-1 sm:p-2"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className={cn(
                    "flex items-center justify-between p-2 sm:p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                    selectedHighlight === highlight.id 
                      ? "border-blue-300 bg-blue-50" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 hover:bg-gray-600" 
                        : "border-gray-200 bg-white hover:bg-gray-50"
                  )}
                  onClick={() => navigateToHighlight(highlight)}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded border"
                      style={{ backgroundColor: highlight.color }}
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-medium">
                        Page {highlight.pageNumber}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {new Date(highlight.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToHighlight(highlight);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHighlight(highlight.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: Bookmarks Panel */}
        {showBookmarks && bookmarks.length > 0 && (
          <div className={cn(
            "border-b p-2 sm:p-4 animate-in slide-in-from-top-2 duration-200 hidden md:block",
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className={cn("text-sm sm:text-base font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
                Bookmarks
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowBookmarks(false)}
                className="p-1 sm:p-2"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {bookmarks.map((bookmark) => (
                <Button
                  key={bookmark.id}
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToBookmark(bookmark.page)}
                  className={cn(
                    "justify-start transition-all duration-200 hover:scale-105 text-xs sm:text-sm h-7 sm:h-8",
                    currentPage === bookmark.page && "bg-blue-100 border-blue-300"
                  )}
                >
                  <Bookmark className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                  Page {bookmark.page}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="flex-1 max-h-screen overflow-auto">
          {/* Desktop: Scrollable PDF with SimpleBar */}
          <div className="hidden md:block">
            <SimpleBar 
              autoHide={false} 
              className="max-h-[calc(100vh-10rem)]"
              style={{ 
                background: isDarkMode ? '#1f2937' : '#f9fafb'
              }}
            >
              <div ref={desktopContainerRef} className="p-4">
                <Document
                  loading={
                    <div className="flex flex-col items-center justify-center py-24">
                      <div className="relative">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <div className="absolute inset-0 h-8 w-8 bg-blue-400 rounded-full blur-lg opacity-30 animate-pulse" />
                      </div>
                      <p className={cn(
                        "mt-4 font-medium animate-pulse",
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Loading PDF...
                      </p>
                    </div>
                  }
                  onLoadError={() => {
                    toast({
                      title: "Error loading PDF",
                      description: "Please try again later",
                      variant: "destructive",
                    });
                  }}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  file={url}
                  className="max-h-full"
                >
                  {isLoading && renderedScale ? (
                    <Page
                      width={desktopWidth ? desktopWidth : 1}
                      pageNumber={currentPage}
                      scale={scale}
                      rotate={rotation}
                      key={"@" + renderedScale}
                      className="opacity-0 transition-opacity duration-500"
                    />
                  ) : null}

                  <div 
                    ref={pageContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{ cursor: isHighlightMode ? 'crosshair' : 'default' }}
                    className="relative"
                  >
                    <Page
                      className={cn(
                        "transition-all duration-500 rounded-xl shadow-lg hover:shadow-xl border mx-auto",
                        isDarkMode ? "border-gray-700" : "border-white",
                        isLoading 
                          ? "opacity-0 scale-95" 
                          : "opacity-100 scale-100 animate-in fade-in-0 zoom-in-95 duration-300"
                      )}
                      width={desktopWidth ? desktopWidth : 1}
                      pageNumber={currentPage}
                      scale={scale}
                      rotate={rotation}
                      key={"@" + scale}
                      loading={
                        <div className="flex flex-col items-center justify-center py-24">
                          <div className="relative">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <div className="absolute inset-0 h-8 w-8 bg-purple-400 rounded-full blur-lg opacity-30 animate-pulse" />
                          </div>
                          <p className={cn(
                            "mt-4 font-medium animate-pulse",
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          )}>
                            Rendering page...
                          </p>
                        </div>
                      }
                      onRenderSuccess={() => {
                        setRenderedScale(scale);
                      }}
                    />

                    {/* Selection Preview */}
                    {isSelecting && selectionStart && selectionEnd && (
                      <div
                        className="absolute border-2 border-dashed border-blue-500 rounded pointer-events-none"
                        style={{
                          left: Math.min(selectionStart.x, selectionEnd.x),
                          top: Math.min(selectionStart.y, selectionEnd.y),
                          width: Math.abs(selectionEnd.x - selectionStart.x),
                          height: Math.abs(selectionEnd.y - selectionStart.y),
                          backgroundColor: currentHighlightColor + '40',
                          zIndex: 20,
                        }}
                      />
                    )}

                    {/* Existing Highlights */}
                    {currentPageHighlights.map((highlight) => (
                      <div
                        key={highlight.id}
                        className={cn(
                          "absolute border rounded cursor-pointer transition-all duration-200 hover:scale-105",
                          selectedHighlight === highlight.id 
                            ? "border-2 border-blue-500 shadow-lg" 
                            : "border border-transparent hover:border-gray-300"
                        )}
                        style={{
                          left: highlight.x,
                          top: highlight.y,
                          width: highlight.width,
                          height: highlight.height,
                          backgroundColor: highlight.color + '60',
                          zIndex: 10,
                        }}
                        onClick={() => setSelectedHighlight(
                          selectedHighlight === highlight.id ? null : highlight.id
                        )}
                        title={`Highlight from ${new Date(highlight.timestamp).toLocaleDateString()}`}
                      />
                    ))}
                  </div>
                </Document>
              </div>
            </SimpleBar>
          </div>

          {/* Mobile:  (Non-scrollable, single page) */}
          <div className="md:hidden">
            <div 
              className="p-2"
              style={{ 
                background: isDarkMode ? '#1f2937' : '#f9fafb'
              }}
            >
              <div ref={mobileContainerRef}>
                <Document
                  loading={
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        <div className="absolute inset-0 h-6 w-6 bg-blue-400 rounded-full blur-lg opacity-30 animate-pulse" />
                      </div>
                      <p className={cn(
                        "mt-2 text-sm font-medium animate-pulse",
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Loading PDF...
                      </p>
                    </div>
                  }
                  onLoadError={() => {
                    toast({
                      title: "Error loading PDF",
                      description: "Please try again later",
                      variant: "destructive",
                    });
                  }}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  file={url}
                  className="max-h-full"
                >
                  {isLoading && renderedScale ? (
                    <Page
                      width={mobileWidth ? Math.min(mobileWidth, 300) : 300}
                      pageNumber={currentPage}
                      scale={scale}
                      rotate={rotation}
                      key={"@" + renderedScale}
                      className="opacity-0 transition-opacity duration-500"
                    />
                  ) : null}

                  <div 
                    ref={pageContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{ cursor: isHighlightMode ? 'crosshair' : 'default' }}
                    className="relative"
                  >
                    <Page
                      className={cn(
                        "transition-all duration-500 rounded-lg shadow-lg hover:shadow-xl border mx-auto",
                        isDarkMode ? "border-gray-700" : "border-white",
                        isLoading 
                          ? "opacity-0 scale-95" 
                          : "opacity-100 scale-100 animate-in fade-in-0 zoom-in-95 duration-300"
                      )}
                      width={mobileWidth ? Math.min(mobileWidth, 300) : 300}
                      pageNumber={currentPage}
                      scale={scale}
                      rotate={rotation}
                      key={"@" + scale}
                      loading={
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="relative">
                            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                            <div className="absolute inset-0 h-6 w-6 bg-purple-400 rounded-full blur-lg opacity-30 animate-pulse" />
                          </div>
                          <p className={cn(
                            "mt-2 text-sm font-medium animate-pulse",
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          )}>
                            Rendering page...
                          </p>
                        </div>
                      }
                      onRenderSuccess={() => {
                        setRenderedScale(scale);
                      }}
                    />

                    {/* Selection Preview */}
                    {isSelecting && selectionStart && selectionEnd && (
                      <div
                        className="absolute border-2 border-dashed border-blue-500 rounded pointer-events-none"
                        style={{
                          left: Math.min(selectionStart.x, selectionEnd.x),
                          top: Math.min(selectionStart.y, selectionEnd.y),
                          width: Math.abs(selectionEnd.x - selectionStart.x),
                          height: Math.abs(selectionEnd.y - selectionStart.y),
                          backgroundColor: currentHighlightColor + '40',
                          zIndex: 20,
                        }}
                      />
                    )}

                    {/* Existing Highlights */}
                    {currentPageHighlights.map((highlight) => (
                      <div
                        key={highlight.id}
                        className={cn(
                          "absolute border rounded cursor-pointer transition-all duration-200 hover:scale-105",
                          selectedHighlight === highlight.id 
                            ? "border-2 border-blue-500 shadow-lg" 
                            : "border border-transparent hover:border-gray-300"
                        )}
                        style={{
                          left: highlight.x,
                          top: highlight.y,
                          width: highlight.width,
                          height: highlight.height,
                          backgroundColor: highlight.color + '60',
                          zIndex: 10,
                        }}
                        onClick={() => setSelectedHighlight(
                          selectedHighlight === highlight.id ? null : highlight.id
                        )}
                        title={`Highlight from ${new Date(highlight.timestamp).toLocaleDateString()}`}
                      />
                    ))}
                  </div>
                </Document>
              </div>
            </div>
          </div>

          {/* Floating Highlight Button - Mobile Only */}
          {!isHighlightMode && (
            <div className="absolute bottom-2 right-2 md:hidden">
              <Button
                size="sm"
                onClick={() => setIsHighlightMode(true)}
                className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-yellow-500 hover:bg-yellow-600 h-8 w-8 p-0"
              >
                <Highlighter className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className={cn(
          "h-6 sm:h-8 px-2 sm:px-4 flex items-center justify-between text-xs border-t rounded-b-md sm:rounded-b-2xl",
          isDarkMode 
            ? "bg-gray-800 border-gray-700 text-gray-400" 
            : "bg-gray-50 border-gray-200 text-gray-500"
        )}>
          <div className="flex items-center gap-2 sm:gap-4">
            <span>Page {currentPage} of {numPages || "∞"}</span>
            <span className="hidden sm:inline">Scale: {Math.round(scale * 100)}%</span>
            {rotation > 0 && <span className="hidden sm:inline">Rotated: {rotation}°</span>}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {highlights.length > 0 && (
              <span className="text-yellow-600 font-medium text-xs">
                <span className="hidden sm:inline">{highlights.length} highlights • {currentPageHighlights.length} on this page</span>
                <span className="sm:hidden">{highlights.length}H</span>
              </span>
            )}
            {bookmarks.length > 0 && (
              <span className="hidden sm:inline">{bookmarks.length} bookmarks</span>
            )}
            {isHighlightMode && (
              <span className="text-yellow-600 font-medium text-xs">
                <span className="hidden sm:inline">Highlight Mode Active</span>
                <span className="sm:hidden">Highlight On</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              {isDarkMode ? <Moon className="h-2 w-2 sm:h-3 sm:w-3" /> : <Sun className="h-2 w-2 sm:h-3 sm:w-3" />}
              <span className="hidden sm:inline">{isDarkMode ? "Dark" : "Light"}</span>
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PdfRenderer;
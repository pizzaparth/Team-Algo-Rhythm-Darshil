import React, { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Pilcrow,
  Undo2, Redo2, Download, Plus, FileText, Trash2, Edit3,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { useEditorStore } from '../../store/';
import { getRelativeTime } from '../../lib/markdownRenderer';
import { exportElementToPDF } from '../../lib/pdfExport';

interface ToolbarButton {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  isActive?: boolean;
}

export const TextEditorPage: React.FC = () => {
  const {
    documents,
    activeDocumentId,
    sidebarOpen,
    setSidebarOpen,
    selectDocument,
    createDocument,
    deleteDocument,
    renameDocument,
    updateContent,
  } = useEditorStore();

  const editorRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const activeDocument = documents.find((d) => d.id === activeDocumentId) ?? documents[0];

  // Set editable content imperatively only when switching documents —
  // never on every keystroke, so React doesn't fight the user's cursor.
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = activeDocument?.content || '<p><br></p>';
    }
  }, [activeDocument?.id]);

  const syncContent = () => {
    if (editorRef.current && activeDocument) {
      updateContent(activeDocument.id, editorRef.current.innerHTML);
    }
  };

  const applyCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
  };

  const handleDownloadPdf = async () => {
    if (!editorRef.current || !activeDocument) return;
    setIsExporting(true);
    try {
      await exportElementToPDF(editorRef.current, activeDocument.title);
    } catch (err) {
      console.error('[TextEditorPage] PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (documents.length <= 1) return;
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteDocument(id);
    }
  };

  const handleRename = (id: string, currentTitle: string) => {
    const newTitle = window.prompt('Rename document:', currentTitle);
    if (newTitle && newTitle.trim()) {
      renameDocument(id, newTitle.trim());
    }
  };

  if (!activeDocument) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#F9F8F6] text-sm text-[#666666]">
        <span>No documents yet.</span>
        <button onClick={createDocument} className="ml-2 text-[#1A1A1A] underline">
          Create one
        </button>
      </div>
    );
  }

  const formatGroups: ToolbarButton[][] = [
    [
      { icon: <Undo2 className="w-4 h-4" />, title: 'Undo', onClick: () => applyCommand('undo') },
      { icon: <Redo2 className="w-4 h-4" />, title: 'Redo', onClick: () => applyCommand('redo') },
    ],
    [
      { icon: <Heading1 className="w-4 h-4" />, title: 'Heading 1', onClick: () => applyCommand('formatBlock', 'H1') },
      { icon: <Heading2 className="w-4 h-4" />, title: 'Heading 2', onClick: () => applyCommand('formatBlock', 'H2') },
      { icon: <Pilcrow className="w-4 h-4" />, title: 'Paragraph', onClick: () => applyCommand('formatBlock', 'P') },
    ],
    [
      { icon: <Bold className="w-4 h-4" />, title: 'Bold (Ctrl+B)', onClick: () => applyCommand('bold') },
      { icon: <Italic className="w-4 h-4" />, title: 'Italic (Ctrl+I)', onClick: () => applyCommand('italic') },
      { icon: <Underline className="w-4 h-4" />, title: 'Underline (Ctrl+U)', onClick: () => applyCommand('underline') },
      { icon: <Strikethrough className="w-4 h-4" />, title: 'Strikethrough', onClick: () => applyCommand('strikeThrough') },
    ],
    [
      { icon: <List className="w-4 h-4" />, title: 'Bullet List', onClick: () => applyCommand('insertUnorderedList') },
      { icon: <ListOrdered className="w-4 h-4" />, title: 'Numbered List', onClick: () => applyCommand('insertOrderedList') },
    ],
    [
      { icon: <AlignLeft className="w-4 h-4" />, title: 'Align Left', onClick: () => applyCommand('justifyLeft') },
      { icon: <AlignCenter className="w-4 h-4" />, title: 'Align Center', onClick: () => applyCommand('justifyCenter') },
      { icon: <AlignRight className="w-4 h-4" />, title: 'Align Right', onClick: () => applyCommand('justifyRight') },
    ],
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#F9F8F6] overflow-hidden">
      {/* Collapsible Files Sidebar */}
      <div className="flex h-full bg-[#F3F1ED] border-r border-[#E5E2DD] shrink-0">
        <div className="w-12 flex flex-col items-center py-3 space-y-3 border-r border-[#E5E2DD] bg-[#EEEBE6] shrink-0">
          <button
            onClick={createDocument}
            title="New Document"
            className="p-2 rounded-md bg-[#1A1A1A] text-white hover:bg-[#2c2c2c] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            className="p-2 rounded-md text-[#666666] hover:text-[#1A1A1A] hover:bg-white/60 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="w-64 flex flex-col h-full overflow-y-auto">
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A] mb-3">
                Files
              </div>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => selectDocument(doc.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all group relative ${
                      activeDocumentId === doc.id
                        ? 'bg-white border-[#1A1A1A] shadow-sm text-[#1A1A1A] font-semibold'
                        : 'bg-white/60 border-[#E5E2DD] hover:border-[#1A1A1A]/40 text-[#1A1A1A]/80'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate pr-10">{doc.title}</div>
                        <div className="text-[10px] mt-0.5 text-amber-700">{getRelativeTime(doc.updatedAt)}</div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRename(doc.id, doc.title); }}
                        className="p-1 rounded hover:bg-[#E5E2DD] transition-colors"
                        title="Rename"
                      >
                        <Edit3 className="w-3 h-3 text-[#666]" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.title); }}
                        className="p-1 rounded hover:bg-rose-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-rose-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-2 px-4 py-2.5 border-b border-[#E5E2DD] bg-white">
          {formatGroups.map((group, i) => (
            <div key={i} className="flex items-center space-x-0.5 pr-3 border-r border-[#E5E2DD] last:border-r-0 last:pr-0">
              {group.map((btn, j) => (
                <button
                  key={j}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={btn.onClick}
                  title={btn.title}
                  className="p-1.5 rounded-md text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] transition-colors"
                >
                  {btn.icon}
                </button>
              ))}
            </div>
          ))}

          <div className="flex-1" />

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#2c2c2c] disabled:opacity-60 text-white text-xs font-semibold transition-all shadow-sm"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>

        {/* Document Title */}
        <div className="px-8 pt-6 max-w-3xl w-full mx-auto">
          <input
            type="text"
            value={activeDocument.title}
            onChange={(e) => renameDocument(activeDocument.id, e.target.value)}
            placeholder="Untitled Document"
            className="w-full text-3xl font-serif font-bold text-[#1A1A1A] placeholder-[#AAAAAA] focus:outline-none bg-transparent"
          />
        </div>

        {/* Editable Body */}
        <div className="flex-1 overflow-y-auto">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncContent}
            className="prose-editor max-w-3xl w-full mx-auto px-8 py-6 min-h-[60vh] text-sm text-[#1A1A1A] leading-relaxed focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

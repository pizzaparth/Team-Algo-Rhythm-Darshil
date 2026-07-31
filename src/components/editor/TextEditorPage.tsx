// Author: Parth Pancholi

import React, { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Pilcrow,
  Undo2, Redo2, Download, Plus, FileText,
  ChevronLeft, ChevronRight, Loader2, X, Sigma, SquareSigma,
} from 'lucide-react';
import { useEditorStore } from '../../store/';
import { getRelativeTime } from '../../lib/markdownRenderer';
import { exportElementToPDF } from '../../lib/pdfExport';
import { primaryButtonClasses } from '../../lib/uiClasses';
import {
  createMathElement, findClosedMathAtCaret, placeCaretAfter, replaceRangeWithMath,
} from '../../lib/mathRenderer';
import { CollapsibleSidebarShell } from '../common/CollapsibleSidebarShell';
import { RenameDeleteListItem } from '../common/RenameDeleteListItem';

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

  // Start with the files drawer collapsed on mobile so the editor isn't
  // squeezed into a sliver by a 256px-wide panel on a narrow screen.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  /**
   * Converts `$…$` / `$$…$$` into rendered math the moment the closing
   * delimiter is typed, then syncs. Runs on every input event but bails
   * immediately unless the character just typed was a `$`.
   */
  const handleInput = () => {
    const selection = window.getSelection();
    const node = selection?.anchorNode;

    if (
      selection?.isCollapsed &&
      node?.nodeType === Node.TEXT_NODE &&
      editorRef.current?.contains(node)
    ) {
      const textNode = node as Text;
      const match = findClosedMathAtCaret(textNode.data, selection.anchorOffset);
      if (match) replaceRangeWithMath(textNode, match);
    }

    syncContent();
  };

  /**
   * Toolbar entry point. window.prompt steals focus and collapses the
   * selection, so the caret position is captured beforehand and restored
   * after — otherwise math would always land at the start of the document.
   */
  const handleInsertMath = (display: boolean) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    const savedRange =
      selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)
        ? selection.getRangeAt(0).cloneRange()
        : null;

    const latex = window.prompt(
      display ? 'Block math (LaTeX):' : 'Inline math (LaTeX):',
      display ? '\\int_0^1 x^2\\,dx' : 'e^{i\\pi} + 1 = 0',
    );
    if (!latex?.trim()) return;

    editor.focus();
    const sel = window.getSelection();
    if (!sel) return;

    // Restore the pre-prompt caret, or fall back to the end of the document.
    const range = savedRange ?? (() => {
      const r = document.createRange();
      r.selectNodeContents(editor);
      r.collapse(false);
      return r;
    })();

    range.deleteContents();
    const mathEl = createMathElement(latex.trim(), display);
    range.insertNode(mathEl);

    sel.removeAllRanges();
    sel.addRange(range);
    placeCaretAfter(mathEl, sel);

    syncContent();
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
    [
      { icon: <Sigma className="w-4 h-4" />, title: 'Inline Math — or type $x^2$', onClick: () => handleInsertMath(false) },
      { icon: <SquareSigma className="w-4 h-4" />, title: 'Block Math — or type $$x^2$$', onClick: () => handleInsertMath(true) },
    ],
  ];

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] bg-[#F9F8F6] overflow-hidden">
      <CollapsibleSidebarShell
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        toggleTitle={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        toggleIcon={sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-white" />}
        railChildren={
          sidebarOpen && (
            <button
              onClick={createDocument}
              title="New Document"
              className={primaryButtonClasses('p-2 rounded-md')}
            >
              <Plus className="w-4 h-4" />
            </button>
          )
        }
        drawerChildren={
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A]">
                Files
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className={primaryButtonClasses('md:hidden p-1 rounded-md')}
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {documents.map((doc) => (
                <RenameDeleteListItem
                  key={doc.id}
                  selected={activeDocumentId === doc.id}
                  icon={<FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60" />}
                  title={doc.title}
                  updatedAt={getRelativeTime(doc.updatedAt)}
                  onSelect={() => selectDocument(doc.id)}
                  onRename={() => handleRename(doc.id, doc.title)}
                  onDelete={() => handleDelete(doc.id, doc.title)}
                />
              ))}
            </div>
          </div>
        }
      />

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
            className={primaryButtonClasses('flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full disabled:opacity-60 text-xs font-semibold transition-all shadow-sm')}
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>

        {/* Document Title */}
        <div className="px-4 sm:px-8 pt-6 max-w-3xl w-full mx-auto">
          <input
            type="text"
            value={activeDocument.title}
            onChange={(e) => renameDocument(activeDocument.id, e.target.value)}
            placeholder="Untitled Document"
            className="w-full text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] placeholder-[#AAAAAA] focus:outline-none bg-transparent"
          />
        </div>

        {/* Editable Body */}
        <div className="flex-1 overflow-y-auto">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="prose-editor max-w-3xl w-full mx-auto px-4 sm:px-8 py-6 min-h-[60vh] text-sm text-[#1A1A1A] leading-relaxed focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

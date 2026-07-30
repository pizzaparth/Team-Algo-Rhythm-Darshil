/**
 * useKeyboardShortcuts.ts — Global Keyboard Shortcut Handler
 *
 * All graph canvas keyboard shortcuts centralised here.
 * Ignores shortcuts when user is typing in an input/textarea.
 */

import { useEffect } from 'react';
import { graphCommands } from '../lib/graphCommands';
import { useGraphStore } from '../store';
import { useAppStore } from '../store';

interface UseKeyboardShortcutsOptions {
  onOpenSearch?: () => void;
}

export function useKeyboardShortcuts({ onOpenSearch }: UseKeyboardShortcutsOptions = {}) {
  const { selectedNodeId, canUndo, canRedo } = useGraphStore();
  const { openModal } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Ignore when typing in form fields
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;

      // --- Undo / Redo ---
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) graphCommands.undoLastAction();
        return;
      }
      if ((ctrl && e.key === 'Z' && e.shiftKey) || (ctrl && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) graphCommands.redoLastAction();
        return;
      }

      // --- Search ---
      if (ctrl && e.key === 'k') {
        e.preventDefault();
        onOpenSearch?.();
        return;
      }

      // --- Fit View ---
      if (e.key === 'f' || e.key === 'F') {
        graphCommands.fitView();
        return;
      }

      // --- Node shortcuts (require selection) ---
      if (!selectedNodeId) return;

      // Delete / Backspace → open delete confirm modal
      if (e.key === 'Delete' || e.key === 'Backspace') {
        openModal('delete_node', { nodeId: selectedNodeId });
        return;
      }

      // Ctrl+D → Duplicate
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        graphCommands.duplicateNode(selectedNodeId);
        return;
      }

      // Ctrl+C → Copy
      if (ctrl && e.key === 'c') {
        graphCommands.copyNode(selectedNodeId);
        return;
      }

      // Ctrl+V → Paste
      if (ctrl && e.key === 'v') {
        graphCommands.pasteNode();
        return;
      }

      // E → Expand
      if (e.key === 'e' || e.key === 'E') {
        openModal('expand_node', { nodeId: selectedNodeId });
        return;
      }

      // X → Collapse/Expand subtree
      if (e.key === 'x' || e.key === 'X') {
        const node = useGraphStore.getState().nodes.find(n => n.id === selectedNodeId);
        if (node) useGraphStore.getState().toggleNodeCollapse(selectedNodeId);
        return;
      }

      // B → Bookmark
      if (e.key === 'b' || e.key === 'B') {
        graphCommands.bookmarkNode(selectedNodeId);
        return;
      }

      // . (dot) → Center on selected node
      if (e.key === '.' && ctrl) {
        e.preventDefault();
        graphCommands.focusNode(selectedNodeId);
        return;
      }

      // Escape → deselect
      if (e.key === 'Escape') {
        useGraphStore.getState().selectNode(null);
        useGraphStore.getState().closeContextMenu();
        graphCommands.clearFocusBranch();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, canUndo, canRedo, openModal, onOpenSearch]);
}

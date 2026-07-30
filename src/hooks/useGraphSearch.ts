/**
 * useGraphSearch.ts — Graph Search Hook
 *
 * Provides fuzzy title/summary/type/creator search with highlight state.
 * Calls graphCommands.searchNodes() which updates searchHighlightIds in store.
 */

import { useState, useCallback } from 'react';
import { graphCommands } from '../lib/graphCommands';
import { useGraphStore } from '../store';

export function useGraphSearch() {
  const [query, setQuery] = useState('');
  const { searchHighlightIds, nodes } = useGraphStore();

  const search = useCallback((q: string) => {
    setQuery(q);
    graphCommands.searchNodes(q);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    graphCommands.clearSearch();
  }, []);

  const resultNodes = nodes.filter(n => searchHighlightIds.includes(n.id));

  return {
    query,
    search,
    clear,
    resultNodes,
    resultCount: resultNodes.length,
    hasResults: resultNodes.length > 0,
  };
}

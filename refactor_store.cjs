const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

const storeMapping = {
  viewMode: 'useAppStore', setViewMode: 'useAppStore', sidebarOpen: 'useAppStore', setSidebarOpen: 'useAppStore',
  activeSidebarTab: 'useAppStore', setActiveSidebarTab: 'useAppStore', activeAssistantTab: 'useAppStore', setActiveAssistantTab: 'useAppStore',
  activeModal: 'useAppStore', modalData: 'useAppStore', openModal: 'useAppStore', closeModal: 'useAppStore',
  searchQuery: 'useAppStore', setSearchQuery: 'useAppStore', toasts: 'useAppStore', addToast: 'useAppStore', removeToast: 'useAppStore',
  
  projects: 'useProjectStore', activeProjectId: 'useProjectStore', sessions: 'useProjectStore', activeSessionId: 'useProjectStore',
  selectProject: 'useProjectStore', selectSession: 'useProjectStore', createProject: 'useProjectStore', createSession: 'useProjectStore',
  
  nodes: 'useGraphStore', edges: 'useGraphStore', selectedNodeId: 'useGraphStore', selectedNodeIds: 'useGraphStore',
  history: 'useGraphStore', historyIndex: 'useGraphStore', canUndo: 'useGraphStore', canRedo: 'useGraphStore', contextMenu: 'useGraphStore',
  setNodes: 'useGraphStore', setEdges: 'useGraphStore', selectNode: 'useGraphStore', setSelectedNodeIds: 'useGraphStore',
  updateNodeData: 'useGraphStore', addNode: 'useGraphStore', deleteNode: 'useGraphStore', duplicateNode: 'useGraphStore',
  toggleNodeBookmark: 'useGraphStore', toggleNodeCollapse: 'useGraphStore', undo: 'useGraphStore', redo: 'useGraphStore',
  openContextMenu: 'useGraphStore', closeContextMenu: 'useGraphStore',
  
  messages: 'useChatStore', isGenerating: 'useChatStore', contextSufficient: 'useChatStore', sendUserMessage: 'useChatStore', setContextSufficient: 'useChatStore',
  
  aiSuggestions: 'useAIStore', activities: 'useAIStore', addBranchFromSuggestion: 'useAIStore', ignoreSuggestion: 'useAIStore', addActivity: 'useAIStore'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (fullPath.includes('store\\\\useWorkspaceStore') || fullPath.includes('store/useWorkspaceStore') || fullPath.includes('store\\\\index') || fullPath.includes('store/index') || fullPath.includes('data\\\\') || fullPath.includes('data/')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Update import
      if (content.includes('useWorkspaceStore')) {
        const importRegex = /import\s+\{\s*useWorkspaceStore\s*\}\s+from\s+['"](.*?)useWorkspaceStore['"];?/;
        const match = content.match(importRegex);
        if (match) {
          const importPath = match[1];
          // Find the destructured usage
          const usageRegex = /const\s+\{\s*([^}]+)\s*\}\s*=\s*useWorkspaceStore\(\);?/g;
          
          let requiredStores = new Set();
          
          let newContent = content.replace(usageRegex, (full, vars) => {
            const variables = vars.split(',').map(v => v.trim()).filter(v => v);
            let storeGroups = {};
            
            for (const v of variables) {
              const cleanV = v.split(':')[0].trim();
              const store = storeMapping[cleanV];
              if (!store) {
                console.warn('Unknown variable:', cleanV, 'in', fullPath);
                continue;
              }
              requiredStores.add(store);
              if (!storeGroups[store]) storeGroups[store] = [];
              storeGroups[store].push(v);
            }
            
            let replacements = [];
            for (const [store, storeVars] of Object.entries(storeGroups)) {
              replacements.push(`const { ${storeVars.join(', ')} } = ${store}();`);
            }
            return replacements.join('\n  ');
          });
          
          if (requiredStores.size > 0) {
            const storesList = Array.from(requiredStores).join(', ');
            newContent = newContent.replace(importRegex, `import { ${storesList} } from '${importPath}';`);
            
            fs.writeFileSync(fullPath, newContent);
            console.log('Updated:', fullPath);
          }
        }
      }
    }
  }
}

processDirectory(srcDir);

let activeTab = null;
const tabTree = {};
const debug = false;

// When the script first starts, save the active tab for the active window
chrome.tabs.query({ lastFocusedWindow: true, active: true }, (tabs) => {
  if (tabs.length > 0) {
    activeTab = tabs[0].id;
  }
  debug ? console.log('script start ', activeTab, tabTree) : '';
});

// When a tab is created, save which tab was active at that time in tabTree
chrome.tabs.onCreated.addListener(function (tab) {
  tabTree[tab.id] = activeTab;
  debug ? console.log('onCreated ', activeTab, tabTree) : '';
});

// When a tab is activated, change the current active tab
chrome.tabs.onActivated.addListener(function (activeInfo) {
  activeTab = activeInfo.tabId;
  debug ? console.log('onActivated ', activeTab, tabTree) : '';
});

// When a tab is removed, activate the tab that was active when the now removed tab was created
// and update tabTree and activeTab
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (tabId in tabTree) {
    chrome.tabs.get(tabTree[tabId], function (tab) {
      // Chome will issue an error if the tab doesn't exist and we don't check this variable
      if (chrome.runtime.lastError) {
        return;
      }

      chrome.tabs.highlight({
        windowId: tab.windowId,
        tabs: tab.index,
      });
      chrome.windows.update(tab.windowId, { focused: true });
      activeTab = tab.id;
    });

    for (const key in tabTree) {
      if (tabTree[key] === tabId) {
        tabTree[key] = tabTree[tabId];
      }
    }
    delete tabTree[tabId];
  }

  debug ? console.log('onRemoved ', activeTab, tabTree) : '';
});

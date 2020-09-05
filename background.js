/* example "windows" object structure:
{
    25: { // windowId 25  
        active: 5, // last active tab id for window 25 is 5
        7: 4, // tab id 7 was created by tab id 4 (or 4 was active when 7 was created)
        9: 2        
    },
    40: {
        active: 10,
        10: 9,
        12: 3
    }
}
*/
const windows = {};

// When the script first starts, save the active tab for each window
chrome.tabs.query({ active: true }, function (tabs) {
  tabs.forEach((tab) => {
    windows[tab.windowId] = { active: tab.id };
  });
});

// When a tab is created, save which tab was active at that time
chrome.tabs.onCreated.addListener(function (tab) {
  if (tab.windowId in windows) {
    windows[tab.windowId][tab.id] = windows[tab.windowId].active;
    windows[tab.windowId].active = tab.id;
  }
});

// When a tab is activated, change the current active tab for its window
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (activeInfo.windowId in windows) {
      windows[activeInfo.windowId].active = tab.id;
    }
  });
});

// When a tab is removed, activate the tab that was active when the now removed tab was created
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (removeInfo.isWindowClosing) return;

  if (removeInfo.windowId in windows) {
    if (tabId in windows[removeInfo.windowId]) {
      const tabIdToHighlight = windows[removeInfo.windowId][tabId];

      chrome.tabs.get(tabIdToHighlight, function (tab) {
        chrome.tabs.highlight({
          windowId: removeInfo.windowId,
          tabs: [tab.index],
        });
      });
    }
  }
});

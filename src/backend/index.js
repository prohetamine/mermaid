chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    hosts: [{
      status: false,
      url: 'http://localhost',
      id: Math.random() * 10000
    }]
  })
})

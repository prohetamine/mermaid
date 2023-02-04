document.addEventListener('readystatechange', async () => {
  const nodeMetaThemeColor = document.querySelector('meta[name="theme-color"]')

  if (
    document.readyState === 'interactive' &&
    document.body.parentElement.textContent.match(/Stripchat/gi) &&
    nodeMetaThemeColor &&
    nodeMetaThemeColor.content === '#303133'
  ) {
    let windowId = parseInt(Math.random() * 100000) + '-' + parseInt(Math.random() * 100000) + '-' + parseInt(Math.random() * 100000)
      , id = 0

    const hiddenInputNode = document.createElement('input')
        , hiddenButtonNode = document.createElement('button')
        , hiddenScriptNode = document.createElement('script')

    hiddenInputNode.hidden = true
    hiddenButtonNode.hidden = true
    hiddenInputNode.id = 'hidden-input-mermaid-extension'
    hiddenButtonNode.id = 'hidden-button-mermaid-extension'

    try {
      const titleNode = document.querySelector('title')
      titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
    } catch (e) {
      try {
        const titleNode = document.querySelector('title')
        titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
      } catch (e) {}
    }

    hiddenScriptNode.type = 'text/javascript'
    hiddenScriptNode.text = `
      const hime = document.querySelector('#hidden-input-mermaid-extension')
          , hbme = document.querySelector('#hidden-button-mermaid-extension')

      hbme.addEventListener('click', () => {
        if (document.querySelector('[id="broadcast-settings"]')) {
          const input = document.querySelector('[class="input-message-wrapper__input"]')
              , send = document.querySelector('button.btn-send')

          let currentValue = input.value
          const inputReactKey = Object.keys(input).find(key => key.match(/__reactProps/))
          input[inputReactKey].onChange({ stopPropagation: () => {}, target: { value: hime.value } })
          send.click()
          input[inputReactKey].onChange({ stopPropagation: () => {}, target: { value: currentValue } })
        } else {
          console.log('[not your room]', hime.value)
        }
      })

      const proxyWebSocket = window.WebSocket

      window.WebSocket = class {
        constructor (...args) {
          const instanceWebSocket = new proxyWebSocket(...args)

          let id = 0

          if (args[0].match(/comet2/)) {
            console.log('connect', instanceWebSocket)

            instanceWebSocket.addEventListener('message', ({ data }) => {
              console.log(data)
              id++
              try {
                const titleNode = document.querySelector('title')
                titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
              } catch (e) {
                try {
                  const titleNode = document.querySelector('title')
                  titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
                } catch (e) {}
              }
              window.postMessage({ to: 'mermaidExtensionV2', from: 'Stripchat', socketType: 'message', data }, window.origin);
            })

            instanceWebSocket.addEventListener('error', error => {
              id++
              try {
                const titleNode = document.querySelector('title')
                titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
              } catch (e) {
                try {
                  const titleNode = document.querySelector('title')
                  titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
                } catch (e) {}
              }
              window.postMessage({ to: 'mermaidExtensionV2', from: 'Stripchat', socketType: 'error', data: error }, window.origin);
            })

            instanceWebSocket.addEventListener('close', close => {
              id++
              try {
                const titleNode = document.querySelector('title')
                titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
              } catch (e) {
                try {
                  const titleNode = document.querySelector('title')
                  titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
                } catch (e) {}
              }
              window.postMessage({ to: 'mermaidExtensionV2', from: 'Stripchat', socketType: 'close', data: close }, window.origin);
            })

            const send = instanceWebSocket.send
            instanceWebSocket.send = function (...args) {
              id++
              try {
                const titleNode = document.querySelector('title')
                titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
              } catch (e) {
                try {
                  const titleNode = document.querySelector('title')
                  titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
                } catch (e) {}
              }
              window.postMessage({ to: 'mermaidExtensionV2', from: 'Stripchat', socketType: 'send', data: args }, window.origin);
              send.call(this, ...args)
            }
          }

          return instanceWebSocket
        }
      }
    `

    const createSocket = url => {
      const socket = io(
        `${url}:6767?platform=Stripchat`,
        {
          options: {
            reconnectionDelayMax: 10000
          }
        }
      )

      socket.on('connect', async () =>
        console.log(`[Stripchat] Mermaid extension: chat Web Socket connected`)
      )

      socket.io.on('reconnect_attempt', async attempt =>
        console.log(`[Stripchat] Mermaid extension: chat Web Socket reconnect (${attempt})`)
      )

      socket.io.on('reconnect_failed', async () =>
        console.log(`[Stripchat] Mermaid extension: chat Web Socket reconnect`)
      )

      socket.io.on('error', async error =>
        console.log(`[Stripchat] Mermaid extension: chat Web Socket error ${error}`)
      )

      socket.on('input', async data => {
        if (data.platform === 'Stripchat') {
          hiddenInputNode.value = data.text
          hiddenButtonNode.click()
        }
      })

      window.addEventListener('message', event => {
        if (window.origin === event.origin && event.data && event.data.to === 'mermaidExtensionV2') {
          id++
          try {
            const titleNode = document.querySelector('title')
            titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), b: id })
          } catch (e) {
            try {
              const titleNode = document.querySelector('title')
              titleNode.innerHTML = JSON.stringify({ a: 0, b: id })
            } catch (e) {}
          }

          socket.emit('output', JSON.stringify({
            platform: event.data.from,
            data: event.data.data,
            id,
            windowId,
            localDate: new Date() - 0,
            modelUsername: window.location.pathname.replace(/\//, ''),
            color: '#a2252d'
          }))
        }
      })
    }

    chrome.storage.local.get(
      state =>
        state.hosts.forEach(({ url }) => createSocket(url))
    )

    document.body.appendChild(hiddenInputNode)
    document.body.appendChild(hiddenButtonNode)
    document.body.appendChild(hiddenScriptNode)
  }
})

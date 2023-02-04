document.addEventListener('readystatechange', async () => {
  const nodeMetaThemeColor = document.querySelector('meta[name="theme-color"]')

  if (
    document.readyState === 'interactive' &&
    nodeMetaThemeColor &&
    nodeMetaThemeColor.content === '#81003a'
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
      const titleNode = document.querySelector('title')

      const proxyWebSocket = window.WebSocket

      window.WebSocket = class {
        constructor (...args) {
          const instanceWebSocket = new proxyWebSocket(...args)

          if (args[0].match(/\.bcccdn\./)) {
            const hime = document.querySelector('#hidden-input-mermaid-extension')
                , hbme = document.querySelector('#hidden-button-mermaid-extension')

            let messageId = 2
              , id = 0

            hbme.addEventListener('click', () => {
              if (document.querySelector('[id="js-chat_general"]')) {
                let currentValue = hime.value
                instanceWebSocket.send(
                  JSON.stringify({
                    "id": messageId,
                    "name":"ChatModule.sendMessage",
                    "args":["public-chat",currentValue,"key",null,true]
                  })
                )
                messageId++
              } else {
                console.log('[not your room]', hime.value)
              }
            })

            console.log('connect', instanceWebSocket)

            instanceWebSocket.addEventListener('message', ({ data }) => {
              messageId++
              id++
              try {
                titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
              } catch (e) {
                titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
              }
              window.postMessage({ to: 'mermaidExtensionV2', from: 'BongaCams', socketType: 'message', data }, window.origin);
            })

            instanceWebSocket.addEventListener('error', error => {
              id++
              try {
                titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
              } catch (e) {
                titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
              }
              window.postMessage({ to: 'mermaidExtensionV2', from: 'BongaCams', socketType: 'error', data: error }, window.origin);
            })

            instanceWebSocket.addEventListener('close', close => {
              id++
              try {
                titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
              } catch (e) {
                titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
              }
              window.postMessage({ to: 'mermaidExtensionV2', from: 'BongaCams', socketType: 'close', data: close }, window.origin);
            })

            const send = instanceWebSocket.send
            instanceWebSocket.send = function (...args) {
              id++
              try {
                titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
              } catch (e) {
                titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
              }
              window.postMessage({ to: 'mermaidExtensionV2', from: 'BongaCams', socketType: 'send', data: args }, window.origin);
              send.call(this, ...args)
            }
          }

          return instanceWebSocket
        }
      }
    `

    const createSocket = url => {
      const socket = io(
        `${url}:6767?platform=BongaCams`,
        {
          options: {
            reconnectionDelayMax: 10000
          }
        }
      )

      socket.on('connect', async () =>
        console.log(`[BongaCams] Mermaid extension: chat Web Socket connected`)
      )

      socket.io.on('reconnect_attempt', async attempt =>
        console.log(`[BongaCams] Mermaid extension: chat Web Socket reconnect (${attempt})`)
      )

      socket.io.on('reconnect_failed', async () =>
        console.log(`[BongaCams] Mermaid extension: chat Web Socket reconnect`)
      )

      socket.io.on('error', async error =>
        console.log(`[BongaCams] Mermaid extension: chat Web Socket error ${error}`)
      )

      socket.on('input', async data => {
        if (data.platform === 'BongaCams') {
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
            modelUsername: document.querySelector('span[class="stai_name"]').innerText,
            color: '#81003a'
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

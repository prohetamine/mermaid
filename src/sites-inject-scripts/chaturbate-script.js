document.addEventListener('readystatechange', () => {
  if (document.readyState === 'interactive' && document.body.parentElement.textContent.match(/Chaturbate/gi)) {
    let windowId = parseInt(Math.random() * 100000) + '-' + parseInt(Math.random() * 100000) + '-' + parseInt(Math.random() * 100000)
      , id = 0

    const titleNode = document.querySelector('title')
        , hiddenInputNode = document.createElement('input')
        , hiddenButtonNode = document.createElement('button')
        , hiddenScriptNode = document.createElement('script')

    hiddenInputNode.hidden = true
    hiddenButtonNode.hidden = true
    hiddenInputNode.id = 'hidden-input-mermaid-extension'
    hiddenButtonNode.id = 'hidden-button-mermaid-extension'

    titleNode.innerHTML = JSON.stringify({ a: 0, b: 0 })

    hiddenScriptNode.type = 'text/javascript'
    hiddenScriptNode.async = false
    hiddenScriptNode.text = `
      const titleNode = document.querySelector('title')

      let messageId = 2
        , id = 0

      const originalApply = window.Function.prototype.apply;
      window.Function.prototype.apply = function() {
        try {
          if (typeof(arguments[0].event) === 'string' && arguments[1][0].name) {
            messageId++
            id++
            try {
              titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
            } catch (e) {
              titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
            }
            window.postMessage({ to: 'mermaidExtensionV2', from: 'Chaturbate', socketType: 'message', data: arguments[1] }, window.origin);
          }
        } catch (e) {}

        return originalApply.call(this, ...arguments);
      };

      const hime = document.querySelector('#hidden-input-mermaid-extension')
          , hbme = document.querySelector('#hidden-button-mermaid-extension')

      hbme.addEventListener('click', () => {
        if (window.location.href.match(/\\/b\\//)) {
          window.TSHandler.message_outbound.send_room_message(hime.value)
        } else {
          console.log('[not your room]', hime.value)
        }
      })
    `

    const createSocket = url => {
      const socket = io(
        `${url}:6767?platform=Chaturbate`,
        {
          options: {
            reconnectionDelayMax: 10000
          }
        }
      )

      socket.on('connect', async () =>
        console.log(`[Chaturbate] Mermaid extension: chat Web Socket connected`)
      )

      socket.io.on('reconnect_attempt', async attempt =>
        console.log(`[Chaturbate] Mermaid extension: chat Web Socket reconnect (${attempt})`)
      )

      socket.io.on('reconnect_failed', async () =>
        console.log(`[Chaturbate] Mermaid extension: chat Web Socket reconnect`)
      )

      socket.io.on('error', async error =>
        console.log(`[Chaturbate] Mermaid extension: chat Web Socket error ${error}`)
      )

      socket.on('input', async data => {
        if (data.platform === 'Chaturbate') {
          hiddenInputNode.value = data.text
          hiddenButtonNode.click()
        }
      })

      window.addEventListener('message', event => {
        if (window.origin === event.origin && event.data && event.data.to === 'mermaidExtensionV2') {
          id++
          try {
            titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), b: id })
          } catch (e) {
            titleNode.innerHTML = JSON.stringify({ a: 0, b: id })
          }

          socket.emit('output', JSON.stringify({
            platform: event.data.from,
            data: event.data.data,
            id,
            windowId,
            localDate: new Date() - 0,
            modelUsername: window.location.pathname.replace(/(\/b\/|\/)/, '').slice(0, -1),
            color: '#f47321'
          }))
        }
      })
    }

    chrome.storage.local.get(
      state =>
        state.hosts.forEach(({ url }) => createSocket(url))
    )

    document.body.prepend(hiddenInputNode)
    document.body.prepend(hiddenButtonNode)
    document.head.prepend(hiddenScriptNode)
  }
}, true)

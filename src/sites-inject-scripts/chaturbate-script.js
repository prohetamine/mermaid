document.addEventListener('readystatechange', async () => {
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
    hiddenScriptNode.text = `
      const hime = document.querySelector('#hidden-input-mermaid-extension')
          , hbme = document.querySelector('#hidden-button-mermaid-extension')

      hbme.addEventListener('click', () => {
        if (window.location.href.match(/\\/b\\//)) {
          window.TSHandler.message_outbound.send_room_message(hime.value)
        } else {
          console.log('[not your room]', hime.value)
        }
      })

      const titleNode = document.querySelector('title')

      const proxySockJS = window.SockJS

      window.SockJS = function (...args) {
        window.instanceSockJS = proxySockJS.call(this, ...args)

        let id = 0

        setTimeout(() => {
          const onmessage = window.instanceSockJS.onmessage
          window.instanceSockJS.onmessage = function (...args) {
            id++
            try {
              titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
            } catch (e) {
              titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
            }
            window.postMessage({ to: 'mermaidExtensionV2', from: 'Chaturbate', socketType: 'message', data: args }, window.origin)
            onmessage.call(this, ...args)
          }

          const onerror = window.instanceSockJS.onerror
          window.instanceSockJS.onerror = function (...args) {
            id++
            try {
              titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
            } catch (e) {
              titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
            }
            window.postMessage({ to: 'mermaidExtensionV2', from: 'Chaturbate', socketType: 'error', data: args }, window.origin)
            onerror.call(this, ...args)
          }

          const onclose = window.instanceSockJS.onclose
          window.instanceSockJS.onclose = function (...args) {
            id++
            try {
              titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
            } catch (e) {
              titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
            }
            window.postMessage({ to: 'mermaidExtensionV2', from: 'Chaturbate', socketType: 'close', data: args }, window.origin)
            onclose.call(this, ...args)
          }

          const send = window.instanceSockJS.send
          window.instanceSockJS.send = function (...args) {
            id++
            try {
              titleNode.innerHTML = JSON.stringify({ ...JSON.parse(titleNode.innerHTML), a: id })
            } catch (e) {
              titleNode.innerHTML = JSON.stringify({ a: id, b: 0 })
            }
            window.postMessage({ to: 'mermaidExtensionV2', from: 'Chaturbate', socketType: 'send', data: args }, window.origin)
            send.call(this, ...args)
          }
        }, 1)

        return instanceSockJS
      }
    `

    const socket = io(
      'http://localhost:6767?platform=Chaturbate',
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

    document.body.appendChild(hiddenInputNode)
    document.body.appendChild(hiddenButtonNode)
    document.body.appendChild(hiddenScriptNode)
  }
})

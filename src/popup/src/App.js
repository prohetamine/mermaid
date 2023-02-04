import { useState, useEffect } from 'react'
import styled from 'styled-components'

const Body = styled.div`
  width: 300px;
  height: 400px;
`

const Wrapper = styled.div`

`

const Hosts = styled.div`

`

const Host = styled.input`

`

const App = () => {
  const [state, setState] = useState(null)

  useEffect(() => {
    window.chrome.storage.local.get(setState)
  }, [])

  useEffect(() => {
    if (state) {
      window.chrome.storage.local.set(state)
    }
  }, [state])

  const addNewHost = () => {
    setState(
      s => ({
        ...s,
        hosts: [
          ...s.hosts,
          {
            url: '',
            id: Math.random() * 10000
          }
        ]
      })
    )
  }

  const setHostUrl = (id, value) => {
    setState(
      s => ({
        ...s,
        hosts: s.hosts.map(host => {
          if (host.id === id) {
            return {
              ...host,
              url: value
            }
          } else {
            return host
          }
        })
      })
    )
  }

  return (
    <Body>
      {
        state
          ? (
            <Wrapper>
              <Hosts>
              {

                state.hosts
                  ? (
                    state.hosts.map(({ url, id }) =>
                      <div key={id}>
                        <Host
                          type="text"
                          value={url}
                          key={id}
                          onChange={({ target: { value } }) => setHostUrl(id, value)}
                        />
                      </div>
                    )
                  )
                  : (
                    <div>load hosts...</div>
                  )
              }
              <div onClick={addNewHost}>Add host</div>
              </Hosts>
            </Wrapper>
          )
          : null
      }
    </Body>
  )
}

export default App

import test from 'ava'
import { newHocuspocus, newHocuspocusProvider } from '../utils/index.js'

test.only('keep awareness.clientID in sync with document.clientID', async t => {
  await new Promise(async resolve => {
    const server = await newHocuspocus({
      onStoreDocument: async ({ document }) => {
        document.broadcastStateless('trigger the 2nd provider')
      },
    })

    const provider1 = newHocuspocusProvider(server, {
    })
    provider1.document.clientID = 1
    if (!provider1.awareness) {
      t.fail()
      resolve('fail')
      return
    }
    provider1.awareness.clientID = 1

    t.is(provider1.document.clientID, provider1.awareness.clientID)
    provider1.document.getArray('a').insert(0, [1, 2, 3])

    const provider2 = newHocuspocusProvider(server, {
      onStateless: () => {
        provider2.document.getArray('a').insert(0, [1, 2, 3])

        if (!provider2.awareness) {
          t.fail()
          resolve('fail')
          return
        }
        t.is(provider2.document.clientID, provider2.awareness.clientID)
        resolve('done')
      },
    })
    provider2.document.clientID = 1
    if (!provider2.awareness) {
      t.fail()
      resolve('fail')
      return
    }
    provider2.awareness.clientID = 1
    t.is(provider2.document.clientID, provider2.awareness.clientID)
  })
})

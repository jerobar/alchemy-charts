import { useState, useEffect } from 'react'

import { ethers } from 'ethers'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { LoadingOverlay } from '@mantine/core'

const CONTRACT_ADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
const signature = 'Transfer(address,address,uint256)'
const signatureBytes = ethers.utils.toUtf8Bytes(signature)
const TRANSFER_TOPIC = ethers.utils.keccak256(signatureBytes)

export function TokenChart(props) {
  const { provider } = props
  const [transferData, setTransferData] = useState(null)

  // Periodically query wrapped btc transfer data
  useEffect(() => {
    if (provider) {
      async function queryTransfers() {
        const currentBlockNumber = await provider.send('eth_blockNumber')
        const toBlock = currentBlockNumber
        const fromBlock = ethers.BigNumber.from(toBlock)
          .sub(ethers.BigNumber.from(100))
          .toHexString()

        await provider
          .send('eth_getLogs', [
            {
              fromBlock,
              toBlock,
              address: CONTRACT_ADDRESS,
              topics: [TRANSFER_TOPIC]
            }
          ])
          .then(transfers => {
            // Create object of unique transfer objects indexed by block number
            const obj = transfers
              // Format individual transfer objects
              .map(transfer => ({
                blockNumber: ethers.BigNumber.from(
                  transfer.blockNumber
                ).toNumber(),
                transferVolume:
                  ethers.utils.defaultAbiCoder
                    .decode(['uint256'], transfer.data)[0]
                    .toNumber() / 100_000_000
              }))
              // Remove duplicate block numbers
              .reduce((acc, { blockNumber, transferVolume }) => {
                acc[blockNumber] ??= { blockNumber, transferVolume: 0 }
                acc[blockNumber].transferVolume += transferVolume

                return acc
              }, {})
            // Create array from transfers object
            const transfersArray = Object.keys(obj).map(key => obj[key])

            setTransferData(transfersArray)
          })
          .catch(error => console.error(error))
      }
      // Query once on load
      queryTransfers()

      // Run  every 15 seconds
      const queryInterval = setInterval(() => {
        queryTransfers()
      }, 15000)

      return () => clearInterval(queryInterval)
    }
  }, [provider])

  return (
    <>
      <LineChart height={400} width={900} data={transferData}>
        <Line
          name={'Transfers (btc)'}
          type={'monotone'}
          dataKey={'transferVolume'}
          stroke={'#8884d8'}
        />
        <CartesianGrid stroke={'#ccc'} strokeDasharray={'5 5'} />
        <XAxis
          dataKey={'blockNumber'}
          angle={30}
          label={{
            value: 'Block Number',
            offset: 50,
            position: 'insideBottom'
          }}
        />
        <YAxis
          label={{
            value: 'Transfers (btc)',
            angle: -90,
            offset: 10,
            position: 'insideLeft'
          }}
        />
        <Tooltip labelFormatter={name => 'Block Number: ' + name} />
      </LineChart>
      <LoadingOverlay visible={!transferData} />
    </>
  )
}

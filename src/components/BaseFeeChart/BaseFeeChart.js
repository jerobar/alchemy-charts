import { useState, useEffect } from 'react'

import { ethers } from 'ethers'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { LoadingOverlay } from '@mantine/core'

/**
 * Returns array of objects containing the block number and base fee in gwei.
 */
function formatBaseFeeData(oldestBlock, baseFeePerGas) {
  let currentBlockNumber = ethers.BigNumber.from(oldestBlock).toNumber()

  return baseFeePerGas.map(baseFee => {
    const data = {
      blockNumber: currentBlockNumber,
      baseFeeInGwei: ethers.BigNumber.from(baseFee).toNumber() / 1_000_000_000
    }

    currentBlockNumber++

    return data
  })
}

export function BaseFeeChart(props) {
  const { provider } = props
  const [baseFeeData, setBaseFeeData] = useState(null)

  // Periodically query base fees then update state with data
  useEffect(() => {
    if (provider) {
      async function queryFeeHistory() {
        await provider
          .send('eth_feeHistory', [99, 'latest'])
          .then(feeHistory => {
            setBaseFeeData(
              formatBaseFeeData(
                feeHistory.oldestBlock,
                feeHistory.baseFeePerGas
              )
            )
          })
          .catch(error => console.error(error))
      }
      // Query once on load
      queryFeeHistory()

      // Run  every 15 seconds
      const queryInterval = setInterval(() => {
        queryFeeHistory()
      }, 15000)

      return () => clearInterval(queryInterval)
    }
  }, [provider])

  return (
    <>
      <LineChart height={400} width={900} data={baseFeeData}>
        <Line
          name={'Base Fee (gwei)'}
          type={'monotone'}
          dataKey={'baseFeeInGwei'}
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
            value: 'Base Fee (gwei)',
            angle: -90,
            offset: 10,
            position: 'insideLeft'
          }}
        />
        <Tooltip labelFormatter={name => 'Block Number: ' + name} />
      </LineChart>
      <LoadingOverlay visible={!baseFeeData} />
    </>
  )
}

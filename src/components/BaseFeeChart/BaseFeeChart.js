import { useState, useEffect } from 'react'

import { ethers } from 'ethers'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

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
  const { providerRef } = props
  const [oldestBlock, setOldestBlock] = useState(null)
  const [baseFeeData, setBaseFeeData] = useState(null)

  // Query base fees of last 99 blocks then update state with data
  useEffect(() => {
    if (providerRef.current) {
      async function queryFeeHistory() {
        await providerRef.current
          .send('eth_feeHistory', [99, 'latest'])
          .then(feeHistory => {
            console.log(feeHistory)
            setOldestBlock(feeHistory.oldestBlock)
            setBaseFeeData(
              formatBaseFeeData(
                feeHistory.oldestBlock,
                feeHistory.baseFeePerGas
              )
            )
          })
          .catch(error => console.error(error))
      }
      queryFeeHistory()
    }
  }, [providerRef])

  return (
    baseFeeData && (
      <LineChart height={400} width={768} data={baseFeeData}>
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
            offset: 20,
            position: 'insideLeft'
          }}
        />
        <Tooltip labelFormatter={name => 'Block Number: ' + name} />
      </LineChart>
    )
  )
}

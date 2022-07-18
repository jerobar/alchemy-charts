import { useState, useEffect } from 'react'

import { ethers } from 'ethers'
import {
  Group,
  Text,
  SegmentedControl,
  Space,
  LoadingOverlay
} from '@mantine/core'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

import { getMinerFeeAverages } from '../../utils/transaction-utils'

async function getBlocks(provider, count) {
  let blocks = []
  const feeHistory = await provider.send('eth_feeHistory', [count, 'latest'])
  const oldestBlock = ethers.BigNumber.from(feeHistory.oldestBlock).toNumber()

  // For each block
  for (let i = 0; i < count; i++) {
    // Fetch block's transactions from Alchemy API
    const { transactions } = await provider.send('eth_getBlockByNumber', [
      ethers.BigNumber.from(oldestBlock + i).toHexString(),
      true
    ])

    // Calculate block's base fee
    const baseFee = ethers.BigNumber.from(feeHistory.baseFeePerGas[i])
    const { mean, median } = getMinerFeeAverages(transactions, baseFee)

    // Push block with base fee, transactions to blocks array
    blocks.push({
      number: oldestBlock + i,
      meanMinerFee: mean,
      medianMinerFee: median
    })
  }

  return blocks
}

export function MinerFeeChart(props) {
  const { provider } = props
  const [blockNumbers, setBlockNumbers] = useState([])
  const [minerFeeData, setMinerFeeData] = useState([])
  const [averageType, setAverageType] = useState('mean')

  // Query initial 5 blocks
  useEffect(() => {
    if (provider && !minerFeeData.length) {
      async function queryMinerFeeData() {
        const blocks = await getBlocks(provider, 5)

        setMinerFeeData(minerFeeData => [...minerFeeData, ...blocks])
        setBlockNumbers(blockNumbers => [
          ...blockNumbers,
          ...blocks.map(block => block.number)
        ])
      }
      queryMinerFeeData()
    }
  }, [provider, minerFeeData])

  // Query new block every 7.5 seconds
  useEffect(() => {
    if (provider) {
      async function queryMinerFeeData() {
        const blocks = await getBlocks(provider, 1)
        const newBlocks = blocks.filter(
          block => !blockNumbers.includes(block.number)
        )

        setMinerFeeData(minerFeeData => [...minerFeeData, ...newBlocks])
        setBlockNumbers(blockNumbers => [
          ...blockNumbers,
          ...newBlocks.map(block => block.number)
        ])
      }

      // Run every 7.5 seconds
      const queryInterval = setInterval(() => {
        queryMinerFeeData()
      }, 7500)

      return () => clearInterval(queryInterval)
    }
  }, [provider, minerFeeData])

  return (
    <div>
      <Group position={'apart'}>
        <Text>
          Miner fee shown in gwei. Both mean and median fee data available.
        </Text>
        <SegmentedControl
          value={averageType}
          onChange={setAverageType}
          data={[
            { label: 'Mean', value: 'mean' },
            { label: 'Median', value: 'median' }
          ]}
        />
      </Group>
      <Space h={20} />
      <LineChart height={400} width={900} data={minerFeeData}>
        <Line
          dataKey={averageType === 'mean' ? 'meanMinerFee' : 'medianMinerFee'}
          barSize={20}
          name={
            averageType === 'mean'
              ? 'Mean Miner Fee (gwei)'
              : 'Median Miner Fee (gwei)'
          }
          fill="#8884d8"
        />
        <CartesianGrid stroke={'#ccc'} strokeDasharray={'5 5'} />
        <XAxis
          dataKey={'number'}
          angle={30}
          label={{
            value: 'Block Number',
            offset: 50,
            position: 'insideBottom'
          }}
        />
        <YAxis
          label={{
            value:
              averageType === 'mean'
                ? 'Mean Miner Fee (gwei)'
                : 'Median Miner Fee (gwei)',
            angle: -90,
            offset: 10,
            position: 'insideLeft'
          }}
        />
        <Tooltip labelFormatter={name => 'Block Number: ' + name} />
      </LineChart>
      <LoadingOverlay visible={minerFeeData.length === 0} />
    </div>
  )
}

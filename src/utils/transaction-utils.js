import { ethers } from 'ethers'

function calculateMinerFee(transaction, baseFee) {
  // Ensure transaction implements EIP-1559
  if (
    typeof transaction.maxFeePerGas === 'undefined' ||
    typeof transaction.maxPriorityFeePerGas === 'undefined'
  ) {
    return false
  }

  // maxFeePerGas: Most gwei per gas sender is willing to pay
  const maxFeePerGas = ethers.BigNumber.from(transaction.maxFeePerGas)
  // maxPriorityFeePerGas: What PORTION of maxFeePerGas sender wants to be a miner tip
  const maxPriorityFeePerGas = ethers.BigNumber.from(
    transaction.maxPriorityFeePerGas
  )

  const leftover = maxFeePerGas.sub(baseFee)

  if (maxPriorityFeePerGas.gte(leftover)) {
    // Miner gets leftover
    return leftover
  } else {
    // User gets refund, miner gets nothing
    return false
  }
}

function calculateMedianFee(fees) {
  if (fees.length === 0) return 0

  // Sort fees
  fees.sort((a, b) => a - b)

  const halfwayIndex = Math.floor(fees.length / 2)

  // If fees length is odd, return halfwayIndex fee
  if (fees.length % 2) return fees[halfwayIndex]

  // If fees length even, return average of two halfway fees
  return (fees[halfwayIndex - 1] + fees[halfwayIndex]) / 2
}

export function getMinerFeeAverages(transactions, baseFee) {
  let minerFeesInWei = []

  transactions.forEach(transaction => {
    const minerFee = calculateMinerFee(transaction, baseFee)

    if (minerFee) minerFeesInWei.push(minerFee.toNumber())
  })

  const sumOfMinerFeesInWei = minerFeesInWei.reduce(
    (partialSum, a) => partialSum + a,
    0
  )

  return {
    // Mean miner fee for block in gwei
    mean: sumOfMinerFeesInWei / transactions.length / 1_000_000_000,
    // Median miner fee for block in gwei
    median: calculateMedianFee(minerFeesInWei) / 1_000_000_000
  }
}

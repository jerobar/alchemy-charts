import { useEffect, useState } from 'react'

import { ethers } from 'ethers'
import { AppShell, Container, Card, Space, Title, Text } from '@mantine/core'

import { BaseFeeChart } from './components/BaseFeeChart'
import { MinerFeeChart } from './components/MinerFeeChart'
import { TokenChart } from './components/TokenChart'

export function App() {
  const [provider, setProvider] = useState(null)

  // Initialize ethers provider
  useEffect(() => {
    if (!provider) {
      const provider = new ethers.providers.AlchemyProvider(
        'homestead',
        'Jfww56qPimkBDLPOd6fPk_vFTZD1X6WQ'
      )

      setProvider(provider)
    }
  }, [provider])

  return (
    <AppShell padding={'md'}>
      <Container>
        <Space h={60} />
        <Card shadow={'sm'}>
          <Title order={2}>Ethereum Base Fee by Block Number</Title>
          <Space h={20} />
          <Text>Base fee shown in gwei. Refreshes every 15 seconds.</Text>
          <Space h={20} />
          <BaseFeeChart provider={provider} />
        </Card>
        <Space h={60} />
        <Card>
          <Title order={2}>Miner Fees by Block Number</Title>
          <Space h={20} />
          <MinerFeeChart provider={provider} />
        </Card>
        <Space h={60} />
        <Card>
          <Title order={2}>Wrapped BTC Transfers</Title>
          <Space h={20} />
          <Text>Total transfer volume of Wrapped BTC by block number.</Text>
          <Space h={20} />
          <TokenChart provider={provider} />
        </Card>
        <Space h={80} />
      </Container>
    </AppShell>
  )
}

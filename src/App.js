import { useEffect, useRef } from 'react'

import { ethers } from 'ethers'
import { AppShell, Container, Card, Space, Title, Text } from '@mantine/core'

import { BaseFeeChart } from './components/BaseFeeChart'
import { MinerFeeChart } from './components/MinerFeeChart'

function AppHeader() {
  return <div>AppHeader</div>
}

export function App() {
  const providerRef = useRef(null)

  // Initialize ethers provider
  useEffect(() => {
    if (!providerRef.current) {
      providerRef.current = new ethers.providers.AlchemyProvider(
        'homestead',
        'Jfww56qPimkBDLPOd6fPk_vFTZD1X6WQ'
      )
    }
  }, [providerRef])

  return (
    <AppShell header={<AppHeader />} padding={'md'}>
      <Container>
        <Space h={40} />
        <Card shadow={'sm'}>
          <Title order={2}>Ethereum Base Fee by Block Number</Title>
          <Space h={20} />
          <Text>Base fee shown in gwei. Refreshes every 15 seconds.</Text>
          <Space h={20} />
          <BaseFeeChart providerRef={providerRef} />
        </Card>
        <Space h={40} />
        <Card>
          <Title order={2}>Miner Fees by Block Number</Title>
          <Space h={20} />
          <MinerFeeChart providerRef={providerRef} />
        </Card>
      </Container>
    </AppShell>
  )
}

import { useEffect, useRef } from 'react'

import { ethers } from 'ethers'

import { BaseFeeChart } from './components/BaseFeeChart'

const API_URI =
  'https://eth-mainnet.g.alchemy.com/v2/Jfww56qPimkBDLPOd6fPk_vFTZD1X6WQ'

export function App() {
  const providerRef = useRef(null)
  const web3Ref = useRef(null)

  // Initialize ethers provider
  useEffect(() => {
    if (!providerRef.current) {
      const provider = new ethers.providers.AlchemyProvider(
        'homestead',
        'Jfww56qPimkBDLPOd6fPk_vFTZD1X6WQ'
      )
      providerRef.current = provider
    }
  }, [providerRef])

  return <BaseFeeChart providerRef={providerRef} />
}

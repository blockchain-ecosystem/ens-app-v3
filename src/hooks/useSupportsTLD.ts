import { useDnsSecEnabled } from './dns/useDnsSecEnabled'

export const useSupportsTLD = (name = '') => {
  const labels = name?.split('.') || []
  const tld = labels[labels.length - 1]

  const customTLDs = ['com', 'xyz', 'org', 'net', 'pik']

  const { data: isDnsSecEnabled, ...query } = useDnsSecEnabled({ name: tld })
  console.log('🚀 ~ useSupportsTLD ~ isDnsSecEnabled:', isDnsSecEnabled)

  return {
    data: tld === 'eth' || tld === '[root]' || customTLDs.includes(tld) || isDnsSecEnabled,
    ...query,
  }
}

import {
  GetAddressRecordReturnType,
  GetExpiryReturnType,
  GetOwnerReturnType,
  GetPriceReturnType,
  GetWrapperDataReturnType,
} from '@ensdomains/ensjs/public'
import { ParsedInputResult } from '@ensdomains/ensjs/utils'

import { emptyAddress } from './constants'

export type RegistrationStatus =
  | 'invalid'
  | 'registered'
  | 'gracePeriod'
  | 'premium'
  | 'available'
  | 'short'
  | 'imported'
  | 'owned'
  | 'notImported'
  | 'notOwned'
  | 'unsupportedTLD'
  | 'offChain'

/* eslint-disable @typescript-eslint/no-unused-vars */
export const getRegistrationStatus = ({
  timestamp,
  validation: { isETH, is2LD, isShort, type },
  ownerData,
  wrapperData,
  expiryData,
  priceData,
  addrData,
  supportedTLD,
  name,
}: {
  timestamp: number
  validation: Partial<Omit<ParsedInputResult, 'normalised' | 'isValid'>>
  ownerData?: GetOwnerReturnType
  wrapperData?: GetWrapperDataReturnType
  expiryData?: GetExpiryReturnType
  priceData?: GetPriceReturnType
  addrData?: GetAddressRecordReturnType
  supportedTLD?: boolean | null
  name?: string
}): RegistrationStatus => {
  /* eslint-enable @typescript-eslint/no-unused-vars */
  if (!supportedTLD) return 'unsupportedTLD'

  // Get TLD from name
  const labels = name?.split('.') || []
  const tld = labels[labels.length - 1]
  const customTLDs = ['com', 'xyz', 'org', 'net', 'pik', 'linhdevxin']
  const isCustomTLD = customTLDs.includes(tld)

  if ((isETH || isCustomTLD) && is2LD) {
    console.log("🚀 ~ isCustomTLD:", isCustomTLD)
    console.log("🚀 ~ expiryData111:", expiryData)
    if (expiryData && expiryData.expiry) {
      const { expiry: _expiry, gracePeriod } = expiryData
      const expiry = new Date(_expiry.date)
      if (expiry.getTime() > timestamp) {
        return 'registered'
      }
      if (expiry.getTime() + gracePeriod * 1000 > timestamp) {
        return 'gracePeriod'
      }
      const { premium } = priceData || { premium: 0n }
      if (premium > 0n) {
        return 'premium'
      }
    }
    return 'available'
  }

  if (ownerData && ownerData.owner !== emptyAddress) {
    if (is2LD) {
      return 'imported'
    }
    return 'owned'
  }

  if (type === 'name' && !is2LD) {
    if (addrData?.value && addrData.value !== emptyAddress) {
      return 'offChain'
    }
    return 'notOwned'
  }

  if (
    addrData?.value &&
    addrData.value !== '0x0000000000000000000000000000000000000020' &&
    addrData.value !== emptyAddress
  ) {
    return 'imported'
  }

  return 'notImported'
}

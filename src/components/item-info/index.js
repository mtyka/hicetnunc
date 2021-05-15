import React, { useContext } from 'react'
import { PATH } from '../../constants'
import { Button, Primary, Purchase } from '../button'
import { HicetnuncContext } from '../../context/HicetnuncContext'
import { walletPreview } from '../../utils/string'
import styles from './styles.module.scss'

const _ = require('lodash')

export const ItemInfo = ({
  token_id,
  token_info,
  owners,
  swaps,
  // transfered,
  feed,
  // total_amount,
  hDAO_balance,
  isDetailView,
}) => {
  const { syncTaquito, collect, curate, claim_hDAO, acc } = useContext(
    HicetnuncContext
  )
  const reducer = (accumulator, currentValue) =>
    parseInt(accumulator) + parseInt(currentValue)

  // subtract burned pieces from total
  let total = 0

  try {
    total =
      _.values(owners).length !== 0 ? _.values(owners).reduce(reducer) : 'X'
    total = _.keys(owners).includes('tz1burnburnburnburnburnburnburjAYjjX')
      ? total - owners['tz1burnburnburnburnburnburnburjAYjjX']
      : total
  } catch (e) {
    total =
      _.values(owners).length !== 0 ? _.values(owners).reduce(reducer) : 'X'
  }

  let ed =
    swaps.length !== 0 ? swaps.map((e) => e.objkt_amount).reduce(reducer) : 'X'
  let s = _.minBy(swaps, (o) => Number(o.xtz_per_objkt))
  let maxPrice = _.maxBy(swaps, (o) => Number(o.xtz_per_objkt))

  var message = ''

  try {
    message =
      swaps[0] !== undefined
        ? 'collect for ' + Number(s.xtz_per_objkt) / 1000000 + ' tez'
        : 'not for sale'
  } catch (e) {
    message = 'not for sale'
  }

  const handleCollect = () => {
    if (acc == null) {
      syncTaquito()
    } else {
      collect(1, s.swap_id, s.xtz_per_objkt * 1)
    }
  }

  const curateOrClaim = (id, balance = 0) => {
    // if user is creator and there's hDAO balance
    if (acc.address === token_info.creators[0] && balance > 0) {
      claim_hDAO(balance, id)
    } else {
      curate(id)
    }
  }

  const renderHDAObutton = (id, balance) => {
    return (
      <Button onClick={() => curateOrClaim(id, balance)}>
        <Primary>〇{balance ? `(${hDAO_balance})` : ''}</Primary>
      </Button>
    )
  }

  const renderVerification = () => {
    if(!token_info ||
       !token_info.creator_metadata ||
       !token_info.creator_metadata.data) return "";
    const data = token_info.creator_metadata.data;
    let alias = "";
    if (data.twitter) alias += `@${data.twitter}`;
    if (data.alias) alias += `  (${data.alias})`;
    return alias || " !!UNVERIFIED!!";
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.edition}>
          <div className={styles.inline}>
            <p>Issuer:&nbsp;</p>
            <Button to={`${PATH.ISSUER}/${token_info.creators[0]}`}>
              <Primary>{walletPreview(token_info.creators[0])} {renderVerification()}</Primary>
            </Button>
          </div>
          {!feed && (
            <div>
              <p>
                <span>
                  Editions:
                  <span>
                    {ed}/{total}
                  </span>
                </span>
              </p>
              {false && (
                <p>
                  Price range: {(Number(s.xtz_per_objkt) / 1000000).toFixed(2)}-
                  {(Number(maxPrice.xtz_per_objkt) / 1000000).toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.container}>
        {isDetailView ? (
          <p>OBJKT#{token_id}</p>
        ) : (
          <Button to={`${PATH.OBJKT}/${token_id}`} disabled={isDetailView}>
            <Primary>OBJKT#{token_id}</Primary>
          </Button>
        )}
        {feed ? (
          <div>{renderHDAObutton(token_id, hDAO_balance)}</div>
        ) : (
          <Button onClick={() => handleCollect()}>
            <Purchase>{message}</Purchase>
          </Button>
        )}
      </div>
      <div className={styles.container}>
        {!feed && <div>{renderHDAObutton(token_id, hDAO_balance)}</div>}
      </div>
    </>
  )
}

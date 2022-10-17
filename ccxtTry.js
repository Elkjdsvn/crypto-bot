import ccxt from 'ccxt';
import { ftxKey, ftxSecret } from './keys.js'

const ftxExchange = new ccxt.ftx({
    'apiKey': ftxKey,
    'secret': ftxSecret
})

const currencyEth = 'ETH-PERP'
const currencyAtom = 'ATOM-PERP'
const initialDepositVar = 50
const marketLoading = await ftxExchange.loadMarkets()
const subaccountVar = "les thunes"

const currencyPrice = async (currency) => {
    const resultPrice = ftxExchange.market(currency)
    return resultPrice.info['price']
}

// const usdBalance = async () => {
//     const balances = await ftxExchange.fetchBalance()
//     return balances.USD
// }

const lastBuyingOrder = async (currency, subaccount = '') => {
    const params = subaccount ? {'side': 'buy', 'subaccount': `${subaccount}`} : {'side': 'buy'}
    const orders = await ftxExchange.fetchOrders(currency, 0, 1, params)
    const ordersBuyPrice = orders[0]?.info?.avgFillPrice
    if (ordersBuyPrice === undefined) {
        return 0
    } else {
        return ordersBuyPrice
    }
}

const tryBuying = async (currency, subaccount = '', fiatAmount, currentPrice) => {
    try {
        const amountToBuy = fiatAmount/currentPrice
        const params = subaccount ? {'subaccount': `${subaccount}`} : undefined
        const result = await ftxExchange.createMarketOrder(currency, 'buy', amountToBuy, params)
        return console.log(result)
    } 
    catch (e) {
        console.log(e)
    }
}

const shouldIBuy = async (currency, subaccount = '') => {
    if (await currencyPrice(currency) < await lastBuyingOrder(currency, subaccount) * 0.98) {
        return false
    } else {
        return true
    }
}

const placeStopLoss = async (currency, subaccount = '', amount, price, triggerPrice) => {
    const params = subaccount ? {'subaccount': `${subaccount}`, 'triggerPrice': `${triggerPrice}`} : {'triggerPrice': `${triggerPrice}`}
    const stopLossResult = await ftxExchange.createOrder(currency, 'market', 'sell', amount, price, params)
    return console.log(stopLossResult)
}

const ftxBot = async (currency, subaccount, initialDeposit) => {
    const currentPrice = await currencyPrice(currency)
    const lastOrderInfos = await lastBuyingOrder(currency, subaccount)

    if (await shouldIBuy(currency, subaccount) === true) {
        await tryBuying(currency, subaccount, initialDeposit, currentPrice)
    }
}

// console.log(await currencyPrice(currencyEth), await lastBuyingOrder(currencyEth) * 1.005)
// ftxBot(currencyEth)
placeStopLoss(currencyEth, undefined, 0.01, undefined, 1325.5)
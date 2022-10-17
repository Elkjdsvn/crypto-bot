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

const lastBuyingPrice = async (currency, subaccount = '') => {
    const params = subaccount ? {'side': 'buy', 'subaccount': `${subaccount}`} : {'side': 'buy'}
    const orders = await ftxExchange.fetchOrders(currency, 0, 1, params)
    const ordersBuyPrice = orders[0]?.info?.avgFillPrice
    if (ordersBuyPrice === undefined) {
        return 0
    } else {
        return ordersBuyPrice
    }
}

const tryBuying = async (currency, subaccount = '', initialDeposit, currentPrice) => {
    try {
        const amountToBuy = initialDeposit/currentPrice
        const params = subaccount ? {'subaccount': `${subaccount}`} : undefined
        const result = await ftxExchange.createMarketOrder(currency, 'buy', amountToBuy, params)
        return console.log(result)
    } 
    catch (e) {
        console.log(e)
    }
}

const shouldIBuy = async (currency, subaccount = '') => {
    if (await currencyPrice(currency) < await lastBuyingPrice(currency, subaccount) * 0.98) {
        return false
    } else {
        return true
    }
}

const ftxBot = async (currency, subaccount, initialDeposit) => {
    const currentPrice = await currencyPrice(currency)
    if (await shouldIBuy(currency, subaccount) === true) {
        await tryBuying(currency, subaccount, initialDeposit, currentPrice)
    }
}

console.log(await currencyPrice(currencyEth), await lastBuyingPrice(currencyEth) * 1.005)
ftxBot(currencyEth)
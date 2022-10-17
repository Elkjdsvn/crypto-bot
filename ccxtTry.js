import ccxt from 'ccxt';
import { ftxKey, ftxSecret } from './keys.js'

const ftxExchange = new ccxt.ftx({
    'apiKey': ftxKey,
    'secret': ftxSecret
})

const currencyEth = 'ETH-PERP'
const marketLoading = await ftxExchange.loadMarkets()

const currencyPrice = async (currency) => {
    const resultPrice = ftxExchange.market(currency)
    return resultPrice.info['price']
}

const lastBuyingOrder = async (currency, subaccount = '') => {
    const params = subaccount ? {'side': 'buy', 'subaccount': `${subaccount}`} : {'side': 'buy'}
    const orders = await ftxExchange.fetchOrders(currency, 0, 1, params)
    const buyPrice = orders[0]?.info?.avgFillPrice
    const buyAmount = orders[0]?.info?.size
    if (buyPrice === undefined) {
        return 0
    } else {
        return {buyPrice: buyPrice, buyAmount}
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

const placeStopLoss = async (currency, subaccount = '', amount, price, stopLossPrice) => {
    const params = subaccount ? {'subaccount': `${subaccount}`, 'stopLossPrice': `${stopLossPrice}`} : {'stopLossPrice': `${stopLossPrice}`}
    return await ftxExchange.createOrder(currency, 'market', 'sell', amount, price, params)
}

const ftxBot = async (currency, subaccount, initialDeposit) => {

    const currentPrice = await currencyPrice(currency)
    const lastOrderInfos = await lastBuyingOrder(currency, subaccount)

    if (lastOrderInfos.buyPrice * 1.01 < currentPrice) {
        await placeStopLoss(currency, subaccount, lastOrderInfos.buyAmount, undefined, lastOrderInfos.buyPrice * 1.005)
        await tryBuying(currency, subaccount, initialDeposit, currentPrice)
    }
}



setInterval(ftxBot(currencyEth, '', 45), 300000)
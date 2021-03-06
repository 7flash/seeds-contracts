const Eos = require('eosjs')
const R = require('ramda')

const networks = {
  mainnet: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  jungle: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
  kylin: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
  local: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
  telosTestnet: 'e17615decaecd202a365f4c029f206eee98511979de8a5756317e2469f2289e3',
  telosMainnet: '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11'
}

const endpoints = {
  local: 'http://0.0.0.0:8888',
  kylin: 'http://kylin.fn.eosbixin.com',
  telosTestnet: 'https://testnet.eos.miami',
  telosMainnet: 'https://api.eos.miami'
}

const ownerAccounts = {
  local: 'owner',
  kylin: 'seedsowner11',
  telosTestnet: 'seedsharvest',
  telosMainnet: 'seedsharvest'
}

const {
  EOSIO_NETWORK,
  EOSIO_API_ENDPOINT,
  EOSIO_CHAIN_ID
} = process.env

const chainId = EOSIO_CHAIN_ID || networks[EOSIO_NETWORK] || networks.local
const httpEndpoint = EOSIO_API_ENDPOINT || endpoints[EOSIO_NETWORK] || endpoints.local
const owner = ownerAccounts[EOSIO_NETWORK] || ownerAccounts.local

const account = (accountName) => ({
  type: 'account',
  account: accountName,
  creator: owner,
  publicKey: 'EOS8Do4YTkSrLTVLvZxtKwp1fVBnHsJa3KnLkcANHjnXAFQ3B5EzF',
  stakes: {
    cpu: '1.0000 TLOS',
    net: '1.0000 TLOS',
    ram: 10000
  },
  quantity: '1000.0000 SEEDS'
})

const contract = (accountName, contractName) => ({
  ...account(accountName),
  type: 'contract',
  name: contractName,
  stakes: {
    cpu: '5.0000 TLOS',
    net: '5.0000 TLOS',
    ram: 400000
  }
})

const accountsMetadata = (network) => {
  if (network == networks.local) {
    return {
      owner: account(owner),
      firstuser: account('firstuser'),
      seconduser: account('seconduser'),
      thirduser: account('thirduser'),
      application: account('application'),
      bank: account('bank'),
      accounts: contract('accounts', 'accounts'),
      harvest: contract('harvest', 'harvest'),
      subscription: contract('subscription', 'subscription'),
      settings: contract('settings', 'settings'),
      proposals: contract('proposals', 'proposals'),
      token: {
        ...contract('token'),
        name: 'eosio.token',
        issuer: owner,
        supply: '1000000.0000 SEEDS',
      }
    }
  } else if (network == networks.kylin) {
    return {
      owner: account(owner),
      firstuser: account('seedsuser444'),
      seconduser: account('seedsuser555'),
      thirduser: account('seedsuser333'),
      application: account('seedsapp2222'),
      bank: account('seedsbank222'),
      accounts: contract('seedsaccnts3', 'accounts'),
      harvest: contract('seedshrvst11', 'harvest'),
      subscription: contract('seedssubs222', 'subscription'),
      settings: contract('settings11', 'settings'),
      proposals: contract('proposals11', 'proposals'),
      token: {
        ...contract('seedstoken12', 'eosio.token'),
        issuer: owner,
        supply: '100000000.0000 SEEDS'
      }
    }
  } else if (network == networks.telosMainnet) {
    return {
      owner: account(owner),
      firstuser: account('seedsuser444'),
      seconduser: account('seedsuser555'),
      thirduser: account('seedsuser333'),
      application: account('seedsapp2222'),
      bank: account('seedsbank222'),
      accounts: contract('seedsaccnts3', 'accounts'),
      harvest: contract('seedshrvst11', 'harvest'),
      subscription: contract('seedssubs222', 'subscription'),
      settings: contract('seedsettings', 'settings'),
      proposals: contract('seedsprops12', 'proposals'),
      token: {
        ...contract('seedstoken12', 'eosio.token'),
        issuer: owner,
        supply: '100000000.0000 SEEDS'
      }
    }
  } else {
    throw new Error(`${network} is not supported network`)
  }
}

const accounts = accountsMetadata(chainId)
const names = R.mapObjIndexed((item) => item.account, accounts)

const config = {
  keyProvider: ['5KJhdyBnd4cfW4o1Bynu8zUnSi4TGwZ1nxhuYLX7ryBjAxEAYX9', '5JViN9Jck32dG5JZqxLKYGHgd1AazQBByb9yTju1YHDMjHgi5Ro'],
  httpEndpoint,
  chainId
}

const eos = Eos(config)

const encodeName = Eos.modules.format.encodeName
const decodeName = Eos.modules.format.decodeName
const getTableRows = eos.getTableRows

const getBalance = async (user) => {
  const balance = await eos.getCurrencyBalance(names.token, user, 'SEEDS')
  return Number.parseInt(balance[0])
}

const initContracts = (accounts) =>
  Promise.all(
    Object.values(accounts).map(
      account => eos.contract(account)
    )
  ).then(
    contracts => Object.assign({}, ...Object.keys(accounts).map(
      (account, index) => ({
        [account]: contracts[index]
      })
    ))
  )

module.exports = {
  eos, encodeName, decodeName, getBalance, getTableRows, initContracts,
  accounts, names
}

# BUSDPlanet 

## Testing

```
1. Total supply equal to what you set.
2. Transfer to wallets that are excluded and not excluded from fee
3. Make sure adding liquidity works
4. Check that the fees are sent to appropriate wallets correctly
5. Make sure swap and liquify works

```

## Editing

```
1. Add events to all the set functions
2. Add require statements where you check that for example old claimWait is not equal to new claimWait 
3. Make the dividend token editable. We need to have possibility to change busd to usdt for example if it fuck ups
```


## Slither 
```
{
    "detectors_to_run": "",
    "filter_paths": "contracts/mocks"
  }
  
```
## SetUp
Clone repo into your machine
```
git clone https://github.com/nmsteve/BUSDPlanet.git

```
Install node modules
```
npm i
```
## Run test

1. Get [Alchemly](https://www.alchemy.com/) Goerli node access URL. 
2. Rename .env copy to .env
3. Enter the URL 
4. Run test with below command

```
npx hardhat test --network hardhat
```
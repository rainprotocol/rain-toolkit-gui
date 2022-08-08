import { ethers, Signer } from "ethers";;
import { parseUnits } from "ethers/lib/utils";
import {
  Sale,
  PriceCurve,
  FixedPrice,
  vLBP,
  IncDecPrice,
  BetweenTimestamps,
  BuyAmount,
  SaleVmFrom
} from 'rain-sdk'

export enum selectSale {
  fixedPrice,
  vLBP,
  increasingPrice,
}

export type SaleParams = {
  inputValues: any;
  saleType: number;
  maxCapMode: boolean;
  minCapMode: boolean;
  canEndMode: boolean;
  extraTimeDiscountMode: boolean;
  tierDiscountMode: boolean;
  tierDiscountActMode: boolean;
  tierCapMulMode: boolean;
  tierCapMulActMode: boolean;
  afterMinimumRaiseMode: boolean;
};

export const saleStatuses = ["Pending", "Active", "Success", "Fail"];


export function getSaleDuration(config: SaleParams, deployerAddress: string) {

  const _saleTime_ = new BetweenTimestamps(config.inputValues.startTimestamp, config.inputValues.endTimestamp)

  if (config.extraTimeDiscountMode) {
    _saleTime_.applyExtraTime(
      config.inputValues.extraTime,
      config.inputValues.extraTimeAmount,
      config.inputValues.reserveErc20?.erc20decimals
    )
  }
  else if (config.afterMinimumRaiseMode) {
    _saleTime_.afterMinimumRaise(
      config.inputValues.minimumRaise,
      config.inputValues.reserveErc20?.erc20decimals
    )
  }
  return _saleTime_;
}


export function calculatePriceConfig(config: SaleParams) {

  const saleSelector = (): PriceCurve => {

    //if sale is a Fixed Price
    if (config.saleType == selectSale.fixedPrice) {
      return new FixedPrice(
        config.inputValues.startPrice,
        config.inputValues.reserveErc20?.erc20decimals
      )
    }

    //if sale is a vLBP
    if (config.saleType == selectSale.vLBP) {
      return new vLBP(
        config.inputValues.startPrice,
        config.inputValues.startTimestamp,
        config.inputValues.endTimestamp,
        config.inputValues.minimumRaise,
        config.inputValues.initialSupply,
        config.inputValues.reserveErc20?.erc20decimals
      )
    }

    //if sale is a Linear Increasing Price
    if (config.saleType == selectSale.increasingPrice) {
      return new IncDecPrice(
        config.inputValues.startPrice,
        config.inputValues.endPrice,
        config.inputValues.startTimestamp,
        config.inputValues.endTimestamp,
        config.inputValues.reserveErc20?.erc20decimals
      )
    }
  }

  //creating the sale PriceCurve instance
  const _sale_: PriceCurve = saleSelector();

  //if extra time discount is enabled
  if (config.extraTimeDiscountMode) {
    _sale_.applyExtraTimeDiscount(
      config.inputValues.endTimestamp,
      config.inputValues.extraTimeDiscountThreshold,
      config.inputValues.extraTimeDiscount
    )
  }

  //if tier Discount is enabled
  if (config.tierDiscountMode) {
    //if tierActivation is enabled
    if (config.tierDiscountActMode) {
      _sale_.applyTierDiscount(
        config.inputValues.tierDiscountAddress,
        [
          config.inputValues.discountTier1,
          config.inputValues.discountTier2,
          config.inputValues.discountTier3,
          config.inputValues.discountTier4,
          config.inputValues.discountTier5,
          config.inputValues.discountTier6,
          config.inputValues.discountTier7,
          config.inputValues.discountTier8
        ],
        {
          tierActivation: [
            config.inputValues.discountActTier1,
            config.inputValues.discountActTier2,
            config.inputValues.discountActTier3,
            config.inputValues.discountActTier4,
            config.inputValues.discountActTier5,
            config.inputValues.discountActTier6,
            config.inputValues.discountActTier7,
            config.inputValues.discountActTier8
          ],
          tierContext: []
        }
      )
    }
    else {
      _sale_.applyTierDiscount(
        config.inputValues.tierDiscountAddress,
        [
          config.inputValues.discountTier1,
          config.inputValues.discountTier2,
          config.inputValues.discountTier3,
          config.inputValues.discountTier4,
          config.inputValues.discountTier5,
          config.inputValues.discountTier6,
          config.inputValues.discountTier7,
          config.inputValues.discountTier8
        ]
      )
    }
  }

  return _sale_;

}

export const getBuyWalletCap = (config: SaleParams) => {

  const BuyCap = new BuyAmount()

  //if both Min and Max Cap Per Wallet are enabled
  if (config.maxCapMode && config.minCapMode) {
    //if Max cap tier Multiplier is enabled
    if (config.tierCapMulMode) {
      //if tierActivation is enabled
      if (config.tierCapMulActMode) {
        BuyCap.applyWalletCap(
          2,
          {
            maxWalletCap: config.inputValues.maxWalletCap,
            minWalletCap: config.inputValues.minWalletCap,
            tierAddress: config.inputValues.tierCapMulAddress,
            tierMultiplier: [
              config.inputValues.capMulTier1,
              config.inputValues.capMulTier2,
              config.inputValues.capMulTier3,
              config.inputValues.capMulTier4,
              config.inputValues.capMulTier5,
              config.inputValues.capMulTier6,
              config.inputValues.capMulTier7,
              config.inputValues.capMulTier8
            ],
            tierActivation: [
              config.inputValues.capMulActTier1,
              config.inputValues.capMulActTier2,
              config.inputValues.capMulActTier3,
              config.inputValues.capMulActTier4,
              config.inputValues.capMulActTier5,
              config.inputValues.capMulActTier6,
              config.inputValues.capMulActTier7,
              config.inputValues.capMulActTier8
            ],
            tierContext: []
          }
        )
      }
      else {
        BuyCap.applyWalletCap(
          2,
          {
            maxWalletCap: config.inputValues.maxWalletCap,
            minWalletCap: config.inputValues.minWalletCap,
            tierAddress: config.inputValues.tierCapMulAddress,
            tierMultiplier: [
              config.inputValues.capMulTier1,
              config.inputValues.capMulTier2,
              config.inputValues.capMulTier3,
              config.inputValues.capMulTier4,
              config.inputValues.capMulTier5,
              config.inputValues.capMulTier6,
              config.inputValues.capMulTier7,
              config.inputValues.capMulTier8
            ],
            tierContext: []
          }
        )
      }
    }
    else {
      BuyCap.applyWalletCap(
        2,
        {
          maxWalletCap: config.inputValues.maxWalletCap,
          minWalletCap: config.inputValues.minWalletCap,
          tierContext: []
        }
      )
    }
  }

  //if only Max cap per wallet is enabled
  if (config.maxCapMode && !config.minCapMode) {
    //if tier Multiplier is enabled
    if (config.tierCapMulMode) {
      //if tierActivation is enabled
      if (config.tierCapMulActMode) {
        BuyCap.applyWalletCap(
          1,
          {
            maxWalletCap: config.inputValues.maxWalletCap,
            tierAddress: config.inputValues.tierCapMulAddress,
            tierMultiplier: [
              config.inputValues.capMulTier1,
              config.inputValues.capMulTier2,
              config.inputValues.capMulTier3,
              config.inputValues.capMulTier4,
              config.inputValues.capMulTier5,
              config.inputValues.capMulTier6,
              config.inputValues.capMulTier7,
              config.inputValues.capMulTier8
            ],
            tierActivation: [
              config.inputValues.capMulActTier1,
              config.inputValues.capMulActTier2,
              config.inputValues.capMulActTier3,
              config.inputValues.capMulActTier4,
              config.inputValues.capMulActTier5,
              config.inputValues.capMulActTier6,
              config.inputValues.capMulActTier7,
              config.inputValues.capMulActTier8
            ]
          }
        )
      }
      else {
        BuyCap.applyWalletCap(
          1,
          {
            maxWalletCap: config.inputValues.maxWalletCap,
            tierAddress: config.inputValues.tierCapMulAddress,
            tierMultiplier: [
              config.inputValues.capMulTier1,
              config.inputValues.capMulTier2,
              config.inputValues.capMulTier3,
              config.inputValues.capMulTier4,
              config.inputValues.capMulTier5,
              config.inputValues.capMulTier6,
              config.inputValues.capMulTier7,
              config.inputValues.capMulTier8
            ]
          }
        )
      }
    }
    else {
      BuyCap.applyWalletCap(
        1,
        { maxWalletCap: config.inputValues.maxWalletCap }
      )
    }
  }

  //if only Min Cap Per Wallet is enabled
  if (!config.maxCapMode && config.minCapMode) {
    BuyCap.applyWalletCap(
      0,
      { minWalletCap: config.inputValues.minWalletCap }
    )
  }

  return BuyCap;
}

export const getVMStateConfig = (config: SaleParams, deployerAddress: string) => {
  const saleDuration = getSaleDuration(config, deployerAddress);
  const applyWalletCap = getBuyWalletCap(config);
  const price = calculatePriceConfig(config);

  const vmStateConfig = new SaleVmFrom(saleDuration, applyWalletCap, price)

  return vmStateConfig;
}


export const saleDeploy = async (
  deployer: Signer,
  deployerAddress: string,
  config: SaleParams,
  ...args
): Promise<Sale> => {

  const newSale = Sale.deploy(
    deployer,
    {
      // canStartStateConfig: config.creatorControlMode
      //   ? new BetweenTimestamps(config.inputValues.startTimestamp).applyOwnership(deployerAddress)
      //   : new BetweenTimestamps(config.inputValues.startTimestamp),
      // canEndStateConfig: canEndConfig(config, deployerAddress),
      // calculatePriceStateConfig: calculatePriceConfig(config),
      vmStateConfig: getVMStateConfig(config, deployerAddress),
      recipient: config.inputValues.recipient,
      reserve: config.inputValues.reserve,
      saleTimeout: 10,
      cooldownDuration: parseInt(config.inputValues.cooldownDuration),
      minimumRaise: parseUnits(
        config.inputValues.minimumRaise.toString(),
        config.inputValues.reserveErc20?.erc20decimals
      ),
      dustSize: 0,
    },
    {
      erc20Config: {
        name: config.inputValues.name,
        symbol: config.inputValues.symbol,
        distributor: ethers.constants.AddressZero,
        initialSupply: parseUnits(config.inputValues.initialSupply.toString()),
      },
      tier: config.inputValues.tier,
      minimumTier: config.inputValues.minimumStatus,
      distributionEndForwardingAddress: config.inputValues.distributionEndForwardingAddress,
    }
  )
  return newSale
}
package com.example.wallet

import android.content.Context
import android.util.Log
import com.example.model.Product
import com.example.model.RewardType

class WalletManager(private val context: Context) {

    interface WalletListener {
        fun onRewardDelivered(product: Product, rewardType: RewardType, rewardAmount: Long)
    }

    private var listener: WalletListener? = null

    fun setWalletListener(listener: WalletListener) {
        this.listener = listener
    }

    fun deliverReward(product: Product): Boolean {
        Log.i("WalletManager", "Delivering reward for product: ${product.id}, type: ${product.rewardType}, amount: ${product.rewardAmount}")
        
        when (product.rewardType) {
            RewardType.COIN -> {
                // Deliver Coins
                listener?.onRewardDelivered(product, RewardType.COIN, product.rewardAmount)
            }
            RewardType.GEM -> {
                // Deliver Gems
                listener?.onRewardDelivered(product, RewardType.GEM, product.rewardAmount)
            }
            RewardType.ENERGY -> {
                // Deliver Energy Refill
                listener?.onRewardDelivered(product, RewardType.ENERGY, product.rewardAmount)
            }
            RewardType.VIP -> {
                // Deliver VIP Pass
                listener?.onRewardDelivered(product, RewardType.VIP, product.rewardAmount)
            }
            RewardType.MEGA_PACK -> {
                // Deliver Mega Pack (5M coins + 1000 gems + 10000 XP)
                listener?.onRewardDelivered(product, RewardType.MEGA_PACK, product.rewardAmount)
            }
        }
        return true
    }
}

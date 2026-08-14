package com.example.model

import org.json.JSONObject

enum class RewardType {
    COIN,
    GEM,
    ENERGY,
    VIP,
    MEGA_PACK
}

data class Product(
    val id: String,
    val sku: String = id,
    val priceRials: Long,
    val farsiTitle: String,
    val farsiDescription: String,
    val rewardType: RewardType,
    val rewardAmount: Long,
    val isConsumable: Boolean = true,
    val isActive: Boolean = true,
    val icon: String = "💰",
    val badge: String? = null
) {
    fun getFormattedPriceRials(): String {
        return String.format("%,d ریال", priceRials)
    }

    fun getFormattedPriceTomans(): String {
        val tomans = priceRials / 10
        return String.format("%,d تومان", tomans)
    }

    fun toJsonObject(): JSONObject {
        return JSONObject().apply {
            put("id", id)
            put("sku", sku)
            put("priceRials", priceRials)
            put("formattedPriceRials", getFormattedPriceRials())
            put("formattedPriceTomans", getFormattedPriceTomans())
            put("farsiTitle", farsiTitle)
            put("farsiDescription", farsiDescription)
            put("rewardType", rewardType.name)
            put("rewardAmount", rewardAmount)
            put("isConsumable", isConsumable)
            put("isActive", isActive)
            put("icon", icon)
            put("badge", badge ?: "")
        }
    }
}

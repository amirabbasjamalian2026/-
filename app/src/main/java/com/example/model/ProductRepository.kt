package com.example.model

import org.json.JSONArray

object ProductRepository {

    val PRODUCTS = listOf(
        Product(
            id = "bundle_mega_pack",
            sku = "bundle_mega_pack",
            priceRials = 500000,
            farsiTitle = "بسته فوق‌العاده",
            farsiDescription = "شامل ۵,۰۰۰,۰۰۰ سکه + ۱,۰۰۰ الماس + ۱۰,۰۰۰ تجربه",
            rewardType = RewardType.MEGA_PACK,
            rewardAmount = 1,
            isConsumable = true,
            icon = "🎁",
            badge = "پیشنهاد ویژه"
        )
    )

    fun findById(productId: String): Product? {
        return PRODUCTS.firstOrNull { it.id == productId || it.sku == productId }
    }

    fun getAllProductsJson(): String {
        val jsonArray = JSONArray()
        PRODUCTS.filter { it.isActive }.forEach { product ->
            jsonArray.put(product.toJsonObject())
        }
        return jsonArray.toString()
    }
}

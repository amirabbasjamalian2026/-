package com.example.bridge

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.example.billing.BillingManager
import com.example.model.Product
import com.example.model.ProductRepository
import com.example.model.RewardType
import com.example.wallet.WalletManager
import ir.myket.billingclient.util.Purchase
import org.json.JSONObject

class ShopJavascriptInterface(
    private val activity: Activity,
    private val webView: WebView,
    private val billingManager: BillingManager,
    private val walletManager: WalletManager
) : BillingManager.BillingCallback, WalletManager.WalletListener {

    companion object {
        private const val TAG = "ShopBridge"
    }

    private val mainHandler = Handler(Looper.getMainLooper())

    init {
        billingManager.setBillingCallback(this)
        walletManager.setWalletListener(this)
    }

    @JavascriptInterface
    fun getProductsJson(): String {
        return ProductRepository.getAllProductsJson()
    }

    @JavascriptInterface
    fun requestPurchase(productId: String) {
        Log.i(TAG, "JS requested purchase for product ID: $productId")
        mainHandler.post {
            billingManager.launchPurchaseFlow(activity, productId)
        }
    }

    @JavascriptInterface
    fun purchase(productId: String) {
        requestPurchase(productId)
    }

    @JavascriptInterface
    fun checkBillingStatus(): String {
        val isOnline = billingManager.isOnline()
        val json = JSONObject().apply {
            put("isOnline", isOnline)
            put("isAvailable", isOnline)
            put("message", if (isOnline) "اتصال اینترنت برقرار است." else "اتصال اینترنت برقرار نیست.")
        }
        return json.toString()
    }

    @JavascriptInterface
    fun restorePurchases() {
        Log.i(TAG, "JS requested restore purchases")
        mainHandler.post {
            billingManager.queryUnconsumedPurchases()
        }
    }

    @JavascriptInterface
    fun isOnline(): Boolean {
        return billingManager.isOnline()
    }

    @JavascriptInterface
    fun openMyket(usernameOrUrl: String = "amirabbasjamalian"): Boolean {
        val username = if (usernameOrUrl.contains("myket.ir/user/")) {
            usernameOrUrl.substringAfter("myket.ir/user/").trimEnd('/')
        } else if (usernameOrUrl.contains("myket.ir/developer/")) {
            usernameOrUrl.substringAfter("myket.ir/developer/").trimEnd('/')
        } else if (usernameOrUrl.startsWith("myket://user/")) {
            usernameOrUrl.substringAfter("myket://user/").trimEnd('/')
        } else if (usernameOrUrl.startsWith("myket://developer/")) {
            usernameOrUrl.substringAfter("myket://developer/").trimEnd('/')
        } else {
            usernameOrUrl.trim()
        }

        val myketUserUri = android.net.Uri.parse("myket://user/$username")
        val myketDevUri = android.net.Uri.parse("myket://developer/$username")

        // ۱. تلاش با پکیج رسمی مایکت و دیپ‌لینک کاربری
        try {
            val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, myketUserUri).apply {
                setPackage("ir.mservices.market")
                addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            activity.startActivity(intent)
            return true
        } catch (e1: Exception) {
            // ۲. تلاش با پکیج رسمی مایکت و دیپ‌لینک توسعه‌دهنده
            try {
                val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, myketDevUri).apply {
                    setPackage("ir.mservices.market")
                    addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                activity.startActivity(intent)
                return true
            } catch (e2: Exception) {
                // ۳. تلاش با دیپ‌لینک عمومی بدون محدودیت پکیج
                try {
                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, myketUserUri).apply {
                        addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    activity.startActivity(intent)
                    return true
                } catch (e3: Exception) {
                    mainHandler.post {
                        android.widget.Toast.makeText(activity, "لطفاً برنامه مایکت را روی دستگاه خود نصب کنید.", android.widget.Toast.LENGTH_LONG).show()
                    }
                    return false
                }
            }
        }
    }

    @JavascriptInterface
    fun openUrl(url: String): Boolean {
        if (url.contains("myket.ir") || url.startsWith("myket://")) {
            return openMyket(url)
        }
        return try {
            val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url)).apply {
                addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            activity.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error opening external URL: $url", e)
            false
        }
    }

    // BillingManager.BillingCallback implementation
    override fun onBillingSetupFinished(isAvailable: Boolean, message: String) {
        runOnJs("if (window.onShopBillingStatusChanged) window.onShopBillingStatusChanged($isAvailable, '${escapeJs(message)}');")
    }

    override fun onPurchaseSuccess(product: Product, purchase: Purchase) {
        val msg = "پرداخت با موفقیت انجام شد! ${product.farsiTitle} به موجودی شما اضافه گردید. 💰"
        val token = purchase.token ?: "token"
        val jsCall = """
            if (window.onPaymentSuccess) window.onPaymentSuccess('${escapeJs(token)}');
            if (window.onShopPurchaseSuccess) window.onShopPurchaseSuccess('${product.id}', '${product.rewardType.name}', ${product.rewardAmount}, '${escapeJs(product.farsiTitle)}', '${escapeJs(msg)}');
        """.trimIndent()
        runOnJs(jsCall)
    }

    override fun onPurchaseFailed(productId: String, errorMessage: String) {
        val jsCall = """
            if (window.onPaymentFailed) window.onPaymentFailed('${escapeJs(errorMessage)}');
            if (window.onShopPurchaseError) window.onShopPurchaseError('$productId', '${escapeJs(errorMessage)}');
        """.trimIndent()
        runOnJs(jsCall)
    }

    override fun onPurchaseCanceled(productId: String) {
        val jsCall = """
            if (window.onPaymentFailed) window.onPaymentFailed('پرداخت انجام نشد یا توسط کاربر لغو گردید.');
            if (window.onShopPurchaseCanceled) window.onShopPurchaseCanceled('$productId');
        """.trimIndent()
        runOnJs(jsCall)
    }

    // WalletManager.WalletListener implementation
    override fun onRewardDelivered(product: Product, rewardType: RewardType, rewardAmount: Long) {
        val jsCall = "if (window.onShopRewardDelivered) window.onShopRewardDelivered('${product.id}', '${rewardType.name}', $rewardAmount);"
        runOnJs(jsCall)
    }

    private fun runOnJs(script: String) {
        mainHandler.post {
            try {
                webView.evaluateJavascript(script, null)
            } catch (e: Exception) {
                Log.e(TAG, "Error evaluating JS script", e)
            }
        }
    }

    private fun escapeJs(text: String): String {
        return text.replace("'", "\\'")
            .replace("\"", "\\\"")
            .replace("\n", " ")
            .replace("\r", "")
    }
}

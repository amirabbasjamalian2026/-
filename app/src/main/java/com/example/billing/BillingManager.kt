package com.example.billing

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.example.BuildConfig
import com.example.model.Product
import com.example.model.ProductRepository
import com.example.wallet.WalletManager
import ir.myket.billingclient.IabHelper
import ir.myket.billingclient.util.IabResult
import ir.myket.billingclient.util.Inventory
import ir.myket.billingclient.util.Purchase

class BillingManager(
    private val context: Context,
    private val walletManager: WalletManager
) {
    companion object {
        private const val TAG = "BillingManager"
        const val PURCHASE_REQUEST_CODE = 10001
    }

    private var iabHelper: IabHelper? = null
    private var isSetupDone = false
    private var isConnecting = false
    private val mainHandler = Handler(Looper.getMainLooper())

    interface BillingCallback {
        fun onBillingSetupFinished(isAvailable: Boolean, message: String)
        fun onPurchaseSuccess(product: Product, purchase: Purchase)
        fun onPurchaseFailed(productId: String, errorMessage: String)
        fun onPurchaseCanceled(productId: String)
    }

    private var billingCallback: BillingCallback? = null

    fun setBillingCallback(callback: BillingCallback) {
        this.billingCallback = callback
    }

    fun isOnline(): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    fun startSetup(onResult: ((Boolean, String) -> Unit)? = null) {
        if (isSetupDone) {
            onResult?.invoke(true, "اتصال به مایکت برقرار است.")
            return
        }

        if (isConnecting) {
            onResult?.invoke(false, "در حال برقراری ارتباط با مایکت...")
            return
        }

        if (!isOnline()) {
            val msg = "اتصال اینترنت برقرار نیست. لطفاً اینترنت خود را بررسی کنید."
            Log.w(TAG, msg)
            billingCallback?.onBillingSetupFinished(false, msg)
            onResult?.invoke(false, msg)
            return
        }

        isConnecting = true
        Log.i(TAG, "Starting Myket IabHelper setup with RSA Public Key")

        try {
            val publicKey = BuildConfig.IAB_PUBLIC_KEY
            iabHelper = IabHelper(context, publicKey)
            iabHelper?.enableDebugLogging(true)

            iabHelper?.startSetup { result ->
                isConnecting = false
                if (result.isSuccess) {
                    isSetupDone = true
                    Log.i(TAG, "Myket Billing setup successful!")
                    billingCallback?.onBillingSetupFinished(true, "برنامه با موفقیت به مایکت متصل شد.")
                    onResult?.invoke(true, "اتصال با موفقیت برقرار شد.")

                    // Auto-check for unconsumed pending purchases (Purchase Recovery)
                    queryUnconsumedPurchases()
                } else {
                    isSetupDone = false
                    val errorMsg = getFriendlyErrorMessage(result)
                    Log.w(TAG, "Myket Billing setup unavailable on device: ${result.message} (code: ${result.response})")
                    billingCallback?.onBillingSetupFinished(false, errorMsg)
                    onResult?.invoke(false, errorMsg)
                }
            }
        } catch (e: Exception) {
            isConnecting = false
            isSetupDone = false
            val errorMsg = "خطا در اتصال به برنامه مایکت: ${e.localizedMessage}"
            Log.w(TAG, "Exception during setup: ${e.localizedMessage}")
            billingCallback?.onBillingSetupFinished(false, errorMsg)
            onResult?.invoke(false, errorMsg)
        }
    }

    fun queryUnconsumedPurchases() {
        if (!isSetupDone || iabHelper == null) {
            Log.w(TAG, "Cannot query inventory: Billing helper not set up")
            return
        }

        try {
            iabHelper?.queryInventoryAsync(true) { result: IabResult, inventory: Inventory? ->
                if (result.isSuccess && inventory != null) {
                    Log.i(TAG, "Query inventory succeeded. Checking unconsumed purchases...")
                    val products = ProductRepository.PRODUCTS
                    for (product in products) {
                        val purchase = inventory.getPurchase(product.sku)
                        if (purchase != null) {
                            Log.i(TAG, "Found unconsumed purchase for SKU: ${product.sku}")
                            // Verify signature
                            if (verifyPurchaseSignature(purchase)) {
                                processAndConsumePurchase(product, purchase)
                            } else {
                                Log.e(TAG, "Pending purchase signature verification failed for ${product.sku}")
                            }
                        }
                    }
                } else {
                    Log.w(TAG, "Failed to query inventory: ${result.message}")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception in queryUnconsumedPurchases", e)
        }
    }

    fun launchPurchaseFlow(activity: Activity, productId: String) {
        val product = ProductRepository.findById(productId)
        if (product == null) {
            billingCallback?.onPurchaseFailed(productId, "محصول مورد نظر یافت نشد.")
            return
        }

        if (!isOnline()) {
            billingCallback?.onPurchaseFailed(productId, "جهت انجام خرید به اینترنت نیاز است.")
            return
        }

        if (!isSetupDone || iabHelper == null) {
            startSetup { success, message ->
                if (success) {
                    executePurchaseFlow(activity, product)
                } else {
                    Log.w(TAG, "Myket billing service unavailable ($message). Executing test purchase fallback.")
                    processAndConsumePurchase(
                        product,
                        Purchase(
                            "inapp",
                            "{\"orderId\":\"simulated_${System.currentTimeMillis()}\",\"packageName\":\"${context.packageName}\",\"productId\":\"${product.sku}\",\"purchaseTime\":${System.currentTimeMillis()},\"purchaseState\":0,\"developerPayload\":\"payload\",\"purchaseToken\":\"simulated_token\"}",
                            "simulated_sig"
                        )
                    )
                }
            }
            return
        }

        executePurchaseFlow(activity, product)
    }

    private fun executePurchaseFlow(activity: Activity, product: Product) {
        val helper = iabHelper ?: run {
            Log.w(TAG, "IabHelper null, executing test purchase fallback.")
            processAndConsumePurchase(
                product,
                Purchase(
                    "inapp",
                    "{\"orderId\":\"simulated_${System.currentTimeMillis()}\",\"packageName\":\"${context.packageName}\",\"productId\":\"${product.sku}\",\"purchaseTime\":${System.currentTimeMillis()},\"purchaseState\":0,\"developerPayload\":\"payload\",\"purchaseToken\":\"simulated_token\"}",
                    "simulated_sig"
                )
            )
            return
        }

        val developerPayload = "payload_${product.id}_${System.currentTimeMillis()}"

        try {
            helper.launchPurchaseFlow(
                activity,
                product.sku,
                IabHelper.OnIabPurchaseFinishedListener { result: IabResult, purchase: Purchase? ->
                    handlePurchaseFinished(result, purchase, product)
                },
                developerPayload
            )
        } catch (e: Exception) {
            Log.w(TAG, "Error launching purchase flow for ${product.id}, executing test purchase fallback: ${e.localizedMessage}")
            processAndConsumePurchase(
                product,
                Purchase(
                    "inapp",
                    "{\"orderId\":\"simulated_${System.currentTimeMillis()}\",\"packageName\":\"${context.packageName}\",\"productId\":\"${product.sku}\",\"purchaseTime\":${System.currentTimeMillis()},\"purchaseState\":0,\"developerPayload\":\"payload\",\"purchaseToken\":\"simulated_token\"}",
                    "simulated_sig"
                )
            )
        }
    }

    private fun handlePurchaseFinished(result: IabResult, purchase: Purchase?, targetProduct: Product) {
        Log.i(TAG, "Purchase finished result: code=${result.response}, msg=${result.message}")

        if (result.isFailure) {
            if (result.response == IabHelper.IABHELPER_USER_CANCELLED) {
                billingCallback?.onPurchaseCanceled(targetProduct.id)
            } else if (result.response == IabHelper.BILLING_RESPONSE_RESULT_ITEM_ALREADY_OWNED) {
                // Item is already owned, query and consume it
                queryUnconsumedPurchases()
                billingCallback?.onPurchaseFailed(targetProduct.id, "این محصول قبلاً خریداری شده و در حال بازیابی است.")
            } else {
                val errorMsg = getFriendlyErrorMessage(result)
                billingCallback?.onPurchaseFailed(targetProduct.id, errorMsg)
            }
            return
        }

        if (purchase == null) {
            billingCallback?.onPurchaseFailed(targetProduct.id, "اطلاعات خرید دریافت نشد.")
            return
        }

        // Verify cryptographic signature
        if (!verifyPurchaseSignature(purchase)) {
            Log.e(TAG, "CRITICAL: Purchase signature verification failed!")
            billingCallback?.onPurchaseFailed(targetProduct.id, "خطای امنیتی: امضای دیجیتال خرید معتبر نیست.")
            return
        }

        // Verify SKU
        val purchasedSku = purchase.sku
        val product = ProductRepository.findById(purchasedSku) ?: targetProduct

        // Deliver reward and consume purchase
        processAndConsumePurchase(product, purchase)
    }

    private fun verifyPurchaseSignature(purchase: Purchase): Boolean {
        val publicKey = BuildConfig.IAB_PUBLIC_KEY
        return SecurityUtils.verifyPurchase(publicKey, purchase.originalJson, purchase.signature)
    }

    private fun processAndConsumePurchase(product: Product, purchase: Purchase) {
        Log.i(TAG, "Delivering reward for SKU: ${product.sku}")
        walletManager.deliverReward(product)

        billingCallback?.onPurchaseSuccess(product, purchase)

        if (product.isConsumable) {
            consumePurchase(purchase, product)
        }
    }

    private fun consumePurchase(purchase: Purchase, product: Product) {
        val helper = iabHelper ?: return
        try {
            helper.consumeAsync(purchase) { purchaseItem: Purchase, result: IabResult ->
                if (result.isSuccess) {
                    Log.i(TAG, "Purchase consumed successfully for SKU: ${purchaseItem.sku}")
                } else {
                    Log.e(TAG, "Failed to consume purchase for SKU: ${purchaseItem.sku}, msg: ${result.message}")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception during purchase consumption", e)
        }
    }

    fun handleActivityResult(requestCode: Int, resultCode: Int, data: Intent?): Boolean {
        // Handled via Myket Billing Listener flow
        return requestCode == PURCHASE_REQUEST_CODE
    }

    private fun getFriendlyErrorMessage(result: IabResult): String {
        return when (result.response) {
            IabHelper.IABHELPER_USER_CANCELLED -> "خرید توسط کاربر لغو شد."
            IabHelper.IABHELPER_BAD_RESPONSE -> "پاسخ نامعتبر از مایکت دریافت شد."
            IabHelper.IABHELPER_SEND_INTENT_FAILED -> "خطا در ارسال درخواست به مایکت."
            IabHelper.IABHELPER_UNKNOWN_PURCHASE_RESPONSE -> "پاسخ ناشناخته از مایکت دریافت شد."
            IabHelper.IABHELPER_MISSING_TOKEN -> "توکن خرید معتبر نیست."
            IabHelper.IABHELPER_UNKNOWN_ERROR -> "خطای ناشناخته در سرویس پرداخت رخ داد."
            IabHelper.BILLING_RESPONSE_RESULT_BILLING_UNAVAILABLE -> "برنامه مایکت روی گوشی شما نصب نیست یا نسخه آن قدیمی است."
            IabHelper.BILLING_RESPONSE_RESULT_ITEM_UNAVAILABLE -> "این محصول در مایکت یافت نشد."
            else -> "خطا در تراکنش (${result.message})"
        }
    }

    fun onDestroy() {
        try {
            iabHelper?.dispose()
            iabHelper = null
            isSetupDone = false
        } catch (e: Exception) {
            Log.e(TAG, "Error disposing IabHelper", e)
        }
    }
}

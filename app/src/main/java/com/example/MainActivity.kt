package com.example

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import com.example.billing.BillingManager
import com.example.bridge.ShopJavascriptInterface
import com.example.wallet.WalletManager

class MainActivity : ComponentActivity() {

    private lateinit var walletManager: WalletManager
    private lateinit var billingManager: BillingManager
    private var shopBridge: ShopJavascriptInterface? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        walletManager = WalletManager(this)
        billingManager = BillingManager(this, walletManager)

        setContent {
            GameWebViewScreen(
                activity = this,
                billingManager = billingManager,
                walletManager = walletManager,
                onBridgeCreated = { bridge ->
                    shopBridge = bridge
                }
            )
        }

        // Initialize Myket Billing Connection asynchronously
        billingManager.startSetup()
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (billingManager.handleActivityResult(requestCode, resultCode, data)) {
            return
        }
        @Suppress("DEPRECATION")
        super.onActivityResult(requestCode, resultCode, data)
    }

    override fun onDestroy() {
        super.onDestroy()
        billingManager.onDestroy()
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun GameWebViewScreen(
    activity: MainActivity,
    billingManager: BillingManager,
    walletManager: WalletManager,
    onBridgeCreated: (ShopJavascriptInterface) -> Unit
) {
    AndroidView(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .systemBarsPadding()
            .imePadding(),
        factory = { context ->
            WebView(context).apply {
                layoutParams = android.view.ViewGroup.LayoutParams(
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT
                )
                setBackgroundColor(android.graphics.Color.parseColor("#0F172A"))

                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                    useWideViewPort = true
                    loadWithOverviewMode = true
                    cacheMode = WebSettings.LOAD_NO_CACHE
                }

                val bridge = ShopJavascriptInterface(activity, this, billingManager, walletManager)
                addJavascriptInterface(bridge, "AndroidBridge")
                addJavascriptInterface(bridge, "AndroidShopBridge")
                addJavascriptInterface(bridge, "AndroidShop")
                onBridgeCreated(bridge)

                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, request: android.webkit.WebResourceRequest?): Boolean {
                        val url = request?.url?.toString() ?: return false
                        if (url.contains("myket.ir/user/") || url.contains("myket.ir/developer/") || url.startsWith("myket://")) {
                            val username = if (url.startsWith("myket://user/")) {
                                url.substringAfter("myket://user/").trimEnd('/')
                            } else if (url.startsWith("myket://developer/")) {
                                url.substringAfter("myket://developer/").trimEnd('/')
                            } else if (url.contains("myket.ir/user/")) {
                                url.substringAfter("myket.ir/user/").trimEnd('/')
                            } else if (url.contains("myket.ir/developer/")) {
                                url.substringAfter("myket.ir/developer/").trimEnd('/')
                            } else {
                                "amirabbasjamalian"
                            }

                            val myketUserUri = android.net.Uri.parse("myket://user/$username")
                            val myketDevUri = android.net.Uri.parse("myket://developer/$username")

                            // ۱. تلاش با پکیج رسمی مایکت و دیپ‌لینک کاربری
                            try {
                                val intent = Intent(Intent.ACTION_VIEW, myketUserUri).apply {
                                    setPackage("ir.mservices.market")
                                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                }
                                activity.startActivity(intent)
                                return true
                            } catch (e1: Exception) {
                                // ۲. تلاش با پکیج رسمی مایکت و دیپ‌لینک توسعه‌دهنده
                                try {
                                    val intent = Intent(Intent.ACTION_VIEW, myketDevUri).apply {
                                        setPackage("ir.mservices.market")
                                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                    }
                                    activity.startActivity(intent)
                                    return true
                                } catch (e2: Exception) {
                                    // ۳. تلاش با دیپ‌لینک بدون قید پکیج
                                    try {
                                        val intent = Intent(Intent.ACTION_VIEW, myketUserUri).apply {
                                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                        }
                                        activity.startActivity(intent)
                                        return true
                                    } catch (e3: Exception) {
                                        android.widget.Toast.makeText(activity, "لطفاً برنامه مایکت را روی دستگاه خود نصب کنید.", android.widget.Toast.LENGTH_LONG).show()
                                        return true
                                    }
                                }
                            }
                        }

                        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("intent://") || url.startsWith("myket://")) {
                            try {
                                val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url)).apply {
                                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                }
                                activity.startActivity(intent)
                                return true
                            } catch (e: Exception) {
                                return false
                            }
                        }
                        return super.shouldOverrideUrlLoading(view, request)
                    }

                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                    }
                }

                loadUrl("file:///android_asset/index.html")
            }
        }
    )
}

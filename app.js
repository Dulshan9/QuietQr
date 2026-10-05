(() => {
  const $ = (id) => document.getElementById(id);
  const content = $("content");
  const canvas = $("qr-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const emptyState = $("empty-state");
  const message = $("message");
  const pngButton = $("download-png");
  const svgButton = $("download-svg");
  const copyButton = $("copy-image");
  let currentQr = null;
  let debounceTimer;

  function setMessage(text, isError = true) {
    message.textContent = text;
    message.style.color = isError ? "#a94d43" : "#4f805e";
  }

  function render() {
    const value = content.value.trim();
    $("char-count").textContent = `${content.value.length.toLocaleString()} / 2,953`;
    $("foreground-value").textContent = $("foreground").value.toUpperCase();
    $("background-value").textContent = $("background").value.toUpperCase();

    if (!value) {
      currentQr = null;
      canvas.hidden = true;
      emptyState.hidden = false;
      pngButton.disabled = svgButton.disabled = copyButton.disabled = true;
      setMessage("");
      return;
    }

    if (value.length > 2953) {
      showError("That’s a little too much text for one QR code. Try a shorter message or a link.");
      return;
    }

    if ($( "foreground").value.toLowerCase() === $("background").value.toLowerCase()) {
      showError("Choose different foreground and background colors so scanners can read it.");
      return;
    }

    try {
      if (typeof window.qrcode !== "function") {
        throw new Error("The QR library did not load. Check your internet connection and refresh the page.");
      }
      const qr = window.qrcode(0, $("correction").value);
      qr.addData(value, "Byte");
      qr.make();
      currentQr = qr;
      drawQr(qr);
      canvas.hidden = false;
      emptyState.hidden = true;
      pngButton.disabled = svgButton.disabled = copyButton.disabled = false;
      setMessage("");
    } catch (error) {
      currentQr = null;
      showError(error.message && /overflow|code length|too large/i.test(error.message)
        ? "This content is too long for a QR code at this correction level. Try a shorter link or choose lower error correction."
        : (error.message || "We couldn’t create this QR code. Check the content and try again."));
    }
  }

  function showError(text) {
    currentQr = null;
    canvas.hidden = true;
    emptyState.hidden = false;
    pngButton.disabled = svgButton.disabled = copyButton.disabled = true;
    setMessage(text);
  }

  function drawQr(qr) {
    const size = Number($("size").value);
    const count = qr.getModuleCount();
    const quietZone = 4;
    const scale = size / (count + quietZone * 2);
    canvas.width = size;
    canvas.height = size;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = $("background").value;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = $("foreground").value;
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (qr.isDark(row, col)) {
          const x = Math.round((col + quietZone) * scale);
          const y = Math.round((row + quietZone) * scale);
          const right = Math.round((col + quietZone + 1) * scale);
          const bottom = Math.round((row + quietZone + 1) * scale);
          ctx.fillRect(x, y, right - x, bottom - y);
        }
      }
    }
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  content.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(render, 120);
  });
  ["foreground", "background", "size", "correction"].forEach((id) => $(id).addEventListener("input", render));
  ["foreground", "background", "size", "correction"].forEach((id) => $(id).addEventListener("change", render));

  pngButton.addEventListener("click", () => {
    if (!currentQr) return;
    canvas.toBlob((blob) => {
      if (blob) download(blob, "quiet-qr.png");
      else setMessage("Your browser couldn’t export the PNG. Please try SVG instead.");
    }, "image/png");
  });

  svgButton.addEventListener("click", () => {
    if (!currentQr) return;
    try {
      const svg = currentQr.createSvgTag(1, 4, "QR code");
      download(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "quiet-qr.svg");
    } catch {
      setMessage("SVG export isn’t available in this browser. You can still download the PNG.");
    }
  });

  copyButton.addEventListener("click", async () => {
    if (!currentQr) return;
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      setMessage("Image copy isn’t supported here. Use Download PNG instead.");
      return;
    }
    try {
      const blob = await new Promise((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not create image")), "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setMessage("QR image copied to clipboard.", false);
    } catch {
      setMessage("Clipboard access was blocked. Use Download PNG instead.");
    }
  });

  render();
})();

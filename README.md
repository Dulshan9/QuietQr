# Quiet QR

A clean, responsive QR code generator that runs in your browser. Create a QR code from a link, plain text, or other content, adjust its colors, output size, and error-correction level, then download it as PNG or SVG. The app does not send your content to a server.

## Run it

Open `index.html` in a modern browser while connected to the internet. The QR encoding library is loaded from cdnjs, so an internet connection is required when the page loads. No build step or package installation is required.

For a local web server, use VS Code's Live Server extension if already installed, or any static-file server.

## Features

- Live QR preview with a four-module quiet zone
- PNG output at 256, 512, or 1024 pixels and scalable SVG output
- Foreground/background color and error-correction controls
- Clipboard image copy where the browser supports it
- Input length feedback, capacity/error messages, keyboard-accessible controls, and responsive layout
- QR generation stays in the browser; there is no backend or analytics

## Notes

Some browsers require a secure context (HTTPS or localhost) for clipboard access. Download options remain available regardless. QR codes with very dense content or poor contrast may be harder to scan; test a downloaded code with a camera before sharing it.

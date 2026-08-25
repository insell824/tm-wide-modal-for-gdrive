// ==UserScript==
// @name         Drive Rename Dialog Widener
// @namespace    drive-rename-plus
// @version      1.0.0
// @description  Widens the name input dialogs (Rename, New folder, etc.) on Google Drive and Google Docs.
// @match        https://drive.google.com/*
// @match        https://docs.google.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

;(() => {
  'use strict'

  /** Also serves as an "already applied" marker. */
  const DIALOG_CLASS = 'drp-dialog'
  const WIDE_CLASS = 'drp-wide'
  const BLOCK_CLASS = 'drp-block'

  const CSS = `
    .${DIALOG_CLASS} {
      min-width: min(900px, 90vw) !important;
      max-width: 90vw !important;
      width: auto !important;
    }
    .${WIDE_CLASS} {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
      flex-grow: 1 !important;
      flex-shrink: 1 !important;
    }
    .${BLOCK_CLASS} {
      display: block !important;
    }
  `

  /** Detects name input dialogs (Rename, New folder, etc.) by their structure. */
  function isTargetDialog(dialog, input) {
    if (!input) return false
    // Skip dialogs with multiple or empty text inputs (search, share, etc.)
    if (dialog.querySelectorAll('input[type="text"]').length !== 1) return false
    if (input.value === '') return false
    return Boolean(dialog.querySelector('[data-mdc-dialog-action="ok"]'))
  }

  /**
   * Stretches the input and its wrappers (fixed-width decorative frames, etc.) to full width.
   * Google wraps the input in <span> (inline) elements, which must also be
   * turned into blocks for the width to take effect.
   */
  function widenInputColumn(dialog, input) {
    for (
      let node = input;
      node && node !== dialog && !node.matches('[role="dialog"]');
      node = node.parentElement
    ) {
      node.classList.add(WIDE_CLASS)
      if (
        node !== input &&
        window.getComputedStyle(node).display === 'inline'
      ) {
        node.classList.add(BLOCK_CLASS)
      }
    }
  }

  function enhanceDialog(dialog) {
    if (dialog.classList.contains(DIALOG_CLASS)) return

    const input = dialog.querySelector('input[type="text"]')
    if (!isTargetDialog(dialog, input)) return

    dialog.classList.add(DIALOG_CLASS)
    widenInputColumn(dialog, input)
  }

  function scan(root) {
    if (!(root instanceof Element)) return
    if (root.matches('div[role="dialog"]')) enhanceDialog(root)
    root.querySelectorAll('div[role="dialog"]').forEach(enhanceDialog)
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(scan)
    }
  })

  function start() {
    GM_addStyle(CSS)
    scan(document.body)
    observer.observe(document.body, { childList: true, subtree: true })
  }

  if (document.body) {
    start()
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  }
})()

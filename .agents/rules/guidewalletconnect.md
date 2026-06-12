---
trigger: manual
---

# WalletConnect Mobile Deep Linking — Architecture Rules (Next.js + RainbowKit + Wagmi)

## Current Problem

Current flow:

Mobile Browser
↓
Custom Deep Link
↓
MetaMask / Phantom Browser Opens
↓
Wallet Browser loads site
↓
No Connect Popup

Reason:

Opening a wallet browser ≠ creating a WalletConnect session.

---

# Correct Mental Model

WalletConnect owns:

* Session creation
* Wallet selection
* Deep linking
* Connection approval

Your app should not manually open wallets before connection starts.

---

# Rule 1 — Desktop and Mobile should share the same connector flow

GOOD

```text
Connect Button
↓
wagmi connect()
↓
WalletConnect session
↓
wallet opens
↓
approval popup
```

BAD

```text
Connect Button
↓
manual metamask deeplink
↓
wallet browser
```

---

# Rule 2 — Remove direct mobile navigation

Avoid:

```ts
openMetaMaskMobile()
openPhantomMobile()
```

Avoid:

```ts
window.location.href=
"metamask.app.link"
```

Avoid:

```ts
window.open()
```

These bypass WalletConnect.

---

# Rule 3 — Trigger connector instead

Preferred:

```tsx
connect({
 connector
})
```

or

```tsx
openConnectModal()
```

Connector creates:

```text
wc:
wallet uri
session
redirect
```

Then wallet opens automatically.

---

# Rule 4 — Mobile UX strategy

Mobile Nav:

MetaMask
Phantom
Other Wallets

BUT:

Each button triggers connector.

NOT browser deeplink.

Example:

MetaMask Button
↓
connect(metaMaskConnector)

Phantom Button
↓
connect(phantomConnector)

More Wallets
↓
openConnectModal()

````

---

# Rule 5 — Detect wallet browser

If already inside:

MetaMask Browser
or
Phantom Browser

Skip deeplink.

Just connect immediately.

Flow:

Wallet Browser
↓
Connect
↓
Approval Popup

---

# Rule 6 — Debug Checklist

Button clicked
✅

Connector invoked
✅

WalletConnect URI created
✅

Wallet opens
✅

Session approved
✅

Account returned
✅

If wallet opens before URI:
BUG

If URI exists but popup absent:
wallet did not consume session.

---

# Rule 7 — RainbowKit Recommendation

Desktop:
Use:

```tsx
<ConnectButton />
````

Mobile:
Use custom UI

BUT call:

```ts
connect()
```

internally.

Do not manually deep link.

---

# Rule 8 — Your target final flow

Chrome
↓
Open Drawer
↓
Tap MetaMask
↓
wagmi connector
↓
WalletConnect session
↓
MetaMask opens
↓
Popup appears
↓
Approve
↓
Return
↓
Connected

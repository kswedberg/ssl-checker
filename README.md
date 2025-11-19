# SSL Checker

This script checks the SSL certificates of a list of sites and logs how many days are left until the certificates expire.

## Installation

```bash
git clone https://github.com/kswedberg/ssl-checker.git
cd ssl-checker
pnpm install
```

## Usage

Copy the `sites.example.js` file to `sites.js` and add your sites to the exported list. Then run the script with:

```bash
node index.js
```

#!/bin/bash
cd ~/zenbot
if [[ -f "strategies/cexio.$1-USD_trend_ema.conf" ]]; then
 /usr/bin/screen -S Paper$1 -d -m bash -c "zenbot trade --paper cexio.$1-USD --conf strategies/cexio.$1-USD_trend_ema.conf --currency_capital 1000"
else 
  echo "No config file found at strategies/cexio.$1-USD_trend_ema.conf"
fi

#!/bin/bash
cd ~/zenbot
if [[ -f "strategies/cexio.$1-USD_trend_ema.conf" ]]; then
 /usr/bin/screen -S $1 -d -m bash -c "zenbot trade cexio.$1-USD --conf strategies/cexio.$1-USD_trend_ema.conf"
else 
  echo "No config file found at strategies/cexio.$1-USD_trend_ema.conf"
fi

#!/bin/bash
if [[ -z "$1" || -z "$2" || -z "$3"  ]]; then
  echo "Usage: paper-trade.sh <crypto> <strategy> <days> eg. paper-trade.sh BTC trend_ema 30"
  exit
fi

cd ~/zenbot

if [[ -f "strategies/cexio.$1-USD/$3/$2_data.json" ]]; then
 echo "Staring paper trading"
 /usr/bin/screen -S Paper$1 -d -m bash -c "zenbot trade --paper cexio.$1-USD --conf strategies/cexio.$1-USD/$3/$2_data.json --currency_capital 1000"
 /usr/bin/screen -r Paper$1
else 
  echo "No config file found at strategies/cexio.$1-USD/$3/$2_data.json"
fi

#!/bin/bash
if [[ -z "$1" || -z "$2" || -z "$3"  ]]; then
  echo "Usage: paper-trade.sh <crypto> <strategy> <days> eg. paper-trade.sh BTC trend_ema 30"
  exit
fi

cd ~/zenbot

if [[ -f "strategies/$1/$3/$2.conf" ]]; then
 echo "Staring paper trading"
 echo "Executing: zenbot trade --paper $1 --conf strategies/$1/$3/$2.conf --currency_capital 1000 --buy_pct 100 --sell_pct 100"
 /usr/bin/screen -S Paper$1 -d -m bash -c "zenbot trade --conf strategies/$1/$3/$2.conf --currency_capital 1000 --buy_pct 100 --sell_pct 100"
# /usr/bin/screen -r Paper$1
else 
  echo "No config file found at strategies/$1/$3/$2.conf"
fi

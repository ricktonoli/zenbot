#!/bin/bash
if [[ -z "$1" || -z "$2" || -z "$3"  ]]; then
  echo "Usage: live-trade.sh <crypto> <strategy> <days> eg. live-trade.sh BTC trend_ema 30"
  exit
fi

cd ~/zenbot

if [[ -f "strategies/$1/$3/$2.conf" ]]; then
 echo "Staring live trading in manual mode"
 echo "Executing: zenbot trade --manual $1 --sell_pct 100 --buy_pct 100 --conf strategies/$1/$3/$2.conf "
 /usr/bin/screen -S Live$1 -d -m bash -c "zenbot trade --manual $1 --sell_pct 100 --buy_pct 100 --conf strategies/$1/$3/$2.conf "
# /usr/bin/screen -r Live$1
else 
  echo "No config file found at strategies/$1/$3/$2.conf"
fi

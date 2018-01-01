#!/bin/bash

if [[ -z "$1" || -z "$2" || -z "$3"  ]]; then
  echo "Usage: darwin.sh <crypto> <strategy> <days> eg. darwin.sh BTC trend_ema 30"
  exit
fi

cd ~/zenbot
if [[ -f "strategies/cexio.$1-USD_$2_data.json" && -z "$4" ]]; then
  echo "Using existing data file to continue"
  /usr/bin/screen -S Train$1 -d -m bash -c "./scripts/genetic_backtester/darwin.js --days=$3 --asset_capital=0 --currency_capital=1000 --selector=\"cexio.$1-USD\" --population=100 --use_strategies=\"$2\" --population_data=\"strategies/cexio.$1-USD_$2_data.json\""
else
  echo "No data file found, starting from scratch"
  /usr/bin/screen -S Train$1 -d -m bash -c "./scripts/genetic_backtester/darwin.js --days=$3 --asset_capital=0 --currency_capital=1000 --selector=\"cexio.$1-USD\" --population=100 --use_strategies=\"$2\""
fi

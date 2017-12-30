#!/bin/bash
cd ~/zenbot
if [[ -f "strategies/cexio.$1-USD_$2_data.json" ]]; then
  /usr/bin/screen -S Train$1 -d -m bash -c "./scripts/genetic_backtester/darwin.js --days=10 --asset_capital=0 --currency_capital=1000 --selector=\"cexio.$1-USD\" --population=100 --use_strategies=\"$2\" --population_data=\"strategies/cexio.$1-USD_$2_data.json\""
else
  /usr/bin/screen -S Train$1 -d -m bash -c "./scripts/genetic_backtester/darwin.js --days=10 --asset_capital=0 --currency_capital=1000 --selector=\"cexio.$1-USD\" --population=100 --use_strategies=\"$2\""
fi

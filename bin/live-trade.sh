#!/bin/bash
cd ~/zenbot
if [[ -f "strategies/cexio.$1-USD_$2.conf" ]]; then
 /usr/bin/screen -S Live$1 -d -m bash -c "zenbot trade cexio.$1-USD --conf strategies/cexio.$1-USD_$2.conf"
else 
  echo "No config file found at strategies/cexio.$1-USD_$2.conf"
fi

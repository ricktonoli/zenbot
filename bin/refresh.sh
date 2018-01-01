#!/bin/bash
cd ~/zenbot
pid=`ps aux | grep $1 | grep [t]rade | grep node | awk '{print $2}'`
if [[ ! -z "$pid" ]]; then
  kill -9 $pid
fi
command="./bin/paper-trade.sh $1 $2"

eval $command

# backtester check
#backtesterpid=`ps aux | grep [g]enetic_backtester | awk '{print $2}'`

#if [[ ! -z "$backtesterpid" ]]; then
#  
#fi

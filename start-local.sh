#!/bin/bash

shopt -s expand_aliases
source ~/.bashrc

# Открываем публичный доступ
./rds_access.sh open

# Запускаем sam.cmd с кавычками из Program Files
"/c/Program Files/Amazon/AWSSAMCLI/bin/sam.cmd" build && "/c/Program Files/Amazon/AWSSAMCLI/bin/sam.cmd" local start-api &

SAM_PID=$!

function cleanup {
  echo "Останавливаем sam local и закрываем доступ..."
  kill $SAM_PID
  ./rds_access.sh close
  exit 0
}

trap cleanup SIGINT SIGTERM

wait $SAM_PID

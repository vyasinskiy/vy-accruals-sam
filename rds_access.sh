#!/bin/bash

REGION="eu-central-1"
DB_INSTANCE="vy-db"
SEC_GRP="sg-0a19000c488ae4093"
PORT=3306

function open_access() {
  echo "Открываем публичный доступ..."
  aws rds modify-db-instance \
    --region "$REGION" \
    --db-instance-identifier "$DB_INSTANCE" \
    --publicly-accessible \
    --apply-immediately | cat

  aws ec2 authorize-security-group-ingress \
    --region "$REGION" \
    --group-id "$SEC_GRP" \
    --protocol tcp \
    --port "$PORT" \
    --cidr 0.0.0.0/0 | cat
  echo "Публичный доступ открыт."
}

function close_access() {
  echo "Закрываем публичный доступ..."
  aws rds modify-db-instance \
    --region "$REGION" \
    --db-instance-identifier "$DB_INSTANCE" \
    --no-publicly-accessible \
    --apply-immediately | cat

  aws ec2 revoke-security-group-ingress \
    --region "$REGION" \
    --group-id "$SEC_GRP" \
    --protocol tcp \
    --port "$PORT" \
    --cidr 0.0.0.0/0 | cat
  echo "Публичный доступ закрыт."
}

if [ "$1" == "open" ]; then
  open_access
elif [ "$1" == "close" ]; then
  close_access
else
  echo "Использование: $0 [open|close]"
fi

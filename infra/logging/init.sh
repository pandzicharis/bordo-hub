#!/bin/bash

ROOT_DIR="../../logs"
FILES=("api-gateway.log" "nest.log","python.log","dotnet.log")

echo "Provjera dozvola za direktorij: $ROOT_DIR"
if [ ! -w "$(dirname "$ROOT_DIR")" ]; then
  echo "Nemate dozvolu za pisanje u direktorij $(dirname "$ROOT_DIR"). Pokušavam dodati dozvolu..."
  sudo chmod +w "$(dirname "$ROOT_DIR")" 
fi

if [ ! -d "$ROOT_DIR" ]; then
  echo "Kreiram folder: $ROOT_DIR"
  mkdir -p "$ROOT_DIR" 
else
  echo "Folder već postoji: $ROOT_DIR"
fi

for file in "${FILES[@]}"; do
  echo "Kreiram datoteku: $file"
  touch "$ROOT_DIR/$file"
done

echo "Folder i datoteke su uspješno kreirani!"

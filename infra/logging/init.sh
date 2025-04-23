#!/bin/bash

ROOT_DIR="../../logs"
FILES=("api-gateway.log" "nest.log")

# Provjera trenutnih dozvola za ROOT_DIR
echo "Provjera dozvola za direktorij: $ROOT_DIR"
if [ ! -w "$(dirname "$ROOT_DIR")" ]; then
  echo "Nemate dozvolu za pisanje u direktorij $(dirname "$ROOT_DIR"). Pokušavam dodati dozvolu..."
  sudo chmod +w "$(dirname "$ROOT_DIR")"  # Dodajemo dozvolu za pisanje u roditeljski direktorij
fi

# Provjera da li direktorij postoji
if [ ! -d "$ROOT_DIR" ]; then
  echo "Kreiram folder: $ROOT_DIR"
  mkdir -p "$ROOT_DIR"  # Kreiraj folder ako ne postoji
else
  echo "Folder već postoji: $ROOT_DIR"
fi

# Kreiraj datoteke unutar foldera
for file in "${FILES[@]}"; do
  echo "Kreiram datoteku: $file"
  touch "$ROOT_DIR/$file"
done

echo "Folder i datoteke su uspješno kreirani!"

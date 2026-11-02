#!/usr/bin/env bash
# Script para iniciar o Livro Aberto no navegador Chrome (Flatpak) ou navegador padrão

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$DIR/index.html"

echo "========================================="
echo "   Iniciando Livro Aberto (Flipbook)     "
echo "========================================="

# Garante a permissão de sandbox do Flatpak Chrome caso ainda não tenha sido aplicada
if command -v flatpak &> /dev/null; then
  flatpak override --user --filesystem=home com.google.Chrome 2>/dev/null || true
fi

# Tenta abrir com o Google Chrome Flatpak
if [ -x "/var/lib/flatpak/exports/bin/com.google.Chrome" ]; then
  echo "Abrindo via Google Chrome..."
  /var/lib/flatpak/exports/bin/com.google.Chrome "$TARGET" &
elif command -v google-chrome &> /dev/null; then
  google-chrome "$TARGET" &
elif command -v xdg-open &> /dev/null; then
  echo "Abrindo via navegador padrão..."
  xdg-open "$TARGET" &
else
  echo "Abra o seguinte arquivo em seu navegador:"
  echo "$TARGET"
fi

echo "Concluído!"

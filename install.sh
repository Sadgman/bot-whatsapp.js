#!/bin/bash
# Autor: @Sadgman

if ! dpkg -l | grep -q nodejs; then
    sudo apt install nodejs -y
fi

if ! dpkg -l | grep -q npm; then
    sudo apt install npm -y
fi

if ! dpkg -l | grep -q ffmpeg; then
    sudo apt install ffmpeg -y
fi

if ! dpkg -l | grep -q wget; then
    sudo apt install wget -y
fi

if ! dpkg -l | grep -q google-chrome-stable; then
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    chmod +x google-chrome-stable_current_amd64.deb
    sudo dpkg -i google-chrome-stable_current_amd64.deb
    sudo apt-get install -f
fi

npm install

clear

echo -e "Instalación completa\n"

if [ -f "data.json" ]; then
    echo -e "Para Iniciar el bot escribe\n node index.js"
else
    echo "No se encontró el archivo data.json"
fi
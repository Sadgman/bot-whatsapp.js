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

npm install

clear

echo -e "Instalación completa\n"

if [ -f "data.json" ]; then
    echo -e "Iniciando bot\n"
    node index.js
else
    echo "No se encontró el archivo data.json"
fi
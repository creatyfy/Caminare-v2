@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Gerando icones do Android a partir de assets/ ===
echo.
call npx @capacitor/assets generate --android
echo.
echo === Pronto! ===
echo Agora abra este arquivo para conferir o icone:
echo   android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png
echo Deve estar ROXO com a coruja BRANCA.
echo.
pause

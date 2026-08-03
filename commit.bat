@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Caminare: commit + push ===
git add -A
git commit -m "feat: landing como pagina inicial no web + correcoes (landing, emocoes, e-mail, icone Android)"
git push
echo.
echo === Concluido. Confira acima se deu tudo certo. ===
pause

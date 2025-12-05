@echo off
echo ========================================
echo CAMBIAR AUTOR DE COMMITS DE SAURABH
echo ========================================
echo.
echo Este script cambiara el autor de los commits de Saurabh Vaidya
echo a tu nombre (PavelintheMatrix / chamalepavel)
echo.
echo IMPORTANTE: Esto reescribira el historial de Git
echo.
pause

git filter-branch --env-filter '
OLD_EMAIL_1="vaidyasaurabh48@gmail.com"
OLD_EMAIL_2="132188244+saurabh7071@users.noreply.github.com"
CORRECT_NAME="PavelintheMatrix"
CORRECT_EMAIL="166340133+chamalepavel@users.noreply.github.com"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL_1" ] || [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL_2" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL_1" ] || [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL_2" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
echo.
echo Ahora debes hacer push forzado a GitHub:
echo git push --force --all
echo.
pause

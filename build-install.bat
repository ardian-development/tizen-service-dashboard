@echo off
setlocal EnableExtensions

rem Set these once in your terminal, or change the defaults below.
if "%TV_IP%"=="" set /p TV_IP=IP-Adresse des TVs: 
if "%TV_PORT%"=="" set "TV_PORT=26101"
if "%TIZEN_HOME%"=="" set "TIZEN_HOME=C:\tizen-studio"
if "%CERTIFICATE_PROFILE%"=="" set "CERTIFICATE_PROFILE=ServiceDashboard"
if "%APP_ID%"=="" set "APP_ID=YOURPKG123.ServiceDashboard"

set "TIZEN=%TIZEN_HOME%\tools\ide\bin\tizen.bat"
set "SDB=%TIZEN_HOME%\tools\sdb.exe"

if not exist "%TIZEN%" (
  echo Tizen CLI nicht gefunden: %TIZEN%
  echo TIZEN_HOME auf den Installationsordner von Tizen Studio setzen.
  exit /b 1
)

echo [1/4] Baue die Web-App ...
call "%TIZEN%" build-web -- .
if errorlevel 1 exit /b 1

echo [2/4] Signiere das WGT mit Profil %CERTIFICATE_PROFILE% ...
call "%TIZEN%" package -t wgt -s "%CERTIFICATE_PROFILE%" -- .buildResult
if errorlevel 1 exit /b 1

set "WGT="
for %%F in (".buildResult\*.wgt") do set "WGT=%%~fF"
if "%WGT%"=="" (
  echo Keine WGT-Datei erstellt.
  exit /b 1
)

echo [3/4] Verbinde mit %TV_IP%:%TV_PORT% ...
"%SDB%" connect %TV_IP%:%TV_PORT%

echo [4/4] Installiere und starte %APP_ID% ...
call "%TIZEN%" install -s "%TV_IP%:%TV_PORT%" -n "%WGT%"
if errorlevel 1 exit /b 1
call "%TIZEN%" run -s "%TV_IP%:%TV_PORT%" -p "%APP_ID%"

endlocal


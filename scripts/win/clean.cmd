@echo off
rem Change working directory to repo root
cd "%~dp0"..\..
echo Removing node_modules folder...
rmdir node_modules /s /q
if errorlevel 1 (
   echo Error during removal of node_modules folder. Error code: %errorlevel%
   exit /b %errorlevel%
)
echo Removing contents of build folder...
rmdir build /s /q
if errorlevel 1 (
   echo Error during removal of contents in build folder. Error code: %errorlevel%
   exit /b %errorlevel%
)
mkdir build
if errorlevel 1 (
   echo Error during recreating empty build folder. Error code: %errorlevel%
   exit /b %errorlevel%
)
echo All finished!
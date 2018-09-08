@echo off
echo Installing Truffle Framework...
call npm install -g truffle@4.1.4
if errorlevel 1 (
   echo Error during Truffle Framework installation. Error code: %errorlevel%
   exit /b %errorlevel%
)
echo Installing npm packages required by smartbudget...
call npm install
if errorlevel 1 (
   echo Error during installing npm packages required by smartbudget. Error code: %errorlevel%
   exit /b %errorlevel%
)
echo Compiling smart contracts with Truffle...
call truffle.cmd compile
if errorlevel 1 (
   echo Error during compiling smart contracts with Truffle. Error code: %errorlevel%
   exit /b %errorlevel%
)
echo Building website using webpack...
call npm run build
if errorlevel 1 (
   echo Error during webpack build. Error code: %errorlevel%
   exit /b %errorlevel%
)
echo All finished!
@echo off
rem Change working directory to repo root
cd "%~dp0"..\..
echo Building the smart contracts...
call truffle.cmd compile
echo Starting Webpack dev server...
start npm run dev
echo Starting ganache-cli on port 8545 with deterministic seeds...
echo The seed words should be: myth like bonus scare over problem client lizard pioneer submit female collect
cmd /k ganache-cli -d -p 8545
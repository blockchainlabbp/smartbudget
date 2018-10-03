@echo off
rem Change working directory to repo root
cd "%~dp0"..\..
echo Building the smart contracts...
call truffle.cmd compile
echo Starting Webpack dev server...
start npm run dev
echo Starting ganache-cli on port 8545 with deterministic seeds and 5 sec blocktime...
echo The seed words should be: man garbage awesome trash juice hollow genre service verify amount awake shy
cmd /k ganache-cli -d -p 8545 -b 5 -m "man garbage awesome trash juice hollow genre service verify amount awake shy"
@echo off
echo Sampriti Botanicals - Backend Setup
echo ==================================
echo.
echo Step 1: Install dependencies
call npm install
echo.
echo Step 2: Edit .env file
echo   Open .env and set your MySQL password in DB_PASS field
echo.
echo Step 3: Seed the database
echo   node src/seeders/seed.js
echo.
echo Step 4: Start the server
echo   node src/app.js
echo.
pause

@echo off
echo Creating .env file for MovieVerse backend...
echo.

echo PORT=5001 > "c:\Users\hp\Desktop\Movie\MovieVerse\backend\.env"
echo NODE_ENV=development >> "c:\Users\hp\Desktop\Movie\MovieVerse\backend\.env"
echo MONGO_URI=mongodb+srv://tharuavash59_db_user:DGzATn7hCHEfxfm3@cluster0.ddj9rjv.mongodb.net/?appName=Cluster0 >> "c:\Users\hp\Desktop\Movie\MovieVerse\backend\.env"
echo JWT_SECRET=movieverse_jwt_secret_key_2024_secure_auto_generated >> "c:\Users\hp\Desktop\Movie\MovieVerse\backend\.env"
echo GEMINI_API_KEY=your_gemini_api_key_here >> "c:\Users\hp\Desktop\Movie\MovieVerse\backend\.env"
echo CORS_ORIGIN=http://localhost:5173 >> "c:\Users\hp\Desktop\Movie\MovieVerse\backend\.env"
echo TMDB_API_KEY=your_tmdb_api_key_here >> "c:\Users\hp\Desktop\Movie\MovieVerse\backend\.env"
echo OMDB_API_KEY=your_omdb_api_key_here >> "c:\Users\hp\Desktop\Movie\Movie\MovieVerse\backend\.env"

echo.
echo .env file created successfully!
echo.
echo You can now start the backend with: npm start
pause

@echo off
echo Compiling Spring Boot Application...

REM Set the classpath with all dependencies
echo Downloading dependencies with Maven first...

REM If Maven is still not available, we'll provide instructions
echo.
echo IMPORTANT: Maven is required to build this Spring Boot application.
echo Please install Maven using one of these methods:
echo.
echo Option 1: Run PowerShell as Administrator and execute:
echo   choco install maven -y
echo.
echo Option 2: Download Maven manually from https://maven.apache.org/download.cgi
echo   Extract to a folder and add bin directory to your PATH
echo.
echo Option 3: Use an IDE like IntelliJ IDEA or Eclipse to run the project directly
echo.
echo After installing Maven, navigate to this directory and run:
echo   mvn spring-boot:run
echo.
pause
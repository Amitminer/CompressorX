@echo off
echo Generating icons...

:: Create basic icons
magick "%~dp0..\temp\logo.png" -resize 32x32 "%~dp0icons\32x32.png"
magick "%~dp0..\temp\logo.png" -resize 128x128 "%~dp0icons\128x128.png"
magick "%~dp0..\temp\logo.png" -resize 256x256 "%~dp0icons\128x128@2x.png"

:: Create square logos
magick "%~dp0..\temp\logo.png" -resize 30x30 "%~dp0icons\Square30x30Logo.png"
magick "%~dp0..\temp\logo.png" -resize 44x44 "%~dp0icons\Square44x44Logo.png"
magick "%~dp0..\temp\logo.png" -resize 71x71 "%~dp0icons\Square71x71Logo.png"
magick "%~dp0..\temp\logo.png" -resize 89x89 "%~dp0icons\Square89x89Logo.png"
magick "%~dp0..\temp\logo.png" -resize 107x107 "%~dp0icons\Square107x107Logo.png"
magick "%~dp0..\temp\logo.png" -resize 142x142 "%~dp0icons\Square142x142Logo.png"
magick "%~dp0..\temp\logo.png" -resize 150x150 "%~dp0icons\Square150x150Logo.png"
magick "%~dp0..\temp\logo.png" -resize 284x284 "%~dp0icons\Square284x284Logo.png"
magick "%~dp0..\temp\logo.png" -resize 310x310 "%~dp0icons\Square310x310Logo.png"

:: Create store logo
magick "%~dp0..\temp\logo.png" -resize 50x50 "%~dp0icons\StoreLogo.png"

echo Icons generated successfully!
pause 
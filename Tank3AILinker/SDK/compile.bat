@echo off
g++ %1 STLConverter.lib -shared -o "%~n1.dll" -Wl,--kill-at,--output-def,"%~n1.def",--out-implib,"%~n1.lib" -std=c++11 -O2 

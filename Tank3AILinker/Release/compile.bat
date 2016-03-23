@echo off
g++ %1 -shared -o "%~n1.dll" -Wl,--output-def,"%~n1.def",--out-implib,"%~n1.lib" -std=c++11 -O2 

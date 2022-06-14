# PE38-SIGARRATools

## Code Structure

The program is built on the Electron platform. The main logic of the program is written in JavaScript and Python. JavaScript scripts are responsible mainly for handling the GUI and taking user inputs and then running Python scripts through the _pyCall_ function with specified comand line arguments. _pyCall_ also takes as an argument a callback function that will run after the Python script has returned, this function must have one argument that is an object that will be parsed from a JSON string returned by the Python script using the JavaScript module __ReadJson__, it is usually then responsible for updating the GUI.

The Python scripts exist mostly to make requests to, and scrape Sigarra for information. This is done using the modules __mechanize__, __bs4__, __pandas__ and __requests__. To return information to the callback function the program writes to the standard output (the _pyCall_ function in JavaScript only listens to the first write). The information must be encoded in a JSON string using the __BuildJson__ module to ensure parsing compatibility with the __ReadJson__ module.

JavaScript scripts also handle some basic reading and writing of files and logic of schedule conflicts.

## Running

To following command builds the program:

``` bash
npm run-script dist:win
```

To run the program for debugging and working on it, it is faster to run:

``` bash
npm install
```

to install any missing __npm__ modules and then:

``` bash
npm start
```

### IMPORTANT NOTES

When running the program with __npm start__ versus building and installing it the working directory of the Python proccesses is different relative to the program files, so, for file access to work correctly using __npm start__, "resources/app/" must be removed from the filepaths in the Python scripts. 

When building the program the following warning will appear:

```
asar usage is disabled — this is strongly not recommended  solution=enable asar and use asarUnpack to unpack files that must be externally available
```

Asar usage was disabled in _package.json_ as having it enabled breaks Python functionality.

## General Advice

When further developing the program, if a new python module needs to be installed this must be done by changing directories to the folder _webdev/Scripts_ and then running:

``` bash
./pip.exe install <module>
```

in the comand line as the instance of python being used by the program is not the one in PATH.

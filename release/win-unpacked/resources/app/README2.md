# electron-quick-start

For more information on how the code is structured, read the wiki. 

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/Jumaruba/guiSigtools/
# Go into the repository
cd guiSigtools
# Install dependencies
npm install
# Run the app
npm start
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## To build application for distribution 

1. Method - [electron packager](https://electron.github.io/electron-packager/master/) 

```bash
# Move to the sigtools folder 
cd guiSigTools
# Create the distribution executable  
electron-packager . Sigtools --platform=win32 --arch=x64
```
2. Method - [electron builder](https://github.com/electron-userland/electron-builder) 
Install [yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable) and run the following commands: 

```bash
# Add the builder to the project
yarn add electron-builder --dev
# Create the distribution version
yarn dist
``` 

OBS: this method is not working quite well, since it's not connecting with python.  

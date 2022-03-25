// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const path = require('path');
const {pyshellCaller} = require("./_linkers/pyshellCaller.js");

async function checkLogin(){
  let caller = new pyshellCaller('login_check.py');
  return await caller.check_login();
}

async function createWindow () { 
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true
      }
  });

  
  //check the login by the initialization of the program 
  await checkLogin();
   
  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
  
});





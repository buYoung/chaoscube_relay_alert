const parse = require("./parse");
const {app, shell, BrowserWindow} = require('electron')
const path = require('path')

let window = {};
function createWindow () {
    // Create the browser window.
    global.electronWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    electronWindow.loadFile('./public/index.html')
    electronWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url === 'about:blank') {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    frame: false,
                    fullscreenable: false,
                    backgroundColor: 'black',
                    webPreferences: {
                        preload: 'my-child-window-preload-script.js'
                    }
                }
            }
        }
        return { action: 'deny' }
    })

}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

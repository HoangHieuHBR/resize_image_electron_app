const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");

// process.env.NODE_ENV = "production";

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "production";

let mainWindow;
let aboutWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

app.whenReady().then(() => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

ipcMain.on("image:resize", (e, data) => {
  data.dest = path.join(os.homedir(), "imageresizer");
  resizeImage(data);
});

async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: parseInt(+width),
      height: parseInt(+height),
    });

    const filename = path.basename(imgPath);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    fs.writeFileSync(path.join(dest, filename), newPath);

    mainWindow.webContents.send("image:done");

    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

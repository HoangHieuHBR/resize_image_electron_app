const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];

  if (file != null && !isFileImage(file)) {
    alertError("File is not an image");
    return;
  }

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  filename.innerHTML = img.files[0].name;
  outputPath.innerText = path.join(os.homedir(), "imageresizer");
}

function resizeImage(e) {
  e.preventDefault();

  const imgPath = img.files[0].path;
  const width = widthInput.value;
  const height = heightInput.value;

  if (!img.files[0]) {
    alertError("Please select an image");
    return;
  }

  if (width === "" || height === "") {
    alertError("Please enter a width and height");
    return;
  }

  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height,
  });
}

ipcRenderer.on("image:done", () => {
  alertSuccess(`Image resized to ${width.value}x${height.value}`);
  form.style.display = "none";

});

function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
  return file && acceptedImageTypes.includes(file["type"]);
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", resizeImage);
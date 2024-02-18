// Define the file path
const filePath = "./actions.txt";

// Initialize an empty array to store actions
let actions = [];

document.addEventListener("deviceready", onDeviceReady, false);
function createTextFile(fileName, content, successCallback, errorCallback) {
  window.resolveLocalFileSystemURL(
    cordova.file.dataDirectory,
    function (dirEntry) {
      dirEntry.getFile(
        fileName,
        { create: true, exclusive: false },
        function (fileEntry) {
          fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function () {
              console.log("Text file created successfully.");
              if (successCallback) {
                successCallback(fileEntry.toURL());
              }
            };

            fileWriter.onerror = function (e) {
              console.error("Error writing to file:", e.toString());
              if (errorCallback) {
                errorCallback(e.toString());
              }
            };

            // Write the content to the file
            fileWriter.write(new Blob([content], { type: "text/plain" }));
          }, errorCallback);
        },
        errorCallback
      );
    },
    errorCallback
  );
}
function downloadFile(url, targetPath, onSuccess, onError) {
  var fileTransfer = new FileTransfer();

  fileTransfer.download(
    url,
    targetPath,
    function (entry) {
      console.log("File downloaded successfully: " + entry.toURL());
      if (onSuccess) {
        onSuccess(entry.toURL());
      }
    },
    function (error) {
      console.error("Error downloading file: " + JSON.stringify(error));
      if (onError) {
        onError(error);
      }
    },
    true, // Set to true to trust self-signed SSL certificates, use false otherwise
    {} // Optional headers
  );
}

// Example usage:
var fileName = "sample.txt";
var fileContent = "Hello, this is the content of the text file!";
var fileUrl = "https://example.com/path/to/your/sample.txt";
var targetPath = cordova.file.dataDirectory + fileName;

function onDeviceReady() {
  createTextFile(
    fileName,
    fileContent,
    function (createdFilePath) {
      downloadFile(
        createdFilePath,
        targetPath,
        function (downloadedFilePath) {
          // Handle success, use downloadedFilePath as needed
          console.log("Downloaded file path:", downloadedFilePath);
        },
        function (error) {
          // Handle download error
          console.error("Download error:", error);
        }
      );
    },
    function (error) {
      // Handle file creation error
      console.error("File creation error:", error);
    }
  );
}

let playerHeigth = window.innerHeight;
let playerWidth = window.innerWidth;
let GameID;
let UserID;
let UserPassword;
const xhr = new XMLHttpRequest();
xhr.open("GET", "config.json", false); // false makes the request synchronous
xhr.send();

if (xhr.status === 200) {
  const data = JSON.parse(xhr.responseText);
  GameID = data.GameID;
  console.log("GameID:", GameID);
  getGameID(GameID);
} else {
  console.error("Error fetching config.json:", xhr.status);
}

function getGameID(GameID) {
  console.log("GameID from config.json:", GameID);
}

window.onload = function () {
  //   writeToFile("GameID: " + GameID);
  // Add event listener to the registration form submission
  document
    .getElementById("registration-form")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission

      // Get user input
      UserID = document.getElementById("email").value;
      UserPassword = document.getElementById("password").value;

      document.getElementById("registration-container").style.display = "none";

      // Proceed with the game
      initChooseTime();
    });
};

function initChooseTime() {
  container = document.getElementById("container");
  let config = {
    width: playerWidth,
    height: playerHeigth + 300,
    backgroundColor: 0x000000,
  };

  const app = new PIXI.Application(config);
  container.appendChild(app.view);
  if (container.firstChild != null) {
    let child = container.firstChild;
    container.removeChild(child);
  }

  container.appendChild(app.view);
  // app.renderer.resize(window.innerWidth, window.innerHeight);
  app.renderer.view.style.position = "absolute";
  let levelData = [];
  const loader = PIXI.Loader.shared;

  loader.add("textFile", "./levels.txt").load((loader, resources) => {
    const textContent = resources.textFile.data;
    levelData = textContent.split("\n").map((row) => row.split(","));
    console.log(levelData);

    let blob = new Blob([], { type: "text/plain" });
    // Helper function to load images for a level
    function loadLevelImages(levelIndex) {
      const levelImages = levelData[levelIndex].slice(1, 8); // Get paths to images for the current level
      const images = [];

      // Set the desired size for images relative to the screen dimensions
      const imageSize = Math.min(playerWidth, playerHeigth) / 4;
      const imageSpacing = imageSize * 0.3; // Adjust the spacing between images

      // Calculate positions for each image based on the desired layout
      const positions = [];
      for (let i = 0; i < levelImages.length; i++) {
        if (i !== levelImages.length - 1) {
          const positionX =
            (i % 2) * (imageSize + imageSpacing) +
            playerWidth / 4 +
            imageSpacing;
          const positionY =
            Math.floor(i / 2) * (imageSize + imageSpacing) + playerHeigth / 4;
          positions.push({ x: positionX, y: positionY });
        } else {
          const positionX =
            0.5 * (imageSize + imageSpacing) + playerWidth / 4 + imageSpacing;
          const positionY =
            Math.floor(i / 2) * (imageSize + imageSpacing) + playerHeigth / 4;
          positions.push({ x: positionX, y: positionY });
        }
      }

      for (let i = 0; i < levelImages.length; i++) {
        const imagePath = levelImages[i];
        const imageSprite = new PIXI.Sprite.from(imagePath);

        // Scale and position images
        imageSprite.width = imageSize * 1.2;
        imageSprite.height = imageSize * 1.2;
        imageSprite.anchor.set(0.5);
        imageSprite.x = positions[i].x;
        imageSprite.y = positions[i].y;

        // Add interactivity
        if (i !== levelImages.length - 1) {
          imageSprite.interactive = true;
          imageSprite.buttonMode = true;
          imageSprite.on("pointerdown", () => {
            let dt = new Date().toISOString();
            //make dt in this format: year/month/day hour:minute:second
            dt = dt.replace(/-/g, "/");
            dt = dt.replace("T", " ");
            dt = dt.slice(0, 19);
            const pictureClicked = i + 1;
            console.log(levelData[levelIndex][8]);
            const isCorrect = pictureClicked == levelData[levelIndex][8];
            const action = `User-id:${UserID}, Game-id:${GameID}, dt:${dt}, L:${
              levelIndex + 1
            }, P:${pictureClicked}, C:${isCorrect ? "correct" : "wrong"}\n`;

            // Append the action to the actions array
            actions.push(action);

            // Write actions to file
            // writeToFile(actions.join("\n"));

            // Append the action to the blob
            blob = new Blob([blob, action], { type: "text/plain" });

            // Proceed to the next level when any image is clicked
            app.stage.removeChildren(); // Remove previous level images
            if (levelIndex < levelData.length - 1) {
              loadLevelImages(levelIndex + 1); // Load images for the next level
            } else {
              const message = new PIXI.Text("All levels completed!", {
                fontFamily: "Arial",
                fontSize: 36,
                fill: 0xff0000,
                align: "center",
              });
              message.anchor.set(0.5);
              message.x = app.renderer.width / 2;
              message.y = app.renderer.height / 4;
              app.stage.addChild(message);
              console.log("All levels completed!");
              // Create a temporary anchor element to download the file
              const downloadLink = document.createElement("a");
              downloadLink.download = "playerActions.txt";
              downloadLink.href = URL.createObjectURL(blob);

              // Trigger a click event on the anchor element to initiate the download
              downloadLink.click();
            }
          });
        }

        // Add border only to the last image
        if (i === levelImages.length - 1) {
          const border = new PIXI.Graphics();
          border.lineStyle(4, 0xff0000); // Border color and thickness
          border.drawRect(
            imageSprite.x - (imageSize / 2) * 1.2,
            imageSprite.y - (imageSize / 2) * 1.2,
            imageSize * 1.2,
            imageSize * 1.2
          );
          app.stage.addChild(border);
        }

        app.stage.addChild(imageSprite); // Add image to the stage
        images.push(imageSprite); // Store image sprites for later reference or manipulation
      }

      return images;
    }

    // Initial load of level 0
    loadLevelImages(0);
  });
}

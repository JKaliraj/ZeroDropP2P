const startbtn = document.querySelector(".startbtn");
const receivebtn = document.querySelector(".receivebtn");
const cancelbtn = document.querySelector(".cancelbtn");
const fileUpload = document.getElementById("fileUpload");
const selectbtn = document.querySelector(".selectbtn");
const sendbtn = document.querySelector(".sendbtn");
const sendbtndiv = document.querySelector(".sendbtndiv");
const counter = document.querySelector(".counter");
const senderdiv = document.querySelector(".sender");
const receiverdiv = document.querySelector(".receiver");
const senderimg = document.querySelector(".senderimg");
const receiverimg = document.querySelector(".receiverimg");
const col2 = document.querySelector(".col2");
const connectionStatus = document.querySelector("#connectionStatus");
const filestatus = document.querySelector(".filestatus");
const currentfile = document.querySelector(".currentfile");
const progressstatus = document.querySelector(".progressstatus");
const progressbar = document.getElementById("progress");
const progresslabel = document.getElementById("progressLabel");
const progressmain = document.querySelector(".progressmain");
const transferlink = document.querySelector(".link-i");

let roomcode;
let dataChannel, localConfigText, remoteConfigText;
let receiveBuffer = [];
let receivedSize = 0;
let receivedFile = {};
let localPeer;

function updateCount() {
  const count = +counter.innerHTML;
  const inc = Math.ceil((roomcode - count) / 10);
  if (count < roomcode && inc > 0) {
    counter.innerHTML = count + inc;
    requestAnimationFrame(updateCount);
  } else {
    counter.innerHTML = roomcode;
  }
}

function stopsharing(){
  db.ref(`peer/offer/${roomcode}/`).remove();
  startsharinghome();
  started = false;
  received = false;
  stopshare = false;
    if (dataChannel) {
      dataChannel.close();
      dataChannel = null;
    }
    if (localPeer) {
      localPeer.close();
      localPeer = null;
    }
}

let started = false;
let stopshare = false;
startbtn.addEventListener("click", async (event) => {
  event.preventDefault();
  if (!started) {
    progressbar.value = 0;
    progresslabel.innerText = "";
    started = true;
    roomcode = Math.floor(Math.random() * 90000 + 10000);
    senderdiv.style.display = "block";
    updateCount();
    startbtn.innerText = "Stop Sharing";
    startbtn.style.background = "#ca3361";
    stopshare = true;
    receivebtn.style.display = "none";
    receiverimg.src = "images/unknown.png";
    connectionStatus.innerHTML = "Waiting for Peer";
    
    localPeer = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'turn:numb.viagenie.ca',
          username: 'webrtc@live.com',
          credential: 'muazkh',
        },
      ],
    });
    // localPeer = new RTCPeerConnection({
    //   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    // });
    dataChannel = localPeer.createDataChannel("dataChannel");
    dataChannel.binaryType = "arraybuffer";
    dataChannel.onmessage = (msg) => onReceiveMessageCallback(msg);
    dataChannel.bufferedAmountLowThreshold = 0;
    dataChannel.onopen = () =>{ 
      connectionStatus.innerHTML = "Connected to Peer";
      receiverimg.src = "images/user.png";
      senderdiv.style.display= "none";
      selectbtn.style.transform = "scale(1)";
      sendbtn.style.transform = "scale(1)";
      progressstatus.style.display = "flex";
     };
     
    localPeer.onicecandidate = (o) => {
      localConfigText = JSON.stringify(localPeer.localDescription)
      db.ref(`peer/offer/${roomcode}/`).set({
        code: roomcode,
        localconfig:localConfigText,
      });
    };
    var answercount = 0;
    try{
      db.ref(`peer/offer/${roomcode}/`)
      .on("value", (snap) => {
        var data = snap.val();
        if (data != null && answercount==0) {
          remoteConfigText = data['remoteconfig'];
          remoteConnect(remoteConfigText);
          answercount++;
        }
      });
    }catch{}
    

    const localOffer = await localPeer.createOffer();
    localPeer.setLocalDescription(new RTCSessionDescription(localOffer));

    localPeer.ondatachannel = (e) => {
      dataChannel = e.channel;
      dataChannel.binaryType = "arraybuffer";
      dataChannel.bufferedAmountLowThreshold = 0;
      dataChannel.onmessage = (msg) => onReceiveMessageCallback(msg);
      dataChannel.onopen = () =>  {
        connectionStatus.innerHTML = "Connected to Peer."
        receiverimg.src = "images/user.png";
        senderdiv.style.display= "none";
        selectbtn.style.transform = "scale(1)";
        sendbtn.style.transform = "scale(1)";
        progressstatus.style.display = "flex";
      };
    };

    localPeer.oniceconnectionstatechange = function () {
      if (localPeer.iceConnectionState === "disconnected") {
        dataChannel = null;
        connectionStatus.innerHTML = "Disconnected from peer";
        stopsharing();
      }
    };

  } else {
    if(stopshare){
      stopsharing();
      return;
    }
  }
});

let received = false;
receivebtn.addEventListener('click',()=>{
    if(!received){
        received = true;
        stopshare = false;
        receiverdiv.style.display = "flex";
        receivebtn.innerText = "Join";
        receivebtn.style.background = "#e15e1b";
        startbtn.style.display = "none";
        cancelbtn.style.display = "block";
        var codeInputs = numberCodeForm.querySelectorAll("[data-number-code-input]");
        codeInputs.forEach((input) => {
          input.value="";
        });
        codeInputs[0].focus();
    }else{
      
        if(stopshare){
          stopsharing();
          return;
        }else if (!started) {
          // localPeer = new RTCPeerConnection({
          //   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          // });

          localPeer = new RTCPeerConnection({
            iceServers: [
              {
                urls: 'turn:numb.viagenie.ca',
                username: 'webrtc@live.com',
                credential: 'muazkh',
              },
            ],
          });
          
          localPeer.ondatachannel = (e) => {
            dataChannel = e.channel;
            dataChannel.binaryType = "arraybuffer";
            dataChannel.bufferedAmountLowThreshold = 0;
            dataChannel.onmessage = (msg) => onReceiveMessageCallback(msg);
            dataChannel.onopen = () => {
              connectionStatus.innerHTML = "Connected to Peer";
              receiverimg.src = "images/user.png";
              senderdiv.style.display= "none";
              receiverdiv.style.display= "none";
              startbtn.style.display= "block";
              cancelbtn.style.display= "none";
              startbtn.innerText = "Stop Sharing";
              startbtn.style.background = "#ca3361";
              stopshare = true;
              started = true;
              receivebtn.style.display = "none";
              selectbtn.style.transform = "scale(1)";
              sendbtn.style.transform = "scale(1)";
              progressstatus.style.display = "flex";             
            };
            
          };
          
          localPeer.oniceconnectionstatechange = function () {
            if (localPeer.iceConnectionState === "disconnected") {
              dataChannel = null;
              connectionStatus.innerHTML =  "Disconnected from Peer";
              stopsharing()
            }
          };
        }
        
        const getCode = () => {
          const codeInputs = numberCodeForm.querySelectorAll("[data-number-code-input]");
          let code = "";
      
          codeInputs.forEach((input) => {
            code += input.value;
          });
          return code;
        };
        roomcode = getCode();

        db.ref(`peer/offer/${roomcode}/`)
        .on("value", (snap) => {
          var data = snap.val();
          if (data != null) {
            remoteConfigText = data['localconfig'];
            remoteConnect(remoteConfigText);
          }
        });
    }
})


function remoteConnect(remoteConfigText){
  localPeer.setRemoteDescription(JSON.parse(remoteConfigText));
  localPeer.localDescription == null ? localPeer .createAnswer()
  .then((answer) => localPeer.setLocalDescription(answer))
  : null;
  localPeer.onicecandidate = (o) =>{ 
    localConfigText = JSON.stringify(localPeer.localDescription) 

    db.ref("peer/offer/" + roomcode + "/").update({
      remoteconfig:localConfigText,
    });
  };
}

cancelbtn.addEventListener('click',()=>{
  stopsharing()
})

// Number input
const numberCodeForm = document.querySelector(".code");
const numberCodeInputs = [...numberCodeForm.querySelectorAll("[data-number-code-input]")];

const handleInput = ({ target }) => {
  if (!target.value.length) {
    return (target.value = null);
  }

  const inputLength = target.value.length;
  let currentIndex = Number(target.dataset.numberCodeInput);

  if (inputLength > 1) {
    const inputValues = target.value.split("");

    inputValues.forEach((value, valueIndex) => {
      const nextValueIndex = currentIndex + valueIndex;

      if (nextValueIndex >= numberCodeInputs.length) {
        return;
      }

      numberCodeInputs[nextValueIndex].value = value;
    });

    currentIndex += inputValues.length - 2;
  }

  const nextIndex = currentIndex + 1;

  if (nextIndex < numberCodeInputs.length) {
    numberCodeInputs[nextIndex].focus();
  }
};

const handleKeyDown = (e) => {
  const { code, target } = e;

  const currentIndex = Number(target.dataset.numberCodeInput);
  const previousIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;

  const hasPreviousIndex = previousIndex >= 0;
  const hasNextIndex = nextIndex <= numberCodeInputs.length - 1;

  switch (code) {
    case "ArrowLeft":
    case "ArrowUp":
      if (hasPreviousIndex) {
        numberCodeInputs[previousIndex].focus();
      }
      e.preventDefault();
      break;

    case "ArrowRight":
    case "ArrowDown":
      if (hasNextIndex) {
        numberCodeInputs[nextIndex].focus();
      }
      e.preventDefault();
      break;
    case "Backspace":
      if (!e.target.value.length && hasPreviousIndex) {
        numberCodeInputs[previousIndex].value = null;
        numberCodeInputs[previousIndex].focus();
      }
      break;
    default:
      break;
  }
};

numberCodeForm.addEventListener("input", handleInput);
numberCodeForm.addEventListener("keydown", handleKeyDown);


sendbtn.addEventListener("click", function () {
  if (dataChannel && dataChannel.readyState === "open") {
    sendbtndiv.style.transform = "scale(0)";
    fileUpload.disabled = true;
    sendData();
  } else {
    console.log("Data channel is not ready.");
  }
});

fileUpload.addEventListener("change", function () {
  if (fileUpload.files.length === 0) {
    currentfile.innerHTML = "";
    sendbtndiv.style.transform = "scale(0)"
    return;
  }
  const file = fileUpload.files[0];
  currentfile.innerHTML = ` <div class="file">
                                  <img src="images/file.svg" alt="">
                                  <p class="filename">${minimizeFilename(file.name)}</p>
                                  <p class="filesize">${bytesToSize(file.size)}</p>
                            </div>`;
  progressbar.max = file.size;
  progressbar.value = 0;
  progressLabel.innerHTML = "0%";
  sendbtn.style.display = "block";
  sendbtndiv.style.transform = "scale(1)";
  dataChannel.send(
    JSON.stringify({
      name: file.name,
      size: file.size,
      type: file.type,
    })
  );
});

function sendData() {
  let file = fileUpload.files[0];
  let offset = 0;
  let maxChunkSize = 262144;
  progressbar.value = 0;

  file.arrayBuffer().then((buffer) => {
    const sendChunk = () => {
      if (offset >= file.size) {
        return;
      }
      
      if (dataChannel.bufferedAmount <= dataChannel.bufferedAmountLowThreshold) {
        const chunk = buffer.slice(offset, offset + maxChunkSize);
        dataChannel.send(chunk);
        offset += maxChunkSize;
        // console.log("Sent " + offset + " bytes.");
        transferlink.classList.add('lefttransfer');
        progressmain.style.display = "flex";
        progressbar.value = offset >= file.size ? file.size : offset;
        progresslabel.innerHTML = offset >= file.size ? "Sent" : ((offset / file.size) * 100).toFixed(1) + "%";
        currentfile.innerHTML = offset >= file.size ? "":currentfile.innerHTML ;
        if(offset >= file.size){
          const myfilediv = document.createElement('div');
          progressmain.style.display = "none";
          myfilediv.className = "file";
          myfilediv.innerHTML =  ` <img src="images/file.svg" alt="">
          <p class="filename">${minimizeFilename(file.name)}</p>
          <div class="status">
            <p class="filesize">${bytesToSize(file.size)}</p>
            <img src="images/check.svg" alt="Sent">
          </div>`
          var firstChild = filestatus.firstElementChild;
          if (firstChild) {
            filestatus.insertBefore(myfilediv, firstChild);
          } else {
            filestatus.appendChild(myfilediv);
          }
          fileUpload.disabled = false;
          transferlink.classList.remove('lefttransfer');
        }
      }
      
      // Throttle the sending with a small delay (e.g., 10 milliseconds)
      setTimeout(sendChunk, 10);
    };

    sendChunk();
  });
}

let isNewFile = true; // Flag to indicate if a new file is being received

function onReceiveMessageCallback(event) {
  const data = event.data;
  if (typeof data === "string") {
    try {
      const file = JSON.parse(data);
      receivedFile = file;
      progressbar.max = file.size;
      progressbar.value = 0;
      receivedSize = 0;
      receiveBuffer = [];
      isNewFile = false;
    } catch (error) {
      console.error("Error parsing received metadata:", error);
    }
  } else if (data instanceof ArrayBuffer) {
    receiveBuffer.push(data);
    progressmain.style.display = "flex";
    sendbtn.style.display = "none";
    sendbtndiv.style.transform = "scale(1)";
    receivedSize += data.byteLength;
    progressbar.value = receivedSize;
    var progresscount = ((receivedSize / receivedFile.size) * 100).toFixed(0) + "%";
    progressLabel.innerHTML = (progresscount == "100%" ? "Received":progresscount);
    transferlink.classList.add('righttransfer');
    if (receivedSize == receivedFile["size"]) {
      const blob = new Blob(receiveBuffer, { type: receivedFile["type"] });
      const myfilediv = document.createElement('a');
      myfilediv.href = URL.createObjectURL(blob);
      myfilediv.download = receivedFile["name"];
      myfilediv.innerHTML = `<div class="file">
      <img src="images/file.svg" alt="">
      <p class="filename">${minimizeFilename(receivedFile["name"])}</p>
      <div class="status">
        <p class="filesize">${bytesToSize(receivedFile["size"])}</p>
        <img src="images/download.svg" alt="" class="downloadbtn">
      </div>
    </div>`;
    progressmain.style.display = "none";
    var firstChild = filestatus.firstElementChild;
    if (firstChild) {
      filestatus.insertBefore(myfilediv, firstChild);
    } else {
      filestatus.appendChild(myfilediv);
    }
      
      progressbar.value = 0;
      receiveBuffer = [];
      receivedSize = 0;
      receivedFile = {};
      isNewFile = true;
      transferlink.classList.remove('righttransfer');
    }
  } else {
    console.error("Received unexpected data:", data);
  }


}

function startsharinghome(){
  senderdiv.style.display = "none";
  startbtn.style.display = "block";
  startbtn.innerText = "Start Sharing";
  startbtn.style.background = "#3be8b1de";
  receivebtn.style.display = "block";
  receivebtn.innerText = "Receive";
  receivebtn.style.background = "#1ea1e4";
  selectbtn.style.transform = "scale(0)";
  sendbtn.style.transform = "scale(0)";
  progressstatus.style.display = "none";
  receiverimg.src = "images/unknown.png";
  connectionStatus.innerHTML = "Waiting for Peer";
  receiverdiv.style.display = "none";
  cancelbtn.style.display = "none";
  transferlink.classList.remove('lefttransfer');
  transferlink.classList.remove('righttransfer');
  progressmain.style.display = "none";
  currentfile.innerHTML = "";
  sendbtndiv.style.transform = "scale(0)";
  fileUpload.disabled = false;
}

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

function minimizeFilename(filename, maxLength = 35) {
  if (filename.length <= maxLength) {
    return filename; // If filename is already within or equal to the desired length, return it as is.
  } else {
    const ellipsis = '...';
    const filenameWithoutExtension = filename.split('.').slice(0, -1).join('.'); // Remove file extension (if any)
    const truncatedFilename = filenameWithoutExtension.substr(0, maxLength - ellipsis.length);
    return truncatedFilename + ellipsis;
  }
}

window.addEventListener('beforeunload', function (event) {
  stopsharing()
  event.preventDefault();
  event.returnValue = '';
  const confirmationMessage = 'Are you sure you want to leave?';
  return confirmationMessage;
});
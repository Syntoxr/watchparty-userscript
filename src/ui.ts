import uiHtml from "./html/ui.html"

document.body.insertAdjacentHTML("beforeend", uiHtml);

let url = ""
let token = ""
let roomName = ""


const inputUrl = document.getElementById("wp-url-input") as HTMLInputElement
const inputToken = document.getElementById("wp-token-input") as HTMLInputElement
const inputRoom = document.getElementById("wp-room-input") as HTMLInputElement


const buttonSetUrl = document.getElementById("wp-set-url-button") as HTMLButtonElement
const buttonSetToken = document.getElementById("wp-set-token-button") as HTMLButtonElement
const buttonSetRoom = document.getElementById("wp-join-create-button") as HTMLButtonElement


inputUrl.value = url
inputToken.value = token
inputRoom.value = roomName





buttonSetUrl.onclick = () => {
    url = inputUrl.value
}

buttonSetToken.onclick = () => {
    token = inputToken.value
}

buttonSetRoom.onclick = () => {
    roomName = inputRoom.value
}


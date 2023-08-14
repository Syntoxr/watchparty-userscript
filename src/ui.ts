import uiHtml from "./html/ui.html"

document.body.insertAdjacentHTML("beforeend", uiHtml);
let configVisible = false

export const ui = {}


const wpConfig = document.getElementById("wp-config")
const expandButton = document.getElementById("wp-expand-button")


expandButton.onclick = () => {
    configVisible = !configVisible;
    console.log(configVisible)
    wpConfig.classList.toggle("wp-hidden")
}



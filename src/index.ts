import "./style/normalize.css"
import "./style/main.less";
import { ui } from "./ui"


async function main() {
  console.log("watchparty start");
  console.log(ui)
}



main().catch((e) => {
  console.log(e);

});

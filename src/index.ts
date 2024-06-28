import { UI } from "./ui";

async function main() {
  console.log("watchparty starting");
  const ui = new UI();
}

main().catch((e) => {
  console.error(e);
});

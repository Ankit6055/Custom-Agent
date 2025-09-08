import readline from "node:readline/promises";

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const userInput = await rl.question("You: ");
  console.log("You said:",userInput);

  rl.close();
}

main();

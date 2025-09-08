import { stat } from "node:fs";
import readline from "node:readline/promises";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";

/*
1. Define node function
2. Build the graph
3. Compile and invoke the graph
*/

function callModel(state: typeof MessagesAnnotation.State) {
  // call the LLMs using APIs
  return state;
}

// Build the graph
const workFlow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent")
  .addEdge("agent", "__end__");

// Compile the graph
const app = workFlow.compile();

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const userInput = await rl.question("You: ");

    if (userInput === "/bye") break;
    
    // Invoke the graph
    const finalState = await app.invoke({
      messages: [{ role: "user", content: userInput }],
    });

    console.log("Final: ", finalState);
  }

  rl.close();
}

main();

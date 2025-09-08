import { stat } from "node:fs";
import readline from "node:readline/promises";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";

/*
1. Define node function
2. Build the graph
3. Compile and invoke the graph
*/

// Initialise the LLM
const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxRetries: 2,
  // other params...
});

function callModel(state: typeof MessagesAnnotation.State) {
  // call the LLMs using APIs
  console.log("Calling LLM...")
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

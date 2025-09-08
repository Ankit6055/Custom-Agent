import { stat } from "node:fs";
import readline from "node:readline/promises";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";

const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
  // includeAnswer: false,
  // includeRawContent: false,
  // includeImages: false,
  // includeImageDescriptions: false,
  // searchDepth: "basic",
  // timeRange: "day",
  // includeDomains: [],
  // excludeDomains: [],
});

// Initialise the tool node
const tools: any = [];
const toolNode = new ToolNode(tools);

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

async function callModel(state: typeof MessagesAnnotation.State) {
  // call the LLMs using APIs
  console.log("Calling LLM...");
  const response = await llm.invoke(state.messages);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}

function shouldContinue(state: any) {
  // put your condition
  // whether to call a tool or end

  console.log("state", state);
  return "__end__";
}

// Build the graph
const workFlow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addEdge("agent", "__end__")
  .addConditionalEdges("agent", shouldContinue);

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
    const lastMessage = finalState.messages[finalState.messages.length - 1];
    console.log("AI: ", lastMessage?.content);
  }

  rl.close();
}

main();

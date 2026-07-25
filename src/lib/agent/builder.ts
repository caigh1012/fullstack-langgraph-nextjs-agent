import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseCheckpointSaver, END, MessagesAnnotation, START, StateGraph } from '@langchain/langgraph';

/**
 * Agent 构建
 */
export class AgentBuilder {
  private readonly model: BaseChatModel;
  private checkpointer?: BaseCheckpointSaver;

  constructor({ llm, checkpointer }: { llm: BaseChatModel; checkpointer?: BaseCheckpointSaver }) {
    if (!llm) {
      throw new Error('Language model (llm) is required');
    }
    this.model = llm;
    this.checkpointer = checkpointer;
  }

  private async callModel(state: typeof MessagesAnnotation.State) {
    if (!this.model) {
      throw new Error('Invalid or missing language model (llm)');
    }
    const response = await this.model.invoke(state.messages);

    return { messages: response };
  }

  build() {
    const stateGraph = new StateGraph(MessagesAnnotation);
    stateGraph.addNode('agent', this.callModel.bind(this)).addEdge(START, 'agent').addEdge('agent', END);
    const compiledGraph = stateGraph.compile({ checkpointer: this.checkpointer });
    return compiledGraph;
  }
}

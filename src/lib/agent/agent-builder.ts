import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ContentBlock, SystemMessage, ToolCall, ToolMessage } from '@langchain/core/messages';
import { DynamicTool } from '@langchain/core/tools';
import {
  BaseCheckpointSaver,
  Command,
  END,
  interrupt,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

/**
 * Agent 构建器
 */
export class AgentBuilder {
  private toolNode: ToolNode;
  private readonly model: BaseChatModel;
  private checkpointer?: BaseCheckpointSaver;
  private systemPrompt: string = '';
  private tools: DynamicTool[];
  private approveAllTools: boolean;

  constructor({
    llm,
    prompt,
    checkpointer,
    tools,
    approveAllTools = false,
  }: {
    llm: BaseChatModel;
    tools: DynamicTool[];
    prompt: string;
    checkpointer?: BaseCheckpointSaver;
    approveAllTools?: boolean;
  }) {
    if (!llm) {
      throw new Error('Language model (llm) is required');
    }
    this.model = llm;
    this.tools = tools || [];
    this.toolNode = new ToolNode(tools || []);
    this.checkpointer = checkpointer;
    this.systemPrompt = prompt;
    // 预留审批模式配置，供后续工具审批逻辑接入。
    this.approveAllTools = approveAllTools;
  }

  private shouldApproveTool(state: typeof MessagesAnnotation.State) {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    if ('tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls?.length) {
      return 'tool_approval';
    }
    return END;
  }

  private async approveToolCall(state: typeof MessagesAnnotation.State) {
    if (this.approveAllTools) {
      return new Command({ goto: 'tools' });
    }
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];

    if ('tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls?.length) {
      const toolCall = lastMessage.tool_calls![lastMessage.tool_calls!.length - 1];

      const humanReview = interrupt<
        {
          question: string;
          toolCall: ToolCall;
        },
        {
          action: string;
          data: string | ContentBlock[];
        }
      >({
        question: 'Is this correct?',
        toolCall: toolCall,
      });

      const reviewAction = humanReview.action;
      const reviewData = humanReview.data;
      if (reviewAction === 'continue') {
        return new Command({ goto: 'tools' });
      } else if (reviewAction === 'update') {
        const updatedMessage = {
          role: 'ai',
          content: lastMessage.content,
          tool_calls: [
            {
              id: toolCall.id,
              name: toolCall.name,
              args: reviewData,
            },
          ],
          id: lastMessage.id,
        };
        return new Command({
          goto: 'tools',
          update: { messages: [updatedMessage] },
        });
      } else if (reviewAction === 'feedback') {
        const toolMessage = new ToolMessage({
          name: toolCall.name,
          content: reviewData,
          tool_call_id: toolCall.id,
        });
        return new Command({
          goto: 'agent',
          update: { messages: [toolMessage] },
        });
      }
      throw new Error('Invalid review action');
    }
  }

  private async callModel(state: typeof MessagesAnnotation.State) {
    if (!this.model || !this.model.bindTools) {
      throw new Error('Invalid or missing language model (llm)');
    }

    const messages = [
      // 始终添加系统提示，避免在消息中重复显示
      new SystemMessage(this.systemPrompt),
      ...state.messages,
    ];

    const modelInvoker = this.model.bindTools(this.tools);
    const response = await modelInvoker.invoke(messages);

    return { messages: response };
  }

  build() {
    const stateGraph = new StateGraph(MessagesAnnotation);
    stateGraph
      .addNode('agent', this.callModel.bind(this))
      .addNode('tools', this.toolNode)
      .addNode('tool_approval', this.approveToolCall.bind(this), {
        ends: ['tools', 'agent'],
      })
      .addEdge(START, 'agent')
      .addConditionalEdges('agent', this.shouldApproveTool.bind(this), ['tool_approval', END])
      .addEdge('tools', 'agent');
    const compiledGraph = stateGraph.compile({ checkpointer: this.checkpointer });
    return compiledGraph;
  }
}

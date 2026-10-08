# frozen_string_literal: true

module AIAssistant
  # Runs one turn of a conversation: replays the stored messages to the model and stores its
  # reply.
  class Runner
    MAX_OUTPUT_TOKENS = 16_000
    # Bedrock refuses two user turns in a row, which happens when a turn failed before the
    # user wrote again.
    NO_REPLY_TEXT = '(No reply.)'

    attr_reader :conversation

    def initialize(conversation)
      @conversation = conversation
      @context = Context.for(conversation)
    end

    def run
      unless @context.available?
        conversation.update!(status: 'failed', last_error_code: 'context_unavailable')
        return
      end

      chat = build_chat
      replay(chat)
      chat.complete
      finish
    end

    private

    def build_chat
      llm = LLMSelector.new.llm_class_for_use_case('ai_assistant').new

      llm.chat_context
        .chat(model: llm.model, **llm.chat_options)
        .with_instructions(@context.system_prompt(locale: conversation.locale))
        .with_params(inferenceConfig: { maxTokens: MAX_OUTPUT_TOKENS })
        .after_message { |message| persist(message) }
    end

    def finish
      conversation.update!(status: 'idle', last_error_code: nil)
    end

    def replay(chat)
      user_turn_open = false

      conversation.messages.each do |message|
        if message.user?
          chat.add_message(role: :assistant, content: NO_REPLY_TEXT) if user_turn_open
          chat.add_message(role: :user, content: message.content)
          user_turn_open = true
        else
          next if message.content.blank?

          chat.add_message(role: :assistant, content: message.content)
          user_turn_open = false
        end
      end
    end

    def persist(message)
      persist_assistant_message(message) if message.role == :assistant
    end

    def persist_assistant_message(message)
      conversation.messages.create!(
        role: 'assistant',
        content: text_of(message.content),
        input_tokens: message.input_tokens,
        output_tokens: message.output_tokens
      )
    end

    def text_of(content)
      content.is_a?(RubyLLM::Content) ? content.text : content&.to_s.presence
    end
  end
end

# frozen_string_literal: true

module AIAssistant
  # Stops the turn to ask the user questions. Their answers become the result of the call
  # (see ToolCallDecider#answer!), and the turn continues from there.
  class AskUserTool < RubyLLM::Tool
    NAME = 'ask_user'
    ASKED_TEXT = 'Sent to the administrator, who will answer.'

    SCHEMA = {
      'type' => 'object',
      'properties' => {
        'questions' => {
          'type' => 'array',
          'minItems' => 1,
          'maxItems' => 8,
          'items' => {
            'type' => 'object',
            'properties' => {
              'question' => { 'type' => 'string', 'description' => 'One short question.' },
              'options' => {
                'type' => 'array',
                'minItems' => 2,
                'maxItems' => 5,
                'items' => { 'type' => 'string' },
                'description' => 'Short suggested answers. The administrator can also write their own.'
              },
              'multi_select' => { 'type' => 'boolean', 'description' => 'Whether several options can be picked.' }
            },
            'required' => %w[question options],
            'additionalProperties' => false
          }
        }
      },
      'required' => %w[questions],
      'additionalProperties' => false
    }.freeze
    INPUT_SCHEMA = MCP::Tool::InputSchema.new(SCHEMA)

    # Why the questions can't be shown to the user, or nil.
    def self.validation_error(arguments)
      INPUT_SCHEMA.validate_arguments(arguments)
      nil
    rescue MCP::Tool::InputSchema::ValidationError => e
      e.message
    end

    def initialize(turn)
      super()
      @turn = turn
    end

    def name = NAME

    def description
      <<~DESC.squish
        Asks the administrator up to 4 questions, each with suggested answers they can click.
        Use it instead of asking in your reply. Stop after calling it: the answers come back
        as the result of this call.
      DESC
    end

    def params_schema = SCHEMA

    def execute(**args)
      @turn.ask_user(args.deep_stringify_keys)
    end
  end
end

# frozen_string_literal: true

module Analysis
  # The planner is responsible for defining a plan on how to optimally summarize
  # a given scope of inputs.
  class SummarizationPlanner
    SUMMARIZATION_METHOD_CLASSES = [
      SummarizationMethod::OnePassLLM
    ]

    LLMS = [
      LLM::GPT48k.new,
      LLM::GPT432k.new,
      LLM::GPT3516k.new
    ]

    attr_accessor :inputs

    # The plan is the output of the SummarizationPlanner. It describes how the
    # summarization should be done, mainly what method and which LLM to use
    class Plan
      include ActiveModel::API
      QUALITIES = %i[low medium high]
      IMPOSSIBLE_REASONS = [:too_many_inputs]

      attr_accessor :summarization_method_class, :llm, :truncate_values, :include_id, :shorten_labels, :accuracy, :impossible_reason

      with_options unless: -> { impossible_reason } do
        validates :summarization_method_class, inclusion: { in: SUMMARIZATION_METHOD_CLASSES }
        validates :llm, inclusion: { in: LLMS }
        validates :truncate_values, numericality: { only_integer: true }, allow_blank: true
        validates :include_id, inclusion: { in: [true, false] }, allow_blank: true
        validates :shorten_labels, inclusion: { in: [true, false] }, allow_blank: true
        validates :accuracy, inclusion: { in: QUALITIES }
      end

      validates :impossible_reason, inclusion: { in: IMPOSSIBLE_REASONS }, allow_blank: true

      def id
        @id ||= SecureRandom.uuid
      end
    end

    def initialize(analysis, inputs)
      @analysis = analysis
      @inputs = inputs
      @input_to_text = InputToText.new(analysis.custom_fields)
    end

    # To keep the logic sane, we accept that `execute` is aware of internals of
    # the different summarization methods
    #
    # returns a SummarizationPlan
    def execute
      generate_one_pass_plan || Plan.new(
        impossible_reason: :too_many_inputs
      )
    end

    private

    def generate_one_pass_plan
      plan = nil
      # We try whether OnePassLLM can process the complete prompt, with
      # descending amounts of information
      [
        { include_id: true, shorten_labels: false },
        { include_id: true, shorten_labels: true },
        { include_id: false, shorten_labels: true },
        { include_id: true, shorten_labels: true, truncate_values: 512 },
        { include_id: true, shorten_labels: true, truncate_values: 256 },
        { include_id: false, shorten_labels: true, truncate_values: 128 }
      ].each do |input_to_text_options|
        # Calculate the prompt size
        inputs_text = @input_to_text.format_all(inputs, **input_to_text_options)
        prompt = SummarizationMethod::OnePassLLM.prompt(@analysis.source_project, inputs_text)
        complete_token_count = token_count(prompt)

        # Is there an LLM that can handle the prompt size?
        selected_llm = enabled_llms
          .sort_by { |llm| -llm.accuracy_score }
          .find { |llm| llm.context_window >= complete_token_count }

        # If yes, let's define the plan
        if selected_llm
          plan = Plan.new(
            summarization_method_class: SummarizationMethod::OnePassLLM,
            llm: selected_llm,
            accuracy: selected_llm.accuracy,
            **input_to_text_options
          )
          break
        end
      end

      plan
    end

    # For now, we assume GPT tokenization for all llms
    def token_count(str)
      LLM::OpenAIGPT.token_count(str)
    end

    def enabled_llms
      LLMS.select(&:enabled?)
    end
  end
end

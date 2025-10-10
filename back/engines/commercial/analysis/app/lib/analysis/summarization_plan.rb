# frozen_string_literal: true

module Analysis
  # The plan is the output of the #plan method on the summarization method. It
  # describes how the summarization should be done, mainly what method and which
  # LLM to use
  class SummarizationPlan
    include ActiveModel::API
    IMPOSSIBLE_REASONS = [:too_many_inputs]

    attr_accessor :summarization_method_class, :llm, :truncate_values, :include_id, :shorten_labels, :accuracy, :impossible_reason, :include_comments

    # These validations are not being used the model is not persisted and
    # `validate` is not triggered. Consider them extra documentation to
    # understand the data attributes, potentially useful in the future when we
    # do decide to persist
    with_options unless: -> { impossible_reason } do
      validates :summarization_method_class, inclusion: { in: SummarizationMethod::Base.method_classes }
      validates :llm, inclusion: { in: SummarizationMethod::Base::LLMS }
      validates :truncate_values, numericality: { only_integer: true }, allow_blank: true
      validates :include_id, inclusion: { in: [true, false] }, allow_blank: true
      validates :shorten_labels, inclusion: { in: [true, false] }, allow_blank: true
      validates :accuracy, numericality: { in: 0..1 }, allow_blank: true
      validates :include_comments, inclusion: { in: [true, false] }, allow_blank: true
    end

    validates :impossible_reason, inclusion: { in: IMPOSSIBLE_REASONS }, allow_blank: true

    # We don't persist, but we need an id for the serializer
    def id
      @id ||= SecureRandom.uuid
    end

    def possible?
      !impossible_reason
    end
  end
end

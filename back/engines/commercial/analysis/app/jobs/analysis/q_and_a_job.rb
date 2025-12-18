# frozen_string_literal: true

module Analysis
  class QAndAJob < ApplicationJob
    self.priority = 45 # Slighltly more important than emails (50)

    UNRECOVERABLE_ERRORS = [
      LLM::UnsupportedAttachmentError,
      LLM::TooManyImagesError
    ].freeze

    def run(question)
      # Make the question available to other methods
      @question = question

      # even though the plan was normally already generated once in
      # questions#create, we generate it again since the inputs might have
      # changed between enqueueing and executing this job
      plan = QAndAMethod::Base.plan(question)

      # @type [Analysis::QAndAMethod::Base]
      q_and_a_method = plan.q_and_a_method_class.new(question)
      q_and_a_method.execute!(plan)
    end

    def handle_error(error)
      @error = error # make the error accessible in the `expire` method

      case error
      when LLM::PreviewPendingError then retry_in(15.seconds)
      when LLM::TooManyRequestsError then retry_in(1.minute)
      when *UNRECOVERABLE_ERRORS then expire
      else super
      end
    end

    def expire
      mark_as_failed!(@error)
      super
    end

    # @param [StandardError,nil] error
    def mark_as_failed!(error)
      @question.background_task.set_failed!(error)
    end
  end
end

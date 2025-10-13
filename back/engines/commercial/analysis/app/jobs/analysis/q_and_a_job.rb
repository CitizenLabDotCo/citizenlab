# frozen_string_literal: true

module Analysis
  class QAndAJob < ApplicationJob
    self.priority = 45 # Slighltly more important than emails (50)

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
      case error
      when LLM::PreviewPendingError then retry_in(15.seconds)
      when LLM::TooManyRequestsError then retry_in(1.minute)
      when LLM::UnsupportedAttachmentError then expire
      else super
      end
    end

    def expire
      @question.task.set_failed!
      expire
    end
  end
end

# frozen_string_literal: true

module Analysis
  class QAndAJob < ApplicationJob
    queue_as :default

    def run(question)
      # even though the plan was normally already generated once in
      # questions#create, we generate it again since the inputs might have
      # changed between enqueueing and executing this job
      plan = QAndAMethod::Base.plan(question)

      q_and_a_method = plan.q_and_a_method_class.new(question)
      q_and_a_method.execute(plan)
    end
  end
end

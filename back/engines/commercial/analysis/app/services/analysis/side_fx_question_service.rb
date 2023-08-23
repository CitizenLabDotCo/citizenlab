# frozen_string_literal: true

module Analysis
  class SideFxQuestionService
    include SideFxHelper

    def after_create(question, user)
      LogActivityJob.perform_later(question, 'created', user, question.created_at.to_i)
    end

    def after_destroy(frozen_question, user)
      serialized_question = clean_time_attributes(frozen_question.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_question), 'deleted', user, Time.now.to_i, payload: { question: serialized_question })
    end
  end
end

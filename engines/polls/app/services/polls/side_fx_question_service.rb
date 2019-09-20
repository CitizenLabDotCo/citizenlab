module Polls
	class SideFxQuestionService
		include SideFxHelper

		def before_create question, user
		end

		def after_create question, user
      LogActivityJob.perform_later(question, 'created', user, question.created_at.to_i)
		end

		def before_update question, user
		end

		def after_update question, user
      LogActivityJob.perform_later(question, 'changed', user, question.updated_at.to_i)
		end

	  def before_destroy question, user
	  end

	  def after_destroy frozen_question, user
	    serialized_question = clean_time_attributes(frozen_question.attributes)
	    LogActivityJob.perform_later(encode_frozen_resource(frozen_question), 'deleted', user, Time.now.to_i, payload: {question: serialized_question})
	  end
	end
end
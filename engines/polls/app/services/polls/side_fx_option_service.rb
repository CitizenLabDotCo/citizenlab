module Polls
	class SideFxOptionService
		include SideFxHelper

		def before_create option, user
		end

		def after_create option, user
      LogActivityJob.perform_later(option, 'created', user, option.created_at.to_i)
		end

		def before_update option, user
		end

		def after_update option, user
      LogActivityJob.perform_later(option, 'changed', user, option.updated_at.to_i)
		end

	  def before_destroy option, user
	  end

	  def after_destroy frozen_option, user
	    serialized_question = clean_time_attributes(frozen_option.attributes)
	    LogActivityJob.perform_later(encode_frozen_resource(frozen_option), 'deleted', user, Time.now.to_i, payload: {option: serialized_question})
	  end
	end
end
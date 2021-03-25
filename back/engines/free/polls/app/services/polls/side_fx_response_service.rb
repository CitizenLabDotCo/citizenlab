module Polls
	class SideFxResponseService
		include SideFxHelper

		def before_create response, user
		end

		def after_create response, user
      LogActivityJob.perform_later(response, 'created', user, response.created_at.to_i)
		end

	end
end
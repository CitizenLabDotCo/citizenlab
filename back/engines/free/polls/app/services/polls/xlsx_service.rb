module Polls
	class XlsxService

		def generate_poll_results_xlsx participation_context, responses, current_user
      multiloc_service = MultilocService.new
      is_anonymous = participation_context.poll_anonymous?
      questions = Polls::Question
        .where(participation_context: participation_context)
        .order(:ordering)

      columns = if is_anonymous
        []
      else
				if current_user.admin?
	        [
						{
		          header: 'User ID',
		          f: -> (r) { r.user_id },
		          skip_sanitization: true
		        },
						{
		          header: 'First Name',
		          f: -> (r) { r.user.first_name },
		        },
						{
		          header: 'Last Name',
		          f: -> (r) { r.user.first_name },
		        },
						{
		          header: 'Email',
		          f: -> (r) { r.user.email },
		        }
					]
				else
					[
						{
		          header: 'User ID',
		          f: -> (r) { r.user_id },
		          skip_sanitization: true
		        },
						{
		          header: 'First Name',
		          f: -> (r) { r.user.first_name },
		        },
						{
		          header: 'Last Name',
		          f: -> (r) { r.user.first_name },
		        },
					]
				end
      end
      columns += questions.map do |q|
        {
          header: multiloc_service.t(q.title_multiloc),
          f: -> (r) { extract_responses(r, q.id, multiloc_service) }
        }
      end
      ::XlsxService.new.generate_xlsx 'Poll results', columns, responses
    end


    private

    def extract_responses(response_obj, question_id, multiloc_service)
      resp_opts = response_obj.response_options.select{|ro| ro.option.question_id == question_id}
      return '' if resp_opts.blank?

      resp_opts
        .map{ |ro| multiloc_service.t(ro.option.title_multiloc) }
        .join(', ')
    end

	end
end

module Polls
	class ExportService

		def generate_poll_results_xlsx participation_context, responses
      multiloc_service = MultilocService.new
      is_anonymous = participation_context.poll_anonymous?
      questions = Polls::Question
        .where(participation_context: participation_context)
        .order(:ordering)

      pa = Axlsx::Package.new
      wb = pa.workbook
      wb.styles do |s|
        wb.add_worksheet(name: 'Poll results') do |sheet|
          header_row = is_anonymous ? [] : ['User ID']
          header_row += questions.map{|q| multiloc_service.t(q.title_multiloc)}
          sheet.add_row(header_row, style: XlsxService.new.header_style(s))

          responses.includes(:user, response_options: [:option]).each do |resp_obj|
            user_responses = questions.map { |q| extract_responses(resp_obj, q.id, multiloc_service) }
            response_row = is_anonymous ? [] : [resp_obj.user.id]
            response_row += user_responses
            sheet.add_row response_row
          end
        end
      end
      pa.to_stream
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
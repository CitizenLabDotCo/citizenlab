module Polls
	class ExportService

		def generate_poll_results_xlsx participation_context, responses
      multiloc_service = MultilocService.new
      questions = Polls::Question.where(participation_context: participation_context)
        .order(:ordering)

      pa = Axlsx::Package.new
      wb = pa.workbook
      wb.styles do |s|
        wb.add_worksheet(name: 'Poll results') do |sheet|
          sheet.add_row [
            *(participation_context.poll_anonymous? ? [] : ['User ID']),
            *questions.map{|q| multiloc_service.t(q.title_multiloc)}
          ], style: XlsxService.new.header_style(s)
          responses.includes(:user, response_options: [:option]).each do |response|
            user_options = questions.map do |q|
              ros = response.response_options.select{|ro| ro.option.question_id == q.id}
              if ros.present?
                ros.map{|ro| multiloc_service.t(ro.option.title_multiloc)}.join(', ')
              else
                ''
              end
            end
            sheet.add_row [
              *(participation_context.poll_anonymous? ? [] : [response.user.id]),
              *user_options
            ]
          end
        end
      end
      pa.to_stream
    end

	end
end
module Polls
	class ExportService

		def generate_poll_results_xlsx participation_context, users: nil
      multiloc_service = MultilocService.new
      questions = Polls::Question.where(participation_context: participation_context)
        .order(:ordering)
      responses = Polls::Response.where(participation_context: participation_context)
        .includes(response_options: [:option]).order(:created_at)

      pa = Axlsx::Package.new
      wb = pa.workbook
      wb.styles do |s|
        wb.add_worksheet(name: 'Poll results') do |sheet|
          sheet.add_row [
            'User ID',
            'Email',
            *questions.map{|q| multiloc_service.t(q.title_multiloc)}
          ], style: XlsxService.new.header_style(s)
          responses.includes(:user).each do |response|
            sheet.add_row [
              response.user.id,
              response.user.email,
              *response.response_options
                .group_by{|ro| ro.option.question.ordering}
                .sort_by{|ordering, _| ordering}
                .map{|_, ros| ros.map{|ro| multiloc_service.t(ro.option.title_multiloc)}.join(', ')}
            ]
          end
          sheet.column_info[2].width = 65
        end
      end
      pa.to_stream
    end

	end
end
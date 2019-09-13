module Polls
	class XlsxService
    @@parent_service = ::XlsxService.new
		
    def generate_poll_results_xlsx participation_context, users: nil
      multiloc_service = MultilocService.new
      questions = Polls::Question.where(participation_context: participation_context)
      responses = Polls::Response.where(participation_context: participation_context)

      pa = Axlsx::Package.new
      wb = pa.workbook
      wb.styles do |s|
        wb.add_worksheet(name: "Poll results") do |sheet|
          sheet.add_row [
            "id",
            "email",
            *questions.map{|q| multiloc_service.t(q.title_multiloc)}
          ], style: @@parent_service.header_style(s)
          responses.includes(:user).each do |response|
            sheet.add_row [
              response.user.id,
              response.user.email,
              *response.response_options.map{|r| multiloc_service.t(r.option.title_multiloc)}
            ]
          end
          sheet.column_info[2].width = 65
        end
      end
      pa.to_stream
    end

	end
end
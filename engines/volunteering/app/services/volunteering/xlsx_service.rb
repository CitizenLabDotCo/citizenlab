module Volunteering
  class XlsxService

    @@multiloc_service = MultilocService.new

    def generate_xlsx pc, volunteers
      pa = Axlsx::Package.new
      wb = pa.workbook
      pc.causes.order(:ordering).each do |cause|
        wb.styles do |s|
          wb.add_worksheet(name: @@multiloc_service.t(cause.title_multiloc)) do |sheet|
            sheet.add_row [
              "first_name",
              "last_name",
              "email",
              "date",
            ], style: ::XlsxService.new.header_style(s)
            volunteers.where(cause: cause).each do |v|
              sheet.add_row [
                v.user.first_name,
                v.user.last_name,
                v.user.email,
                v.created_at,
              ]
            end
          end
        end
      end
      pa.to_stream
    end
  end
end

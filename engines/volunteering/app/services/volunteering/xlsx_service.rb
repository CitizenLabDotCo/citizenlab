module Volunteering
  class XlsxService

    @@multiloc_service = MultilocService.new

    def generate_xlsx pc, volunteers
      # TODO hide private attributes for non-admins
      pa = Axlsx::Package.new
      wb = pa.workbook
      pc.causes.order(:ordering).each do |cause|
        wb.styles do |s|
          # Sheet names can only be 31 characters long
          sheet_name = @@multiloc_service.t(cause.title_multiloc)[0..30]
          wb.add_worksheet(name: sheet_name) do |sheet|
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

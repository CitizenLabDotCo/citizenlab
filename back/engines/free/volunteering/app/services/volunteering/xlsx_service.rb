# frozen_string_literal: true

module Volunteering
  class XlsxService
    @@multiloc_service = MultilocService.new

    def generate_xlsx(
      phase,
      volunteers,
      view_private_attributes: false
    )
      xlsx_service = ::XlsxService.new
      columns = [
        { header: 'first_name', f: ->(v) { v.user.first_name } },
        { header: 'last_name',  f: ->(v) { v.user.last_name } },
        { header: 'email',      f: ->(v) { v.user.email } },
        { header: 'date',       f: ->(v) { v.created_at }, skip_sanitization: true },
        *xlsx_service.user_custom_field_columns(:user)
      ]

      unless view_private_attributes
        columns.select! do |c|
          %w[email].exclude?(c[:header])
        end
      end

      pa = Axlsx::Package.new
      utils = Export::XlsxExport::Utils.new

      sheetnames = phase.causes.to_h do |cause|
        [cause.id, utils.sanitize_sheetname(@@multiloc_service.t(cause.title_multiloc))]
      end

      duplicate_names = (sheetnames.values.uniq.size != sheetnames.size)
      phase.causes.order(:ordering).each_with_index do |cause, i|
        sheetname = duplicate_names ? "#{i + 1} - " + sheetnames[cause.id] : sheetnames[cause.id]
        xlsx_service.generate_sheet pa.workbook, sheetname, columns, volunteers.where(cause: cause)
      end

      pa.to_stream
    end
  end
end

module XlsxExport
  class AttendeesGenerator < Generator
    def generate_attendees_xlsx(users, view_private_attributes: false)
      columns = [
        { header: I18n.t('first_name', scope: 'xlsx_export.column_headers'), f: ->(u) { u.first_name } },
        { header: I18n.t('last_name', scope: 'xlsx_export.column_headers'), f: ->(u) { u.last_name } },
        { header: I18n.t('email', scope: 'xlsx_export.column_headers'), f: ->(u) { u.email } },
        { header: I18n.t('registration_completed_at', scope: 'xlsx_export.column_headers'), f: ->(u) { u.registration_completed_at }, skip_sanitization: true },
        *xlsx_service.user_custom_field_columns(:itself)
      ]
      columns.reject! { |c| %w[email first_name last_name].include?(c[:header]) } unless view_private_attributes

      xlsx_service.generate_xlsx 'Users', columns, users
    end
  end
end

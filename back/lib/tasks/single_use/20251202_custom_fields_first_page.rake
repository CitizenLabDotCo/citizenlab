namespace :fix_existing_tenants do
  desc 'Fix custom fields by making sure the first field is a page.'
  task :custom_fields_first_page, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.all.each do |tenant|
      tenant.switch do
        CustomForm.all.each do |form|
          first_field = CustomField.find_by(ordering: 0, resource_id: form.id)
          next if first_field&.page?

          first_page = CustomField.where(resource_id: form.id).order(:ordering).find(&:page?)
          if !first_page
            reporter.add_error(
              'Form has no pages!',
              context: { tenant: tenant.host, form: form.id }
            )
            next
          end

          prev_ordering = first_page.ordering
          first_page.move_to_top

          reporter.add_change(
            prev_ordering,
            first_page.ordering,
            context: { tenant: tenant.host, form: form.id, field: first_page.id }
          )
        end
      end
    end
    reporter.report!('fix_custom_fields_first_page_report.json', verbose: true)
  end
end

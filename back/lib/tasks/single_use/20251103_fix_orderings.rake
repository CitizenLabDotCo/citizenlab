namespace :fix_existing_tenants do
  desc 'Fix custom fields orderings and make sure the first field is a page.'
  task :custom_fields_orderings, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.all.each do |tenant|
      tenant.switch do
        # rubocop:disable Performance/CollectionLiteralInLoop
        ([nil] + CustomForm.all).each do |form|
          fields = CustomField.where(resource_id: form&.id).order(:ordering)

          # Check if ordering is correct
          next if fields.pluck(:ordering) == (0...fields.size).to_a

          # Fix orderings
          fields.each.with_index do |field, index|
            field.update_column(:ordering, index)
          end
          reporter.add_change(
            nil,
            'Fixed orderings',
            context: { tenant: tenant.host, form: form&.id }
          )

          # First field must be a page
          next if !form

          fields = CustomField.where(resource_id: form.id).order(:ordering)
          next if fields.first.page?

          first_page = fields.find(&:page?)
          if !first_page
            reporter.add_error(
              'Form has no pages!',
              context: { tenant: tenant.host, form: form.id }
            )
            next
          end

          first_page.move_to_top
          reporter.add_change(
            nil,
            'Page moved to top',
            context: { tenant: tenant.host, form: form.id, page: first_page.id }
          )
        end
        # rubocop:enable Performance/CollectionLiteralInLoop
      end
    end
    reporter.report!('fix_custom_fields_orderings_report.json', verbose: true)
  end

  desc 'Fix custom field options and areas (domicile) orderings.'
  task :custom_field_options_orderings, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.all.each do |tenant|
      tenant.switch do
        CustomField.all.select(&:support_options?).each do |custom_field|
          options = custom_field.options.order(:ordering)

          # Check if ordering is correct
          next if options.pluck(:ordering) == (0...options.size).to_a

          # Fix orderings
          options.each.with_index do |option, index|
            option.update_column(:ordering, index)
          end
          reporter.add_change(
            nil,
            'Fixed options orderings',
            context: { tenant: tenant.host, custom_field: custom_field.id }
          )
        end

        areas = Area.order(:ordering)

        # Check if ordering is correct
        next if areas.pluck(:ordering) == (0...areas.size).to_a

        # Fix orderings
        areas.each.with_index do |area, index|
          area.update_column(:ordering, index)
        end
        reporter.add_change(
          nil,
          'Fixed areas orderings',
          context: { tenant: tenant.host }
        )
      end
    end
    reporter.report!('fix_custom_field_options_orderings_report.json', verbose: true)
  end
end

# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fix custom field matrix statement orderings to prepare for unique constraint.'
  task :matrix_statement_orderings, [] => [:environment] do
    reporter = ScriptReporter.new
    Tenant.all.each do |tenant|
      tenant.switch do
        CustomField.where(input_type: 'matrix_linear_scale').each do |custom_field|
          statements = custom_field.matrix_statements.order(:ordering)

          next if statements.pluck(:ordering) == (0...statements.size).to_a

          statements.each.with_index do |statement, index|
            statement.update_column(:ordering, index)
          end
          reporter.add_change(
            nil,
            'Fixed matrix statement orderings',
            context: { tenant: tenant.host, custom_field: custom_field.id }
          )
        end
      end
    end
    reporter.report!('fix_matrix_statement_orderings_report.json', verbose: true)
  end
end

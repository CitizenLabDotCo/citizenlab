# frozen_string_literal: true

module Insights
  class XlsxService
    def generate_inputs_xlsx(inputs, categories, view_private_attributes: false)
      columns = xlsx_service.generate_idea_xlsx_columns(inputs, view_private_attributes: view_private_attributes)

      category_cols = categories.map do |category|
        {
          header: category.name,
          f: lambda do |input|
            assignment = input.insights_category_assignments.find_by(category_id: category.id)
            return unless assignment

            assignment.approved ? 'approved' : 'suggested'
          end
        }
      end

      columns.insert(3, *category_cols)
      inputs = inputs.includes(:insights_category_assignments)
      xlsx_service.generate_xlsx('Inputs export', columns, inputs)
    end

    private

    def xlsx_service
      @xlsx_service ||= ::XlsxService.new
    end
  end
end

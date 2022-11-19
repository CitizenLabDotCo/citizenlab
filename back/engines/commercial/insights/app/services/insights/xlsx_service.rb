# frozen_string_literal: true

module Insights
  class XlsxService
    def generate_inputs_xlsx(inputs, categories, view_private_attributes: false)
      columns = xlsx_service.generate_idea_xlsx_columns(inputs, view_private_attributes: view_private_attributes)

      values = inputs
        .includes(:insights_category_assignments)
        .select('id')
        .to_h do |input|
          [
            input.id,
            build_assignments_hash(input.insights_category_assignments)
          ]
        end

      category_cols = categories.map do |category|
        {
          header: category.name,
          f: ->(input) { values[input.id][category.id] }
        }
      end

      columns.insert(3, *category_cols)
      xlsx_service.generate_xlsx('Inputs export', columns, inputs)
    end

    private

    def build_assignments_hash(category_assignments)
      assignments_hash = {}
      if category_assignments
        assignments_hash = category_assignments
          .to_h do |assignment|
            [
              assignment.category_id,
              assignment.approved ? 'approved' : 'suggested'
            ]
          end
      end
      assignments_hash
    end

    def xlsx_service
      @xlsx_service ||= ::XlsxService.new
    end
  end
end

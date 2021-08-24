module Insights
	class XlsxService

		def generate_inputs_xlsx(inputs, categories, view_private_attributes = false)
      columns = xlsx_service.generate_idea_xlsx_columns(inputs, view_private_attributes: view_private_attributes)



      categorized = inputs.includes(:insights_category_assignments)

      categories.each { |category|
        columns.insert(3, { header: category.name, f: -> (i) {
            icas = i.insights_category_assignments.where(category_id: category.id)
            return nil if icas.blank?
            icas.first.approved ? 'approved' : 'suggested'
        }})
      }

      xlsx_service.generate_xlsx 'Inputs export', columns, categorized
    end


    private

    def xlsx_service
      @xlsx_service ||= ::XlsxService.new
    end

	end
end

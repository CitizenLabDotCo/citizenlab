# frozen_string_literal: true

module Insights
  class CategoryAssignmentsService
    def assignments(input, view)
      CategoryAssignment.where(category: view.categories, input: input)
    end

    def clear_approved_assignments(input, view)
      assignments(input, view).where(approved: true).destroy_all
    end

    def clear_suggestions(input, view)
      assignments(input, view).where(approved: false).destroy_all
    end

    def add_assignments(input, categories)
      categories.map do |category|
        CategoryAssignment.find_or_create_by(input: input, category: category)
      end
    end

    def add_assignments!(input, categories)
      categories.map do |category|
        CategoryAssignment.find_or_create_by!(input: input, category: category)
      end
    end
  end
end

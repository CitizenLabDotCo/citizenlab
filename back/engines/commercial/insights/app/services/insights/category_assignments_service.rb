# frozen_string_literal: true

module Insights
  class CategoryAssignmentsService
    def assignments(input, view)
      CategoryAssignment.where(category: view.categories, input: input)
    end

    def approved_assignments(input, view)
      assignments(input, view).where(approved: true)
    end

    def suggested_assignments(input, view)
      assignments(input, view).where(approved: false)
    end

    def add_assignments(input, categories)
      categories.map do |category|
        CategoryAssignment.find_or_initialize_by(input: input, category: category).tap do |a|
          a.approved = true
          a.save
        end
      end
    end

    def add_assignments!(input, categories)
      categories.map do |category|
        CategoryAssignment.find_or_initialize_by(input: input, category: category).tap do |a|
          a.approved = true
          a.save!
        end
      end
    end
  end
end

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
        # We use '.tap' instead of passing the block directly so that it's
        # executed whether it's found or not.
        CategoryAssignment.find_or_initialize_by(input: input, category: category).tap do |a|
          a.approved = true
          a.save
        end
      end
    end

    def add_suggestions(input, categories)
      categories.map do |category|
        CategoryAssignment.find_or_create_by(input: input, category: category) do |a|
          # The block is only run when the assignment is not found.
          # In other words, we don't create a suggestion if the category is
          # already assigned to the input (approved or not).
          a.approved = false
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

    # Batch removal for category assignment.
    #
    # @param [Enumerable<Ideas>] inputs
    # @param [Enumerable<Insights::Category>] categories
    # @return [Array<Insights::CategoryAssignment>]
    def delete_assignments_batch(inputs, categories)
      assignments = CategoryAssignment.where(input: inputs, category: categories)
      _frozen_assignments = assignments.destroy_all
    end

    # Batch category assignment.
    #
    # @param [Enumerable<Ideas>] inputs
    # @param [Enumerable<Insights::Category>] categories
    # @return [Array<Insights::CategoryAssignment>]
    def add_assignments_batch(inputs, categories)
      CategoryAssignment.transaction do
        inputs.map { |input| add_assignments!(input, categories) }
      end.flatten
    end
  end
end

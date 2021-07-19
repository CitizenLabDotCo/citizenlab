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

    def add_suggestions(input, categories)
      ids = add_suggestions_batch([input], categories)
      CategoryAssignment.find(ids)
    end

    def add_assignments(input, categories, set_processed = true)
      ids = add_assignments_batch([input], categories, set_processed)
      CategoryAssignment.find(ids)
    end

    # Batch removal for category assignment.
    #
    # @param [Enumerable<Ideas>] inputs
    # @param [Enumerable<Insights::Category>] categories
    # @return [Integer] number of assignments deleted
    def delete_assignments_batch(inputs, categories)
      assignments = CategoryAssignment.where(input: inputs, category: categories)
      nb_affected = assignments.delete_all
      touch_views_of(categories)
      update_counts_of(categories)
      nb_affected
    end

    # Assigns (approved) category in batch.
    #
    # Batch assignment is idempotent. It will not complain if some of the
    # assignments already exist.
    #
    # Batch assignment is transactional. Either it succeeds at assigning all
    # categories to all inputs, or the DB is rolled back to its previous state.
    #
    # @param [Enumerable<Ideas>] inputs
    # @param [Enumerable<Insights::Category>] categories
    # @return [Array<String>] assignment identifiers
    def add_assignments_batch(inputs, categories, set_processed = true)
      validate_inputs!(inputs)

      assignments_attrs = inputs.to_a.product(categories)
                                .map { |input, category| new_assignment_attrs(input, category) }

      return [] if assignments_attrs.blank?

      result = CategoryAssignment.upsert_all(assignments_attrs, unique_by: %i[category_id input_id input_type])
      touch_views_of(categories)
      update_counts_of(categories)
      if set_processed
        view_ids = categories.pluck(:view_id).uniq
        processed_service.set_processed(inputs, view_ids)
      end
      result.pluck('id')
    end

    # Adds suggestions in batch. This operation is idempotent.
    #
    # If the assignment already exists and is approved, the suggestion will be
    # silently ignored.
    #
    # This operation is transactional. Either it succeeds, or the DB is rolled
    # back to its previous state.
    #
    # @param [Enumerable<Ideas>] inputs
    # @param [Enumerable<Insights::Category>] categories
    # @return [Array<String>] assignment identifiers
    def add_suggestions_batch(inputs, categories)
      validate_inputs!(inputs)
      assignments_attrs = inputs.to_a.product(categories) # yields all pairs of input x category
                                .map { |input, category| new_assignment_attrs(input, category, approved: false) }

      return [] if assignments_attrs.blank?

      result = CategoryAssignment.insert_all(assignments_attrs)
      touch_views_of(categories)
      update_counts_of(categories)
      result.pluck('id')
    end

    private

    def validate_inputs!(inputs)
      input_types = CategoryAssignment::INPUT_TYPES

      inputs.each do |input|
        next if input_types.include?(input.class.name)

        raise ArgumentError, "Invalid input. Allowed types: #{input_types}; got: '#{input.class}'."
      end
    end

    # Compute the hash of attributes for a new assignment.
    #
    # @param [Idea] input
    # @param [Insights::Category] category
    # @param [Boolean] approved
    # @return [Hash<Symbol, Object>]
    def new_assignment_attrs(input, category, approved: true)
      {
        category_id: category.id,
        input_id: input.id,
        input_type: input.class.name,
        approved: approved,
        created_at: Time.zone.now,
        updated_at: Time.zone.now
      }
    end

    # Updating 'updated_at' of corresponding views.
    def touch_views_of(categories)
      view_ids = categories.pluck(:view_id)
      Insights::View.find(view_ids).each(&:touch)
    end

    # Updating 'inputs_count' of categories.
    def update_counts_of(categories)
      categories.each { |cat| cat.update({ inputs_count: CategoryAssignment.where(category_id: cat.id).size })}
    end

    def processed_service
      @processed_service ||= Insights::ProcessedFlagsService.new
    end
  end
end

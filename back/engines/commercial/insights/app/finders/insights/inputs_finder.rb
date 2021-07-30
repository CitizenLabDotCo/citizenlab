# frozen_string_literal: true

module Insights
  class InputsFinder

    MAX_PER_PAGE = 100

    attr_reader :view, :params

    def initialize(view, params = {}, options = { paginate: true })
      @view = view
      @params = params
      @paginate = options[:paginate]
    end

    def execute
      inputs = view.scope.ideas
      inputs = filter_category(inputs)
      inputs = filter_processed(inputs)
      inputs = sort_by_approval(inputs)
      inputs = search(inputs)
      inputs = paginate(inputs) if @paginate
      inputs
    end

    # Takes into account, both, actual and suggested categories.
    # Keep only inputs without categories if +params[:category]+ is +nil+
    # or +''+.
    # @raise [ActiveRecord::RecordNotFound]
    def filter_category(inputs)
      return inputs unless params.key?(:category)

      category_id = params[:category]
      category_id = category_id == '' ? nil : category_id

      # raise error if the category does not exist
      view.categories.find(category_id) if category_id

      inputs.left_outer_joins(:insights_category_assignments)
            .where(insights_category_assignments: { category_id: category_id })
    end

    def filter_processed(inputs)
      return inputs if params[:processed].blank?
      return inputs unless %w[true false].include?(params[:processed])

      inputs_with_flags = inputs.left_outer_joins(:insights_processed_flags)
                                .where(insights_processed_flags: { view: [view, nil] })

      if params[:processed] == 'true'
      	inputs_with_flags.where.not(insights_processed_flags: { id: nil })
      else
        inputs_with_flags.where(insights_processed_flags: { id: nil })
      end
    end

    def sort_by_approval(inputs)
      return inputs if params[:category].blank?
      return inputs unless %w[approval -approval].include?(params[:sort])

      order = params[:sort].start_with?('-') ? :asc : :desc
      inputs.order('insights_category_assignments.approved': order)
    end

    def search(inputs)
      return inputs unless (search = params[:search])

      inputs.search_by_all(search)
    end

    def paginate(inputs)
      inputs.page(page).per(per_page)
    end

    def per_page
      return MAX_PER_PAGE unless (size = params.dig(:page, :size))

      [size.to_i, MAX_PER_PAGE].min
    end

    def page
      params.dig(:page, :number).to_i || 1
    end
  end
end

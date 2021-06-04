# frozen_string_literal: true

module Insights
  class InputsFinder

    MAX_PER_PAGE = 100

    attr_reader :view, :params

    def initialize(view, params = {})
      @view = view
      @params = params
    end

    def execute
      inputs = view.scope.ideas
      inputs = filter_category(inputs)
      inputs = search(inputs)
      paginate(inputs)
    end

    # Takes into account, both, actual and suggested categories.
    # Keep only inputs without categories if +params[:category]+ is +nil+ 
    # or +''+.
    # @raise [ActiveRecord::RecordNotFound]
    def filter_category(inputs)
      return inputs unless (category_id = params[:category])

      category_id = category_id == '' ? nil : category_id

      # raise error if the category does not exist
      view.categories.find(category_id) if category_id

      inputs.left_outer_joins(:insights_category_assignments)
            .where(insights_category_assignments: { category_id: category_id })
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

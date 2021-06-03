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
      inputs = search(inputs)
      paginate(inputs)
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

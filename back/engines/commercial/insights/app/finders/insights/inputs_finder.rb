# frozen_string_literal: true

module Insights
  class InputsFinder
    MAX_PER_PAGE = 100

    attr_reader :view, :params

    # with_indifferent_access to be able to merge it safely with other Hash-like
    # structures such as ActionController::Parameters
    DEFAULT_PARAMS = {
      paginate: false,
      page: { number: 1, size: MAX_PER_PAGE }
    }.with_indifferent_access.freeze

    # @param [Insights::View] view
    def initialize(view, params = {})
      @view = view
      @params = DEFAULT_PARAMS.deep_merge(params)
    end

    def execute
      project_ids = view.data_sources.where(origin_type: 'Project').select(:origin_id)
      inputs = Idea.where(project_id: project_ids)

      inputs = filter_categories(inputs)
      inputs = filter_keywords(inputs)
      inputs = filter_processed(inputs)
      inputs = sort_by_approval(inputs)
      inputs = search(inputs)
      paginate(inputs)
    end

    # Takes into account, both, actual and suggested categories.
    # Inputs without categories can be selected using +nil+ or +''+ as identifier.
    # @raise [ActiveRecord::RecordNotFound]
    def filter_categories(inputs)
      return inputs if category_ids.blank?

      filtered = inputs.none

      if category_ids.compact.present?
        view.categories.find(category_ids.compact) # raise an exception if a category does not exist

        subquery = Insights::CategoryAssignment.select(:input_id, :input_type)
                                               .where(category_id: category_ids.compact)
                                               .distinct
        in_categories = inputs.where(subquery.where("input_id = ideas.id AND input_type = 'Idea'").arel.exists)
        filtered = filtered.or(in_categories)
      end

      if category_ids.include?(nil)
        assigned_ids = Insights::CategoryAssignment.where(category: view.categories, input: inputs).select(:input_id)
        without_category = inputs.where.not(id: assigned_ids)
        filtered = filtered.or(without_category)
      end

      filtered
    end

    def filter_keywords(inputs)
      return inputs if params[:keywords].blank?

      networks = view.text_networks.index_by(&:language)
      keyword_ids = params[:keywords]

      query_terms = keyword_ids.flat_map do |node_id|
        namespace, _slash, node_id = node_id.partition('/')
        node = networks[namespace].node(node_id) # raise an exception if the node doesn't exist
        node.name
      end

      query = query_terms.uniq.sort.join(' ')
      inputs.search_any_word(query)
    end

    def filter_processed(inputs)
      return inputs if params[:processed].blank?
      return inputs unless %w[true false].include?(params[:processed])

      inputs_with_flags = inputs.left_outer_joins(:insights_processed_flags)
                                .where(insights_processed_flags: { view: [view] })

      if params[:processed] == 'true'
        inputs_with_flags
      else
        inputs.where.not(id: inputs_with_flags)
      end
    end

    def sort_by_approval(inputs)
      return inputs unless %w[approval -approval].include?(params[:sort])
      return inputs unless category_ids.size == 1
      return inputs if (category_id = category_ids.first).nil?

      category_id = category_ids.first
      order = params[:sort].start_with?('-') ? :asc : :desc

      inputs.joins(:insights_category_assignments)
            .where(insights_category_assignments: { category_id: category_id })
            .order('insights_category_assignments.approved': order)
    end

    def search(inputs)
      return inputs unless (search = params[:search])

      inputs.search_by_all(search)
    end

    def paginate(inputs)
      return inputs if params[:paginate].blank?

      inputs.page(page).per(per_page)
    end

    def per_page
      size = params.dig(:page, :size).to_i
      [size, MAX_PER_PAGE].min
    end

    def page
      params.dig(:page, :number).to_i
    end

    private

    def category_ids
      @category_ids ||= params[:categories].to_a.tap do |ids|
        ids << params[:category] if params.key?(:category)
      end.map(&:presence).uniq
    end
  end
end

# frozen_string_literal: true

module PublicApi
  class PublicApiController < ActionController::API
    include ::AuthToken::Authenticable
    include ::Pundit::Authorization

    around_action :switch_locale
    before_action :authenticate_api_client
    before_action :check_api_token

    rescue_from InvalidEnumParameterValueError, with: :render_problem_details

    def render_problem_details(exception)
      problem_details = {
        # TODO: What would be an appropriate base URI for types
        type: "https://citizenlab.co/public_api/problems/#{exception.problem_id}",
        title: exception.title,
        status: 400,
        detail: exception.detail,
        **exception.extra_details
      }

      render json: problem_details, status: :bad_request
    end

    def list_items(base_query, serializer, includes: [], root_key: nil)
      @items = base_query
        .order(created_at: :desc)
        .page(params[:page_number])
        .per(num_per_page)
      @items = common_date_filters @items
      @items = @items.includes(includes) if includes.any?

      render json: @items,
        each_serializer: serializer,
        adapter: :json,
        root: root_key,
        meta: meta_properties(@items)
    end

    def show_item(query, serializer, root_key: nil, status: :ok)
      render json: query,
        serializer: serializer,
        root: root_key,
        adapter: :json,
        status:
    end

    def meta_properties(relation)
      {
        current_page: relation.current_page,
        total_pages: relation.total_pages
      }
    end

    # TODO: Raise errors for incorrectly formatted parameters
    def common_date_filters(base_query)
      base_query = base_query.where(date_filter_where_clause('created_at', params[:created_at])) if params[:created_at]
      base_query = base_query.where(date_filter_where_clause('updated_at', params[:updated_at])) if params[:updated_at]
      base_query
    end

    def date_filter_where_clause(date_field, date_values)
      dates = date_values.split(',')
      # TODO: fix SQL injection vulnerability?
      start_date = dates[0].presence || '-infinity'
      end_date = dates[1].presence || 'infinity'
      "#{date_field} BETWEEN '#{start_date}' AND '#{end_date}'"
    end

    # Default per page is 25, maximum is 100
    def num_per_page
      [params[:page_size]&.to_i || 25, 100].min
    end

    private

    def switch_locale(&)
      locale = AppConfiguration.instance.closest_locale_to(requested_locale)
      I18n.with_locale(locale, &)
    end

    def requested_locale
      return params[:locale] if present?

      request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
    end

    def pundit_user
      current_public_api_api_client
    end

    def authenticate_api_client
      authenticate_for ApiClient
    end

    def check_api_token
      if (api_client = current_public_api_api_client)
        api_client.used!
      else
        head :unauthorized
      end
    end
  end
end

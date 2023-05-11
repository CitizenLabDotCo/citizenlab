# frozen_string_literal: true

module PublicApi
  class PublicApiController < ActionController::API
    include Knock::Authenticable
    include Pundit

    before_action :authenticate_api_client
    before_action :check_api_token
    before_action :set_locale

    def meta_properties(relation)
      {
        current_page: relation.current_page,
        total_pages: relation.total_pages
      }
    end

    # TODO: Raise errors for incorrectly formatted parameters
    # Could have added these queries as a shared concern on the model, but only needed for this API
    def common_date_filters(object_list)
      object_list = object_list.where(date_filter_where_clause('created_at', params[:created_at])) if params[:created_at]
      object_list = object_list.where(date_filter_where_clause('updated_at', params[:updated_at])) if params[:updated_at]
      object_list
    end

    def date_filter_where_clause(date_field, date_values)
      dates = date_values.split(',')
      start_date = (dates[0].presence || '2017-01-01')
      end_date = (dates[1].presence || Date.tomorrow.strftime('%F'))
      "#{date_field} BETWEEN '#{start_date}' AND '#{end_date}'"
    end

    # Default per page is 12, maximum is 24
    def num_per_page
      [params[:page_size]&.to_i || 12, 24].min
    end

    private

    def set_locale
      I18n.locale = AppConfiguration.instance.closest_locale_to(extract_locale_from_path_or_accept_language_header)
    end

    def extract_locale_from_path_or_accept_language_header
      return params[:locale] if present?

      request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
    end

    def pundit_user
      current_publicapi_apiclient
    end

    def authenticate_api_client
      authenticate_for ApiClient
    end

    def check_api_token
      return if current_publicapi_apiclient

      head :unauthorized
    end
  end
end

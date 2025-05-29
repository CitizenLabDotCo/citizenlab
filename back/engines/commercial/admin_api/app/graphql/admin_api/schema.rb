# frozen_string_literal: true

module AdminApi
  class Schema < GraphQL::Schema
    query Types::QueryType
    default_max_page_size 100

    # Disable introspection in non-production environments for security
    # disable_introspection_entry_points if Rails.env.production?
  end
end

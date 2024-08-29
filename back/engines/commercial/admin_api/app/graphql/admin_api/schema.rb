# frozen_string_literal: true

module AdminApi
  class Schema < GraphQL::Schema
    query Types::QueryType
    default_max_page_size 100
  end
end

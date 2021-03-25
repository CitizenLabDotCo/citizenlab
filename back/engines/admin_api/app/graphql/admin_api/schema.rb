module AdminApi
  class Schema < GraphQL::Schema
    # Required:
    query Types::QueryType
    # Optional:
    mutation Types::MutationType

    default_max_page_size 100
  end
end

module AdminApi
  class Types::TenantType < GraphQL::Schema::Object
    description "A CitizenLab platform"

    field :id, ID, null: false
    field :name, String, null: false
    field :host, String, null: false

  end
end
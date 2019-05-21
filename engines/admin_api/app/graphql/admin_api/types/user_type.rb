module AdminApi
  class Types::UserType < GraphQL::Schema::Object
    description "A registered or invited person on the platform"

    field :id, ID, null: false
    field :first_name, String, null: true
    field :last_name, String, null: true
    field :email, String, null: true
    field :slug, String, null: true
    field :locale, String, null: true
  end
end
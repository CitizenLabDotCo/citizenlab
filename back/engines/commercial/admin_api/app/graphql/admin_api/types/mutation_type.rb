module AdminApi
  Types::MutationType = GraphQL::ObjectType.define do
    name 'Mutation'

    # TODO: Remove me
    field :testField, types.String do
      description 'An example field added by the generator'
      resolve ->(_obj, _args, _ctx) {
        'Hello World!'
      }
    end
  end
end

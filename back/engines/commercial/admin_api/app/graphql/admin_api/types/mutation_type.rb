# frozen_string_literal: true

module AdminApi
  Types::MutationType = GraphQL::ObjectType.define do
    name 'Mutation'

    # TODO: Remove me
    field :testField, types.String do
      description 'An example field added by the generator'
      resolve lambda { |_obj, _args, _ctx|
        'Hello World!'
      }
    end
  end
end

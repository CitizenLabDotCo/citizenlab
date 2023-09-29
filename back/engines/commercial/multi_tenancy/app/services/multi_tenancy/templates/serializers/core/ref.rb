# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Core
        class Ref
          attr_reader :id, :klass

          def initialize(record, association_name)
            @id = record.attributes.fetch("#{association_name}_id")
            @klass = record.association(association_name).klass
          end

          def resolve(context)
            return nil if id.nil?

            context.fetch(klass).fetch(id)
          rescue KeyError
            raise UnresolvedReferenceError.new(klass, id)
          end

          class UnresolvedReferenceError < StandardError
            attr_reader :klass, :id

            def initialize(klass, id)
              message = "Could not resolve instance of #{klass} with id #{id}."
              super(message)

              @klass = klass
              @id = id
            end
          end
        end
      end
    end
  end
end

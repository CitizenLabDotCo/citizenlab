# frozen_string_literal: true

module PublicApi
  module V2
    class BaseSerializer < ActiveModel::Serializer
      delegate :classname_to_type, :type_to_classname, to: :class

      # The helper method `PublicApi::V2::BaseSerializer.multiloc_attributes`
      # expects a `multiloc_service` method to be defined on the serializer.
      # We define it in the base serializer, so that the helper method can be
      # used safely in the subclasses.
      def multiloc_service
        @multiloc_service ||= MultilocService.new
      end

      class << self
        def classname_to_type(classname)
          classname.underscore.dasherize
        end

        def type_to_classname(type)
          type.underscore.classify
        end

        # Creates two attributes for each multiloc attribute passed in:
        # - One attribute that holds the complete multiloc data (hash).
        # - Another attribute that returns only the string in the preferred locale (string).
        #
        # The multiloc attribute provides the complete data, while the "monoloc"
        # attribute serves as a convenience for tenants with a single locale and enables
        # integration with tools that have limited capabilities for manipulating data
        # and are unable to handle deeply nested JSON structures.
        def multiloc_attributes(*attribute_names)
          attribute_names.each do |attribute_name|
            base_attribute_name = attribute_name.to_s.chomp!('_multiloc')
            raise "Attribute #{attribute_name} does not end with _multiloc" unless base_attribute_name

            # Regular attribute with the full multiloc (hash)
            attribute attribute_name

            # Attribute that returns only the string in the preferred locale (string)
            attribute base_attribute_name.to_sym do
              multiloc_service.t(object.public_send(attribute_name))
            end
          end
        end
        alias multiloc_attribute multiloc_attributes
      end
    end
  end
end

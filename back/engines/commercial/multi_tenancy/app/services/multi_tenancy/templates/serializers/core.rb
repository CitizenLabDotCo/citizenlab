# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Core
        extend ActiveSupport::Concern

        attr_reader :options

        def initialize(uploads_full_urls: false)
          @options = { uploads_full_urls: uploads_full_urls }
        end

        def serialize(record)
          ref_attributes(record).merge value_attributes(record)
        end

        private

        def ref_attributes(record)
          self.class.reference_attributes.to_a.filter_map do |attr_name|
            ref = Ref.new(record, attr_name)
            [:"#{attr_name}_ref", ref] unless ref.id.nil?
          end.to_h
        end

        def value_attributes(record)
          result = self.class.value_attributes.to_a.each_with_object({}) do |attribute, acc|
            attribute.serialize(record, options, acc)
          end

          result.transform_values! { |value| Value.new(value) }
        end

        class_methods do
          attr_accessor :value_attributes, :reference_attributes

          def inherited(subclass)
            super(subclass)

            # Allows serializer subclasses to inherit attributes from their ancestors.
            subclass.value_attributes = value_attributes.dup if value_attributes.present?
            subclass.reference_attributes = reference_attributes.dup if reference_attributes.present?
          end

          def attributes(*attributes_list, &block)
            attributes_list = attributes_list.first if attributes_list.first.is_a?(Array)
            options = attributes_list.last.is_a?(Hash) ? attributes_list.pop : {}
            self.value_attributes = [] if value_attributes.nil?

            attributes_list.each do |attr_name|
              value_attributes << Attribute.new(
                attr_name.to_sym, block || attr_name, options
              )
            end
          end

          alias_method :attribute, :attributes

          def upload_attributes(*attributes_list)
            attributes_list = attributes_list.first if attributes_list.first.is_a?(Array)
            options = attributes_list.last.is_a?(Hash) ? attributes_list.pop : {}
            raise ArgumentError, 'Options are not allowed for upload attributes.' if options.present?

            attributes_list.each do |attr_name|
              # Mounting the regular `<attr>` attribute.
              attribute(
                attr_name,
                if: proc { |_record, serialization_params| !serialization_params[:uploads_full_urls] }
              ) do |record, _serialization_params|
                record[attr_name]
              end

              # Mounting the `remove_<attr>_url` attribute.
              attribute(
                "remote_#{attr_name}_url",
                if: proc { |_record, serialization_params| serialization_params[:uploads_full_urls] }
              ) do |record, _serialization_params|
                record.public_send("#{attr_name}_url")
              end
            end
          end

          alias_method :upload_attribute, :upload_attributes

          def ref_attributes(*attributes_list)
            self.reference_attributes = [] if reference_attributes.nil?

            attributes_list = attributes_list.first if attributes_list.first.is_a?(Array)
            attributes_list = attributes_list.map(&:to_sym)

            reference_attributes.concat(attributes_list)
          end

          alias_method :ref_attribute, :ref_attributes
        end
      end
    end
  end
end

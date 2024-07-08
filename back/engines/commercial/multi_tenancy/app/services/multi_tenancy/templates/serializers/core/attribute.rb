# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Core
        class Attribute
          attr_reader :options, :name, :method

          def initialize(name, method, options = {})
            @name = name
            @method = method
            @options = options
          end

          def serialize(model, serialization_params = {}, output_hash = {})
            return unless include_attribute?(model, serialization_params)

            output_hash[name] = call_proc(method, model, serialization_params)
          end

          private

          def conditional_proc
            # Convert the :if option to a proc to support specifying the proc as a symbol.
            options[:if]&.to_proc
          end

          def include_attribute?(model, serialization_params)
            if conditional_proc.present?
              call_proc(conditional_proc, model, serialization_params)
            else
              true
            end
          end

          def call_proc(proc, *params)
            case proc
            when Symbol
              params.first.public_send(proc)
            when Proc
              proc.arity.negative? ? proc.call(params.first) : proc.call(*params)
            else
              raise ArgumentError, "Invalid proc: #{proc.inspect}."
            end
          end
        end
      end
    end
  end
end

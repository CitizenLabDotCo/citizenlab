# frozen_string_literal: true

module WebApi::V1::Verification
  class VerificationMethodSerializer < ::WebApi::V1::BaseSerializer
    attributes :name

    ::Verification::VerificationService.new.all_methods.each do |method|
      next unless method.respond_to?(:exposed_config_parameters)

      method.exposed_config_parameters.each do |config_param|
        attribute config_param, if: proc { |record| record&.config&.dig(config_param) } do |record|
          record.config[config_param]
        end
      end
    end

    # Method metadata
    attribute :method_metadata do |record|
      ::Verification::VerificationService.new.method_metadata(record)
    end
  end
end

# frozen_string_literal: true

class WebApi::V1::IdMethodSerializer < WebApi::V1::BaseSerializer
  attributes :name

  # Whether the method can be used to verify user identities.
  attribute :verification_method do |record|
    record.verification?
  end

  # Whether the method can be used to authenticate (SSO login).
  attribute :authentication_method do |record|
    record.authentication?
  end

  IdMethodService.new.all_methods.each do |method|
    next unless method.respond_to?(:exposed_config_parameters)

    method.exposed_config_parameters.each do |config_param|
      attribute config_param, if: proc { |record| record&.config&.dig(config_param) } do |record|
        record.config[config_param]
      end
    end
  end

  # Method metadata
  attribute :method_metadata do |record|
    IdMethodService.new.method_metadata(record)
  end
end

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

  # Each attribute is declared once, but only sent for methods where that
  # parameter is public, since methods can share parameter names.
  IdMethodService.new.all_methods.flat_map(&:public_config_parameters).uniq.each do |config_param|
    attribute config_param, if: proc { |record|
      record.public_config_parameters.include?(config_param) && record.config&.dig(config_param)
    } do |record|
      record.config[config_param]
    end
  end

  # Method metadata
  attribute :method_metadata do |record|
    IdMethodService.new.method_metadata(record)
  end
end

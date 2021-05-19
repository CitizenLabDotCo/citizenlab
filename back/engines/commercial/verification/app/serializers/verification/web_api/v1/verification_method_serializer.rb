module Verification
  class WebApi::V1::VerificationMethodSerializer < ::WebApi::V1::BaseSerializer
    attributes :name

    VerificationService.new.all_methods.each do |method|
      next unless method.respond_to?(:exposed_config_parameters)
      method.exposed_config_parameters.each do |config_param|
        attribute config_param, if: Proc.new{|record| record&.config&.dig(config_param)} do |record|
          record.config[config_param]
        end
      end
    end
  end
end
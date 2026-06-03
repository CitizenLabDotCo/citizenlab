# frozen_string_literal: true

class IdMethodService
  attr_reader :configured_methods, :configured_methods_hash

  def initialize(app_configuration = AppConfiguration.instance)
    @app_configuration = app_configuration
    @configured_methods = @app_configuration.settings('verification', 'verification_methods')
    @configured_methods_hash = build_configured_methods_hash
  end

  private

  def build_configured_methods_hash
    hash = {}
    configured_methods.each do |method|
      hash[method['name']] = method
    end

    hash
  end
end
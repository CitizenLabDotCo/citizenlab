# frozen_string_literal: true

namespace :cl2back do
  desc 'Clean all tenant settings'
  task clean_tenant_settings: :environment do
    Rails.logger.info 'cl2back:clean_tenant_settings started'
    Tenant.safe_switch_each do |tenant|
      Rails.logger.info "Cleaning tenant settings for tenant #{tenant.name}"
      config = AppConfiguration.instance
      config.cleanup_settings
      LLMSelector.new.clean_ai_providers!(config)
      config.save! if config.changed?
    end
    Rails.logger.info 'cl2back:clean_tenant_settings finished'
  end
end

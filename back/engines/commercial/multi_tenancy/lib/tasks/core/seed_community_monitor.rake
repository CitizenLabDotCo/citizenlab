# frozen_string_literal: true

require Rails.root.join('engines/commercial/multi_tenancy/db/seeds/runner')

namespace :demos do
  desc 'Enable community monitor (if not enabled) and seed with demo data'
  task :seed_community_monitor, %i[host num_quarters locale] => [:environment] do |_, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      unless args[:host] == 'localhost' || AppConfiguration.instance.settings.dig('core', 'lifecycle_stage') == 'demo'
        Rails.logger.error 'Lifecycle stage is not demo, exiting'
        exit
      end

      # Ensure community monitor is enabled first
      SettingsService.new.activate_feature! 'community_monitor'

      num_quarters = args[:num_quarters]&.to_i || 2
      locale = args[:locale]
      num_existing_ideas = Idea.count

      Rails.logger.info "Seeding community monitor with #{num_quarters} quarters of data"
      CommunityMonitorSeedsRunner.new(num_quarters:, locale:).execute
      Rails.logger.info "DONE: Added #{Idea.count - num_existing_ideas} responses"
    end
  end
end

# Stripped back seeds runner for community monitor seeds only
class CommunityMonitorSeedsRunner < MultiTenancy::Seeds::Runner
  attr_accessor :num_ideas

  def initialize(num_quarters: 2, locale: nil)
    @num_ideas = 4 # 4 ideas per quarter
    @num_quarters = num_quarters
    @locale = locale
    super()
  end

  def execute
    MultiTenancy::Seeds::CommunityMonitor.new(
      runner: self,
      num_quarters: @num_quarters,
      ai_responses: true,
      locale: @locale
    ).run
  end
end

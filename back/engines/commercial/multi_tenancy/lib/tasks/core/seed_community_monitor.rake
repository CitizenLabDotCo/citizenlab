# frozen_string_literal: true

require Rails.root.join('engines/commercial/multi_tenancy/db/seeds/runner')

namespace :demos do
  desc 'Enable community monitor (if not enabled) and seed with demo data'
  task :seed_community_monitor, %i[host num_quarters] => [:environment] do |_, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      unless args[:host] == 'localhost' || AppConfiguration.instance.settings.dig('core', 'lifecycle_stage') == 'demo'
        Rails.logger.error 'Lifecycle stage is not demo, exiting'
        exit
      end

      # TODO: Enable community monitor first

      num_quarters = args[:num_quarters].to_i || 2
      Rails.logger.info "Seeding community monitor with #{num_quarters} quarters of data"
      CommunityMonitorSeedsRunner.new(num_quarters:).execute

      # TODO: Get the first locale of the tenant
    end
  end
end

class CommunityMonitorSeedsRunner < MultiTenancy::Seeds::Runner
  attr_accessor :num_ideas

  def initialize(num_ideas: 4, num_quarters: 2)
    @num_ideas = num_ideas # NOTE: Currently always set to 4
    @num_quarters = num_quarters
  end

  def execute
    MultiTenancy::Seeds::CommunityMonitor.new(runner: self, num_quarters: @num_quarters).run
  end
end

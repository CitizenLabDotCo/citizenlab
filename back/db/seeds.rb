# frozen_string_literal: true

require Rails.root.join('engines/commercial/multi_tenancy/db/seeds/runner')
seeds_runner = MultiTenancy::Seeds::Runner.new
seeds_runner.execute

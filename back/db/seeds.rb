# frozen_string_literal: true

if CitizenLab.ee?
  require Rails.root.join('engines/commercial/multi_tenancy/db/seeds/runner')
  seeds_runner = MultiTenancy::Seeds::Runner.new
  seeds_runner.execute
else
  load Rails.root.join('db/seeds/citizenlab.rb')
end

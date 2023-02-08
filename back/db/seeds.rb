# frozen_string_literal: true

if CitizenLab.ee?
  load Rails.root.join('engines/commercial/multi_tenancy/db/seeds/runner.rb')
  seeds_runner = MultiTenancy::Seeds::Runner.new
  seeds_runner.execute
else
  load Rails.root.join('db/seeds/citizenlab.rb')
end

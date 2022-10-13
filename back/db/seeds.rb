# frozen_string_literal: true

# I want to trigger CI pretty please

if CitizenLab.ee?
  load Rails.root.join('engines/ee/multi_tenancy/db/seeds/runner.rb')
else
  load Rails.root.join('db/seeds/citizenlab.rb')
end

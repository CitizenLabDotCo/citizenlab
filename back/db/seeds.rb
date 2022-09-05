# frozen_string_literal: true

if CitizenLab.ee?
  load Rails.root.join('engines/ee/multi_tenancy/db/seeds/runner.rb')
else
  load Rails.root.join('db/seeds/citizenlab.rb')
end

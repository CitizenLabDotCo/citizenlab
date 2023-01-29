# frozen_string_literal: true

if CitizenLab.ee?
  load Rails.root.join('engines/commercial/multi_tenancy/db/seeds/runner.rb')
else
  load Rails.root.join('db/seeds/citizenlab.rb')
end

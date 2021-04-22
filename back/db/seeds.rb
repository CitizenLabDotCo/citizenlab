if CitizenLab.ee?
  load Rails.root.join('engines/ee/multi_tenancy/db/seeds/citizenlab-ee.rb')
else
  load Rails.root.join('db/seeds/citizenlab.rb')
end

# frozen_string_literal: true

namespace :random_fill do
  desc 'Update the domicile values of all current users to random values'
  task domicile: :environment do
    Tenant.find_by(host: 'localhost').switch do
      area_ids = Area.all.ids
      User.all.each do |user|
        new_domicile = [*area_ids, 'outside', nil, nil].sample
        user.domicile = new_domicile
        user.save
      end
    end
  end

  desc 'Update the birthyear values of all current users to random values'
  task birthyear: :environment do
    Tenant.find_by(host: 'localhost').switch do
      User.all.each do |user|
        new_birthyear = (1920...2020).to_a.sample
        new_birthyear = nil if rand(6) == 0
        user.birthyear = new_birthyear
        user.save
      end
    end
  end
end

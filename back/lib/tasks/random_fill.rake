# frozen_string_literal: true

namespace :random_fill do
  desc 'Update the domicile values of all current users to random values'
  task domicile: :environment do
    Tenant.find_by(host: 'localhost').switch do
      field = CustomField.registration.find_by!(code: 'domicile')
      area_ids = Area.all.ids
      User.all.each do |user|
        new_domicile = [*area_ids, 'outside', nil, nil].sample
        answer = user.answer_for_key(field.key)
        if new_domicile.nil?
          answer&.destroy
        elsif answer
          answer.update(value: new_domicile)
        else
          user.custom_field_answers.create(key: field.key, value: new_domicile, custom_field: field)
        end
      end
    end
  end

  desc 'Update the birthyear values of all current users to random values'
  task birthyear: :environment do
    Tenant.find_by(host: 'localhost').switch do
      field = CustomField.registration.find_by!(code: 'birthyear')
      User.all.each do |user|
        new_birthyear = (1920...2020).to_a.sample
        new_birthyear = nil if rand(6) == 0
        answer = user.answer_for_key(field.key)
        if new_birthyear.nil?
          answer&.destroy
        elsif answer
          answer.update(value: new_birthyear)
        else
          user.custom_field_answers.create(key: field.key, value: new_birthyear, custom_field: field)
        end
      end
    end
  end
end

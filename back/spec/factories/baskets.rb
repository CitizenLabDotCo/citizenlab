# frozen_string_literal: true

FactoryBot.define do
  factory :basket do
    submitted_at { '2018-09-13 08:51:08' }
    user
    phase { create(:single_phase_budgeting_project).phases.first }
  end
end

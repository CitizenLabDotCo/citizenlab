FactoryBot.define do
  factory :permission do
    action 'posting'
    permitted_by 'groups'
    permittable { create(:continuous_project, participation_method: 'ideation') } # association :permittable, factory: :continuous_project #  participation_method: 'ideation'
    groups []
  end
end

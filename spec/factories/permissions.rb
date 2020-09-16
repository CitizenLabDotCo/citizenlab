FactoryBot.define do
  factory :permission do
    action { 'posting_idea' }
    permitted_by { 'groups' }
    permission_scope { create(:continuous_project, participation_method: 'ideation') }
    groups { [] }
  end
end

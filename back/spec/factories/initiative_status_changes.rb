FactoryBot.define do
  factory :initiative_status_change do
    user
    initiative
    initiative_status
    official_feedback
  end
end

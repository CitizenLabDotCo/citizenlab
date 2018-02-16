FactoryBot.define do
  factory :invite do
    inviter { create(:user) }
    invitee { create(:user) }
  end
end

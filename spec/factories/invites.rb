FactoryBot.define do
  factory :invite do
    inviter { create(:user) }
    invitee { create(:user, invite_status: 'pending') }
  end
end

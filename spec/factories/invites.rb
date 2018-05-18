FactoryBot.define do
  factory :invite do
    inviter { create(:user) }
    invitee { create(:user, registration_completed_at: nil, invite_status: 'pending') }
  
    factory :accepted_invite do
      invitee {create(:user, invite_status: 'accepted') }
      accepted_at Time.now-3.weeks
    end
  end

end

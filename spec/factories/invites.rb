FactoryBot.define do
  factory :invite do
    email "nonexisting@cocacola.gov"
    inviter { create(:user) }
    group { create(:group) }
  end
end

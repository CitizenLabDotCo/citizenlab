FactoryBot.define do
  factory :verification_id_card, class: 'Verification::IdCard' do
    hashed_card_id { "$2a$10$Cu8AnxXnDwWAH0OkCBrbd.XQRzMDcXb46dMlEezTzL6nUz00JiHKK" }
  end
end

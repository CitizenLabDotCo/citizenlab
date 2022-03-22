FactoryBot.define do
  factory :texting_campaign, class: Texting::Campaign do
    phone_numbers { ['+11234567890'] }
    message { 'Hello World!' }
    status { 'draft' }
  end
end

FactoryGirl.define do
  factory :vote do
    votable nil
    mode :up
    user
  end
end

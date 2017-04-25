FactoryGirl.define do
  factory :vote do
    votable :idea
    mode :up
    user
  end
end

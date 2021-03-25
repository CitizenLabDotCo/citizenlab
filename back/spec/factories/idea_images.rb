FactoryBot.define do
  factory :idea_image do
    idea
    image { Rails.root.join("spec/fixtures/image#{rand(20)}.png").open }
  end
end

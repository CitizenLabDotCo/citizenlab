FactoryBot.define do
  factory :initiative_image do
    initiative
    image { Rails.root.join("spec/fixtures/image#{rand(20)}.png").open }
  end
end

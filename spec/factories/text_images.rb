FactoryBot.define do
  factory :text_image do
    association :imageable, :factory => :project
    imageable_field { "description_multiloc" }
    image { Rails.root.join("spec/fixtures/image#{rand(20)}.png").open }
  end
end

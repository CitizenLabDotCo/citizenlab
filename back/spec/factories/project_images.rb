FactoryBot.define do
  factory :project_image do
    project
    image { Rails.root.join("spec/fixtures/image#{rand(20)}.png").open }
  end
end

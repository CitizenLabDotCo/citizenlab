FactoryBot.define do
  factory :static_page do
    code { 'custom' }
    title_multiloc do
      {
      'en' => Faker::Lorem.sentence,
      'nl-BE' => Faker::Lorem.sentence
    } end
    body_multiloc do
      {
      'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
      'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
    } end
    sequence(:slug) { |n| "#{Faker::Internet.slug.parameterize}-#{n}".tr('_', '-') }
  end
end

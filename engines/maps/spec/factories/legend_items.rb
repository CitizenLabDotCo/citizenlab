FactoryBot.define do
  factory :legend_item, class: 'Maps::LegendItem' do
    map_config
    sequence(:title_multiloc) {|n| {
      "en" => "Legend item #{n}"
    }}
    color { Faker::Color.hex_color }
  end
end

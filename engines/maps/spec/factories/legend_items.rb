FactoryBot.define do
  factory :legend_item, class: 'Maps::LegendItem' do
    layer
    title_multiloc {{
      en: 'Legend item'
    }}
    color { Faker::Color.hex_color }
  end
end

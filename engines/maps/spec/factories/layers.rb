FactoryBot.define do
  factory :layer, class: 'Maps::Layer' do
    map_config
    title_multiloc {{
      en: 'Legend item'
    }}
  end
end

FactoryBot.define do
  factory :area do
    ordering { nil }
    title_multiloc {{
      'en' => 'Westside',
      'nl-BE' => 'Westerbuurt'
    }}
    description_multiloc {{
      'en' => '<p>A <i>calm</i> space to relax, where the city meets the woods.</p>',
      'nl-BE' => '<p>Een <i>kalme</i> buurt om te relaxen, waar de stad en het bos samensmelten.</p>',
    }}
  end
end

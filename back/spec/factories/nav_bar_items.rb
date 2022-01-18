FactoryBot.define do
  factory :nav_bar_item do
    code { 'custom' }
    title_multiloc do
      {
        'en' => 'Party pictures',
        'nl-BE' => 'Feestfotos'
      }
    end
    static_page
  end
end

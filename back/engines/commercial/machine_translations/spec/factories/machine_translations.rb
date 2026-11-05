# frozen_string_literal: true

FactoryBot.define do
  factory :machine_translation, class: 'MachineTranslations::MachineTranslation' do
    translation { 'A park with blue trees' }
    attribute_name { 'title_multiloc' }
    locale_to { 'en' }
    translatable { create(:idea, title_multiloc: { 'nl-BE' => 'Een park met blauwe bomen' }) }
  end
end

FactoryBot.define do
  factory :machine_translation, class: MachineTranslations::MachineTranslation do
    translation {{
      title_multiloc: CL2_SUPPORTED_LOCALES.map{|locale| [locale, "This is the translated title in #{locale}"]}.to_h,
      body_multiloc: CL2_SUPPORTED_LOCALES.map{|locale| [locale, "This is the translated body in #{locale}"]}.to_h
    }}
    translatable { create(:idea) }
  end
end

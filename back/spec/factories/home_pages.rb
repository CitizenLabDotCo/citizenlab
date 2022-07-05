# frozen_string_literal: true

FactoryBot.define do
  factory :home_page do
    # Use database defaults for now
    top_info_section_enabled { false }
    bottom_info_section_enabled { false }

    banner_signed_in_header_multiloc do
      {
        'en' => 'Welcome!',
        'nl-BE' => 'Welkom!'
      }
    end
    banner_signed_out_header_multiloc do
      {
        'en' => 'Welcome!',
        'nl-BE' => 'Welkom!'
      }
    end
    banner_signed_out_subheader_multiloc do
      {
        'en' => 'Sign up to participate',
        'nl-BE' => 'Aanmelden om mee te doen'
      }
    end
  end
end

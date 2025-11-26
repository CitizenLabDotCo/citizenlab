# frozen_string_literal: true

FactoryBot.define do
  factory :custom_field, aliases: [:custom_field_text] do
    for_registration

    key { |_n| "field_#{rand(1_000_000..9_999_999)}" }

    title_multiloc do
      {
        'en' => 'Did you attend'
      }
    end
    description_multiloc do
      {
        'en' => 'Which councils are you attending in our city?'
      }
    end
    required { false }
    enabled { true }

    input_type { 'text' }

    trait :for_registration do
      resource_type { 'User' }
    end

    trait :for_custom_form do
      association :resource, factory: :custom_form
    end

    factory :custom_field_point do
      title_multiloc do
        {
          'en' => 'Where do you live?'
        }
      end
      description_multiloc do
        {
          'en' => 'Please indicate where you live.'
        }
      end
      input_type { 'point' }
    end

    factory :custom_field_line do
      title_multiloc do
        {
          'en' => 'Where should we add the new cycle-path?'
        }
      end
      description_multiloc do
        {
          'en' => 'Please draw a line to indicate the route of the new cycle-path.'
        }
      end
      input_type { 'line' }
    end

    factory :custom_field_polygon do
      title_multiloc do
        {
          'en' => 'Where should we build new housing?'
        }
      end
      description_multiloc do
        {
          'en' => 'Please draw the area where you think we should build new housing.'
        }
      end
      input_type { 'polygon' }
    end

    factory :custom_field_multiline_text do
      title_multiloc do
        {
          'en' => 'Why would you want to join the army?'
        }
      end
      description_multiloc do
        {
          'en' => 'Please explain why you want to join the army.'
        }
      end
      input_type { 'multiline_text' }
    end

    factory :custom_field_html_multiloc do
      title_multiloc do
        {
          'en' => 'Why would you want to join the army?'
        }
      end
      description_multiloc do
        {
          'en' => 'Please explain why you want to join the army.'
        }
      end
      input_type { 'html_multiloc' }
    end

    factory :custom_field_select do
      title_multiloc do
        {
          'en' => 'Member of councils?'
        }
      end
      description_multiloc do
        {
          'en' => 'Which councils are you attending in our city?'
        }
      end
      input_type { 'select' }

      trait :with_options do
        after(:create) do |cf|
          create(:custom_field_option, custom_field: cf, key: 'option1')
          create(:custom_field_option, custom_field: cf, key: 'option2')
        end
      end
    end

    factory :custom_field_select_image do
      title_multiloc do
        {
          'en' => 'Choose an image'
        }
      end
      input_type { 'select_image' }

      trait :with_options do
        after(:create) do |cf|
          create(:custom_field_option, custom_field: cf, key: 'image1', image: create(:custom_field_option_image))
          create(:custom_field_option, custom_field: cf, key: 'image2', image: create(:custom_field_option_image))
        end
      end
    end

    factory :custom_field_linear_scale do
      title_multiloc do
        {
          'en' => 'We need a swimming pool.'
        }
      end
      description_multiloc do
        {
          'en' => 'Please indicate how strong you agree or disagree.'
        }
      end
      input_type { 'linear_scale' }
      maximum { 5 }
      linear_scale_label_1_multiloc do
        {
          'en' => 'Strongly disagree'
        }
      end
      linear_scale_label_2_multiloc do
        {
          'en' => 'Disagree'
        }
      end
      linear_scale_label_3_multiloc do
        {
          'en' => 'Neutral'
        }
      end
      linear_scale_label_4_multiloc do
        {
          'en' => 'Agree'
        }
      end
      linear_scale_label_5_multiloc do
        {
          'en' => 'Strongly agree'
        }
      end
      linear_scale_label_6_multiloc { {} }
      linear_scale_label_7_multiloc { {} }
      linear_scale_label_8_multiloc { {} }
      linear_scale_label_9_multiloc { {} }
      linear_scale_label_10_multiloc { {} }
      linear_scale_label_11_multiloc { {} }
    end

    factory :custom_field_sentiment_linear_scale do
      title_multiloc do
        {
          'en' => 'We need a swimming pool.'
        }
      end
      description_multiloc do
        {
          'en' => 'Please indicate how strong you agree or disagree.'
        }
      end
      input_type { 'sentiment_linear_scale' }
      maximum { 5 }
      ask_follow_up { false }
      linear_scale_label_1_multiloc do
        {
          'en' => 'Strongly disagree'
        }
      end
      linear_scale_label_2_multiloc do
        {
          'en' => 'Disagree'
        }
      end
      linear_scale_label_3_multiloc do
        {
          'en' => 'Neutral'
        }
      end
      linear_scale_label_4_multiloc do
        {
          'en' => 'Agree'
        }
      end
      linear_scale_label_5_multiloc do
        {
          'en' => 'Strongly agree'
        }
      end
    end

    factory :custom_field_rating do
      title_multiloc do
        {
          'en' => 'How would you rate our service?'
        }
      end
      description_multiloc do
        {
          'en' => 'Please rate your experience from 1 (poor) to 5 (excellent).'
        }
      end
      input_type { 'rating' }
      maximum { 5 }
    end

    factory :custom_field_page do
      title_multiloc do
        {
          'en' => 'Cycling survey'
        }
      end
      description_multiloc do
        {
          'en' => 'This is a survey on your cycling habits.'
        }
      end
      input_type { 'page' }
      page_layout { 'default' }

      factory :custom_field_form_end_page do
        key { 'form_end' }
      end
    end

    factory :custom_field_multiselect do
      title_multiloc do
        {
          'en' => 'What languages do you speak?'
        }
      end
      input_type { 'multiselect' }

      trait :with_options do
        after(:create) do |cf|
          create(:custom_field_option, custom_field: cf, key: 'option1')
          create(:custom_field_option, custom_field: cf, key: 'option2')
        end
      end
    end

    factory :custom_field_multiselect_image do
      title_multiloc do
        {
          'en' => 'Choose an image'
        }
      end
      input_type { 'multiselect_image' }

      trait :with_options do
        after(:create) do |cf|
          create(:custom_field_option, custom_field: cf, key: 'image1', image: create(:custom_field_option_image))
          create(:custom_field_option, custom_field: cf, key: 'image2', image: create(:custom_field_option_image))
        end
      end
    end

    factory :custom_field_file_upload do
      title_multiloc do
        {
          'en' => 'Upload your CV'
        }
      end
      input_type { 'file_upload' }
    end

    factory :custom_field_shapefile_upload do
      title_multiloc do
        {
          'en' => 'Upload a zipfile containing your shapefiles'
        }
      end
      input_type { 'shapefile_upload' }
    end

    factory :custom_field_checkbox do
      title_multiloc do
        {
          'en' => 'I want to join the army'
        }
      end
      input_type { 'checkbox' }
    end

    factory :custom_field_date do
      title_multiloc do
        {
          'en' => 'When did you last see a mermaid?'
        }
      end
      input_type { 'date' }
    end

    factory :custom_field_number do
      title_multiloc do
        {
          'en' => 'How many cheese burgers can you put in your mouth without swallowing?'
        }
      end
      input_type { 'number' }
    end

    factory :custom_field_ranking do
      title_multiloc do
        {
          'en' => 'Rank your favourite means of public transport'
        }
      end
      input_type { 'ranking' }

      trait :with_options do
        after(:create) do |cf|
          create(:custom_field_option, custom_field: cf, key: 'by_train', title_multiloc: { 'en' => 'By train' })
          create(:custom_field_option, custom_field: cf, key: 'by_bike', title_multiloc: { 'en' => 'By bike' })
        end
      end
    end

    factory :custom_field_matrix_linear_scale do
      title_multiloc do
        {
          'en' => 'Please indicate how strong you agree or disagree with the following statements.'
        }
      end
      input_type { 'matrix_linear_scale' }
      maximum { 5 }
      linear_scale_label_1_multiloc do
        {
          'en' => 'Strongly disagree'
        }
      end
      linear_scale_label_5_multiloc do
        {
          'en' => 'Strongly agree'
        }
      end

      matrix_statements do
        [
          build(:custom_field_matrix_statement, title_multiloc: { 'en' => 'We should send more animals into space' }, key: 'send_more_animals_to_space'),
          build(:custom_field_matrix_statement, title_multiloc: { 'en' => 'We should ride our bicycles more often' }, key: 'ride_bicycles_more_often')
        ]
      end
    end

    factory :custom_field_birthyear do
      key { 'birthyear' }
      title_multiloc { { en: 'birthyear' } }
      input_type { 'number' }
      code { 'birthyear' }
    end

    factory :custom_field_gender do
      resource_type { 'User' }
      key { 'gender' }
      title_multiloc { { 'en' => 'gender' } }
      code { 'gender' }
      input_type { 'select' }

      trait :with_options do
        after(:create) do |cf|
          create(:custom_field_option, title_multiloc: { 'en' => 'Male' }, custom_field: cf, key: 'male')
          create(:custom_field_option, title_multiloc: { 'en' => 'Female' }, custom_field: cf, key: 'female')
          create(:custom_field_option, title_multiloc: { 'en' => 'Unspecified' }, custom_field: cf, key: 'unspecified')
        end
      end
    end

    factory :custom_field_domicile do
      key { 'domicile' }
      title_multiloc { { 'en' => 'domicile' } }
      code { 'domicile' }
      input_type { 'select' }
    end
  end
end

# frozen_string_literal: true

RSpec.shared_context 'survey_setup' do
  # Set-up a common survey form and responses to share between different results tests
  let_it_be(:project) { create(:single_phase_native_survey_project) }
  let_it_be(:survey_phase) { project.phases.first }
  let_it_be(:phases_of_inputs) { [survey_phase] }

  # Set-up custom form
  let_it_be(:form) { create(:custom_form, participation_context: survey_phase) }
  let_it_be(:page_field) { create(:custom_field_page, resource: form) }
  let_it_be(:text_field) do
    create(
      :custom_field,
      resource: form,
      title_multiloc: { 'en' => 'What is your favourite colour?' },
      description_multiloc: {}
    )
  end
  let_it_be(:multiline_text_field) do
    create(
      :custom_field_multiline_text,
      resource: form,
      title_multiloc: { 'en' => 'What is your favourite recipe?' },
      description_multiloc: {}
    )
  end
  let_it_be(:disabled_multiselect_field) do # Should not appear in results
    create(
      :custom_field_multiselect,
      resource: form,
      title_multiloc: { 'en' => 'What are your favourite colours?' },
      description_multiloc: {},
      enabled: false
    )
  end
  let_it_be(:multiselect_field) do
    create(
      :custom_field_multiselect,
      resource: form,
      title_multiloc: {
        'en' => 'What are your favourite pets?',
        'fr-FR' => 'Quels sont vos animaux de compagnie préférés ?',
        'nl-NL' => 'Wat zijn je favoriete huisdieren?'
      },
      description_multiloc: {},
      required: false,
      options: [
        create(:custom_field_option, key: 'cat', title_multiloc: { 'en' => 'Cat', 'fr-FR' => 'Chat', 'nl-NL' => 'Kat' }),
        create(:custom_field_option, key: 'dog', title_multiloc: { 'en' => 'Dog', 'fr-FR' => 'Chien', 'nl-NL' => 'Hond' }),
        create(:custom_field_option, key: 'cow', title_multiloc: { 'en' => 'Cow', 'fr-FR' => 'Vache', 'nl-NL' => 'Koe' }),
        create(:custom_field_option, key: 'pig', title_multiloc: { 'en' => 'Pig', 'fr-FR' => 'Porc', 'nl-NL' => 'Varken' }),
        create(:custom_field_option, key: 'no_response', title_multiloc: { 'en' => 'Nothing', 'fr-FR' => 'Rien', 'nl-NL' => 'Niets' })
      ]
    )
  end
  let_it_be(:linear_scale_field) do
    create(
      :custom_field_linear_scale,
      resource: form,
      title_multiloc: {
        'en' => 'Do you agree with the vision?',
        'fr-FR' => "Êtes-vous d'accord avec la vision ?",
        'nl-NL' => 'Ben je het eens met de visie?'
      },
      maximum: 7,
      linear_scale_label_1_multiloc: {
        'en' => 'Strongly disagree',
        'fr-FR' => "Pas du tout d'accord",
        'nl-NL' => 'Helemaal niet mee eens'
      },
      linear_scale_label_2_multiloc: {
        'en' => 'Disagree',
        'fr-FR' => 'Être en désaccord',
        'nl-NL' => 'Niet mee eens'
      },
      linear_scale_label_3_multiloc: {
        'en' => 'Slightly disagree',
        'fr-FR' => 'Plutôt en désaccord',
        'nl-NL' => 'Enigszins oneens'
      },
      linear_scale_label_4_multiloc: {
        'en' => 'Neutral',
        'fr-FR' => 'Neutre',
        'nl-NL' => 'Neutraal'
      },
      linear_scale_label_5_multiloc: {
        'en' => 'Slightly agree',
        'fr-FR' => "Plutôt d'accord",
        'nl-NL' => 'Enigszins eens'
      },
      linear_scale_label_6_multiloc: {
        'en' => 'Agree',
        'fr-FR' => "D'accord",
        'nl-NL' => 'Mee eens'
      },
      linear_scale_label_7_multiloc: {
        'en' => 'Strongly agree',
        'fr-FR' => "Tout à fait d'accord",
        'nl-NL' => 'Strerk mee eens'
      },
      required: true
    )
  end
  let_it_be(:mid_page_field1) { create(:custom_field_page, resource: form) }
  let_it_be(:select_field) do
    create(
      :custom_field_select,
      resource: form,
      title_multiloc: {
        'en' => 'What city do you like best?',
        'fr-FR' => 'Quelle ville préférez-vous ?',
        'nl-NL' => 'Welke stad vind jij het leukst?'
      },
      description_multiloc: {},
      required: true,
      options: [
        create(:custom_field_option, key: 'la', title_multiloc: { 'en' => 'Los Angeles', 'fr-FR' => 'Los Angeles', 'nl-NL' => 'Los Angeles' }),
        create(:custom_field_option, key: 'ny', title_multiloc: { 'en' => 'New York', 'fr-FR' => 'New York', 'nl-NL' => 'New York' }),
        create(:custom_field_option, other: true, key: 'other', title_multiloc: { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' })
      ]
    )
  end
  let_it_be(:multiselect_image_field) do
    create(
      :custom_field_multiselect_image,
      resource: form,
      title_multiloc: {
        'en' => 'Choose an image', 'fr-FR' => 'Choisissez une image', 'nl-NL' => 'Kies een afbeelding'
      },
      description_multiloc: {},
      required: false,
      options: [
        create(
          :custom_field_option,
          key: 'house',
          title_multiloc: { 'en' => 'House', 'fr-FR' => 'Maison', 'nl-NL' => 'Huis' },
          image: create(:custom_field_option_image)
        ),
        create(
          :custom_field_option,
          key: 'school',
          title_multiloc: { 'en' => 'School', 'fr-FR' => 'Ecole', 'nl-NL' => 'School' },
          image: create(:custom_field_option_image)
        )
      ]
    )
  end
  let_it_be(:unanswered_text_field) do
    create(
      :custom_field,
      resource: form,
      title_multiloc: {
        'en' => 'Nobody wants to answer me'
      },
      description_multiloc: {}
    )
  end
  let_it_be(:mid_page_field2) { create(:custom_field_page, resource: form) }
  let_it_be(:file_upload_field) do
    create(
      :custom_field,
      input_type: 'file_upload',
      resource: form,
      title_multiloc: {
        'en' => 'Upload a file'
      },
      description_multiloc: {},
      required: false
    )
  end
  let_it_be(:shapefile_upload_field) do
    create(
      :custom_field,
      input_type: 'shapefile_upload',
      resource: form,
      title_multiloc: {
        'en' => 'Upload a file'
      },
      description_multiloc: {},
      required: false
    )
  end

  let_it_be(:point_field) do
    create(
      :custom_field_point,
      resource: form,
      title_multiloc: {
        'en' => 'Where should the new nursery be located?'
      },
      description_multiloc: {}
    )
  end

  let_it_be(:map_config_for_point) { create(:map_config, mappable: point_field) }

  let_it_be(:line_field) do
    create(
      :custom_field_line,
      resource: form,
      title_multiloc: {
        'en' => 'Where should we build the new bicycle path?'
      },
      description_multiloc: {}
    )
  end

  let_it_be(:map_config_for_line) { create(:map_config, mappable: line_field) }

  let_it_be(:polygon_field) do
    create(
      :custom_field_polygon,
      resource: form,
      title_multiloc: {
        'en' => 'Where should we build the new housing?'
      },
      description_multiloc: {}
    )
  end

  let_it_be(:map_config_for_polygon) { create(:map_config, mappable: polygon_field) }

  let_it_be(:number_field) do
    create(
      :custom_field_number,
      resource: form,
      title_multiloc: {
        'en' => 'How many cats would you like?'
      },
      description_multiloc: {}
    )
  end

  let_it_be(:ranking_field) do
    create(
      :custom_field_ranking,
      resource: form,
      title_multiloc: {
        'en' => 'Rank your favourite means of public transport'
      },
      description_multiloc: { 'en' => 'Favourite to least favourite' },
      required: false,
      options: [
        create(:custom_field_option, key: 'by_foot', title_multiloc: { 'en' => 'By foot', 'fr-FR' => 'À pied', 'nl-NL' => 'Te voet' }),
        create(:custom_field_option, key: 'by_bike', title_multiloc: { 'en' => 'By bike', 'fr-FR' => 'À vélo', 'nl-NL' => 'Met de fiets' }),
        create(:custom_field_option, key: 'by_train', title_multiloc: { 'en' => 'By train', 'fr-FR' => 'En train', 'nl-NL' => 'Met de trein' })
      ]
    )
  end

  let_it_be(:matrix_linear_scale_field) { create(:custom_field_matrix_linear_scale, resource: form, description_multiloc: {}) }

  let_it_be(:rating_field) do
    create(
      :custom_field_rating,
      resource: form,
      title_multiloc: {
        'en' => 'How satisfied are you with our service?',
        'fr-FR' => 'À quel point êtes-vous satisfait de notre service ?',
        'nl-NL' => 'Hoe tevreden ben je met onze service?'
      },
      description_multiloc: {
        'en' => 'Please rate your experience from 1 (poor) to 7 (excellent).'
      },
      maximum: 7,
      required: true
    )
  end

  let_it_be(:sentiment_linear_scale_field) do
    create(
      :custom_field_sentiment_linear_scale,
      resource: form,
      title_multiloc: {
        'en' => 'How are you feeling?',
        'fr-FR' => 'Comment te sens-tu?',
        'nl-NL' => 'Hoe gaat het met je?'
      },
      ask_follow_up: true
    )
  end

  # The following page for form submission should not be returned in the results
  let_it_be(:last_page_field) do
    create(:custom_field_form_end_page, resource: form)
  end

  # Set-up user custom fields for the platform
  let_it_be(:gender_user_custom_field) do
    create(:custom_field_gender, :with_options)
  end

  let_it_be(:domicile_user_custom_field) do
    field = create(:custom_field_domicile)
    create(:area, title_multiloc: { 'en' => 'Area 1' })
    create(:area, title_multiloc: { 'en' => 'Area 2' })
    field
  end

  # Create responses
  let_it_be(:responses) do
    create(:idea_status_proposed)
    male_user = create(:user, custom_field_values: { gender: 'male', domicile: domicile_user_custom_field.options[0].area.id })
    female_user = create(:user, custom_field_values: { gender: 'female', domicile: domicile_user_custom_field.options[1].area.id })
    no_gender_user = create(:user, custom_field_values: {})
    idea_file1 = create(:idea_file)
    idea_file2 = create(:idea_file)
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Red',
        multiselect_field.key => %w[cat dog],
        select_field.key => 'ny',
        ranking_field.key => %w[by_bike by_train by_foot],
        file_upload_field.key => { 'id' => idea_file1.id, 'name' => idea_file1.name },
        shapefile_upload_field.key => { 'id' => idea_file2.id, 'name' => idea_file2.name },
        point_field.key => { type: 'Point', coordinates: [42.42, 24.24] },
        line_field.key => { type: 'LineString', coordinates: [[1.1, 2.2], [3.3, 4.4]] },
        polygon_field.key => { type: 'Polygon', coordinates: [[[1.1, 2.2], [3.3, 4.4], [5.5, 6.6], [1.1, 2.2]]] },
        linear_scale_field.key => 3,
        rating_field.key => 3,
        number_field.key => 42,
        matrix_linear_scale_field.key => {
          'send_more_animals_to_space' => 1,
          'ride_bicycles_more_often' => 3
        },
        sentiment_linear_scale_field.key => 3
      },
      idea_files: [idea_file1, idea_file2],
      author: female_user,
      created_at: '2025-04-20'
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Blue',
        multiselect_field.key => %w[cow pig cat],
        select_field.key => 'la',
        ranking_field.key => %w[by_train by_bike by_foot],
        point_field.key => { type: 'Point', coordinates: [11.22, 33.44] },
        line_field.key => { type: 'LineString', coordinates: [[1.2, 2.3], [3.4, 4.5]] },
        polygon_field.key => { type: 'Polygon', coordinates: [[[1.2, 2.3], [3.4, 4.5], [5.6, 6.7], [1.2, 2.3]]] },
        linear_scale_field.key => 4,
        rating_field.key => 4,
        matrix_linear_scale_field.key => {
          'send_more_animals_to_space' => 1
        },
        sentiment_linear_scale_field.key => 2,
        "#{sentiment_linear_scale_field.key}_follow_up" => 'Just not good'
      },
      author: male_user,
      created_at: '2025-04-16'
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Green',
        multiselect_field.key => %w[cat dog],
        select_field.key => 'other',
        "#{select_field.key}_other" => 'Austin',
        multiselect_image_field.key => ['house'],
        matrix_linear_scale_field.key => {
          'ride_bicycles_more_often' => 3
        },
        sentiment_linear_scale_field.key => 5,
        "#{sentiment_linear_scale_field.key}_follow_up" => 'Great thanks very much'
      },
      author: female_user,
      created_at: '2025-04-05'
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => 'Pink',
        multiselect_field.key => %w[dog cat cow],
        select_field.key => 'other',
        ranking_field.key => %w[by_bike by_foot by_train],
        "#{select_field.key}_other" => 'Miami',
        multiselect_image_field.key => ['house'],
        matrix_linear_scale_field.key => {
          'send_more_animals_to_space' => 3,
          'ride_bicycles_more_often' => 4
        }
      },
      author: male_user,
      created_at: '2025-04-14'
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => '', # Empty text field - can be saved from visitor survey with multiple pages
        select_field.key => 'la',
        multiselect_image_field.key => ['school'],
        ranking_field.key => %w[by_bike by_train by_foot],
        sentiment_linear_scale_field.key => 1
      },
      author: female_user,
      created_at: '2025-03-11'
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {
        text_field.key => "   \n", # Empty text field - can be saved from visitor survey with multiple pages
        select_field.key => 'other',
        "#{select_field.key}_other" => 'Seattle',
        matrix_linear_scale_field.key => {
          'send_more_animals_to_space' => 4,
          'ride_bicycles_more_often' => 4
        },
        sentiment_linear_scale_field.key => 2
      },
      author: male_user,
      created_at: '2025-03-06'
    )
    create(
      :native_survey_response,
      project: project,
      phases: phases_of_inputs,
      custom_field_values: {},
      author: female_user,
      created_at: '2025-03-06'
    )
    { 1 => 2, 2 => 5, 3 => 7, 4 => 0, 5 => 1, 6 => 2, 7 => 3 }.each do |value, count|
      count.times do
        create(
          :native_survey_response,
          project: project,
          phases: phases_of_inputs,
          custom_field_values: {
            linear_scale_field.key => value,
            rating_field.key => value,
            sentiment_linear_scale_field.key => (value <= 5 ? value : 1)
          },
          author: no_gender_user,
          created_at: '2025-02-25'
        )
      end
    end
  end

  # Helper methods
  def result_index(field)
    form.custom_fields.enabled.order(:ordering).index(field)
  end

  def reset_survey_logic!
    form.custom_fields.each do |field|
      field.update!(logic: {})
    end
  end
end

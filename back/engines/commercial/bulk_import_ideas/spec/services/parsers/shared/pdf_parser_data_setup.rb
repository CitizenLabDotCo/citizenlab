# frozen_string_literal: true

# Set-up a full survey form with every type of custom field
# And create mock data for what we get back from:
# a) the Google parser
# b) the text we get when reading the generated PDF
# NOTE: This is slightly difficult to maintain as this requires getting updated mock data everytime we want to add fields

RSpec.shared_context 'pdf_parser_data_setup' do
  # Set-up project and form
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

  # Mock data - based on actual data returned from the Google parser / PDF reader

  let_it_be(:google_parsed_raw_text_array) do
    ["go\nvocal\nFormerly\nCitizenLab\nWelcome to our survey\nFill it in as honestly as you can. We've customised this introduction - so please:\n1. Don't lie\n2. Be nice\nPersonal data\nWe will submit your input to Abshireville's online participation platform. If you want to\nreceive updates relevant to your input by email, please fill out the following fields on\nthis page and we will create an account for you. Your data will not be public and will\nonly be used by Abshireville. If you do not agree for us to use your personal data in this\nway, you can leave them empty.\nFirst name(s) (optional)\nJames\nLast name (optional)\nSmith\nEmail address (optional)\nJames @monkey.org\nBy checking this box I consent to my data being used to create an account on\nAbshireville's participation platform.\nPage 1\n",
      "This is a page title\nAnd here is the description of it. These appear as section dividers and not new pages in\nthe printed form.\n1. Your question (optional)\n& Option 1\n○ Option 2\n2. This is a short answer (optional)\nI really like Short\nanswers\n3. This is a long answer (optional)\nInstructions\n• Put whatever you want here\nI'm\nThey\nnot so\nmuch longer\nKeen\nол\nanswers.\nLong\nto\ntake\nFill in\nThis is another page title\nBut this is just a section in the printed version, not a single page.\n4. Linear scale field (optional)\nWith a description....\nPlease write a number between 1 and 5 only\n1\n5. Another linear scale - no description (optional)\nPlease write a number between 1 (Totally worst) and 7 (Absolute best) only\n2\nPage 2\n",
      "6. Multiple choice (optional)\n*Choose as many as you like\n☐ this one\n☑ another option you might like more\n☑ something else\nIf 'something else', please specify\nI cannot\nmake up my\nmy mind\n7. Image choice (optional)\n*Choose between 2 and 4 options\n☐ Choose Marge\n☐ Choose bart\n☑ Choose homer\nPO\nG\n☐ All the Simpsons\n☐ Choose Lisa\n☑ Choose Maggie\n☑ Other\nIf 'Other', please specify\nSeymour\nPage 3\n",
      "8. Ranking question (optional)\nPlease write a number from 1 (most preferred) and 3 (least preferred) in each\nbox. Use each number only once.\n2 First one\n1 Another one\n3 Choose this one\n9. Rating question (optional)\nRate this by writing a number between 1 (worst) and 5 (best).\n3\n10. Sentiment scale question (optional)\nPlease write a number between 1 and 5.\n1 = Very bad, 3 = Ok, 5 = Very good.\n5\n11. Matrix question (optional)\nFor each row, mark one circle with a cross to indicate your preference.\nStrongly\nStrongly\ndisagree\nDisagree Neutral\nAgree\nagree\nI like stuff\n0\n&\nO\n0\nI like nonsense\n0\n0\ns\n0\n0\nI like nothing, but I do\nlike really long\nstatements as they\nare the best!\n0\nO\n0\nØ\n0\n12. File upload field (optional)\nThis field cannot be completed on paper. Please use the online version of this\nform instead.\n13. Number field (optional)\n283\nPage 4\n",
      "Mapping page\nAll the questions in this section relate to the following map.\nHIGH\n無用銀行:\nmang\nMYLOR \nROAD\nmares殊是問題\n080\nT\nの場\nGISB\na\n92%\nANSELL ROAD\nHIGHCLIFFE ROAD\nte\ng\nDOBBIN HILLDOPPIN\n*\nFALKLAND ROAD\nNEE.\nHIGH STORRS ROAD\nS\nM\n70\nEDALE ROAD\nBRA\nRINGINGLOW ROA\nmm\nawwa\nB\nmegy on\nR\npu\nWoman wRINGINGLOW \nROAD\n4\n麵類蜜集 衛\n#\nSA\n8\nHOOBER\n845\nRINGINGLOW ROAD\nMapTiler OpenStreetMap contributors\n14. Drop pin question (optional)\nPlease do something with this map\nPlease draw an X on the map below to show the location or write the address\ninstead.\nRue de\n10\nFromage\nWoluwe-Sair\nLambert-Si\nLambrechts\nWoluwe\nDilbeek\nBruxelles Brussel\nItterbeek\nAnderlecht\nEtterbeek\nIxelles\nElsene\ntrudis-\nle\nSaint-Gilles\n-Sint-Gillis\nAa\n☑\nAuderghei\n-Ouderge\nSobroek\nForest-Vorst\nVlezenbeek\nNegenmanneke\nUccle - Ukkel\nWatermael-\nBoitsfort-\nWatermaal-\nBosvoorde\nZuun\nRuisbroek\nSint-Pieters-\nLeeuw\nLinkebeek\nMapTiler OpenStreetMap contributors.\nBeersel\nPage 5\n",
      "15. Draw route question (optional)\nDraw sometning\nPlease draw a route on the map below.\nEvere\nGanshoren\nSchaerbeek-\nSchaarbeek\nem-\ngathe\ngatha-\nem\nKoekelberg\nMolenbeek-\nSaint-Jean\n-Sint-Jans-\nMolenbeek\nSaint-Josse-\nten-Noode\n-Sint-Joost-\nten-Node\nBruxelles- Brussel\nAnderlecht\nEtterbeek\nIxelles-\nElsene\nMapTiler OpenStreetMap contributors\n16. Draw area question (optional)\nDraw an area please\nPlease draw a shape on the map below.\nEvere\nGanshoren\nem-\nSchaerbeek-\nSchaarbeek\ngathe\njatha-\nem\nKoekelberg\nt\nMolenbeek-\nMolenbeek\nSaint-Josse-\nten-Noode\n-Sint-Joost-\nten-Node\nBruxelles- Brussel\nAnderlecht\nEtterbeek\nIxelles-\nElsene\nMapTiler OpenStreetMap contributors\nPage 6\n",
      "About you\n17. Gender (optional)\n☑ Male\n○ Female\nOther\n18. Year of birth (optional)\n1976\n19. Are you a politician? (optional)\nWe use this to provide you with customized information\nO Active politician\n☑ Retired politician\nO No\n20. Place of residence (optional)\nO Herbland\nWest Horacio\nO West Rexberg\n○ Murielport\nO Candiestad\nO North Hisakoland\n○ Boehmshire\n☑ Oscarburgh\nO Jonathanfort\nRoweview\n○ East Jackelineport\n○ North Reyberg\n○ Westbrook\nO Somewhere else\nThanks for filling in this printed survey\nWe will use your answers to make wise decisions.\n.\nPage 7\n"]
  end

  let_it_be(:google_parsed_form_object) do
    { pdf_pages: [1, 2, 3, 4, 6, 7],
      fields: { 'First name(s) (optional)' => 'James',
                'Last name (optional)' => 'Smith',
                'Email address (optional)' => 'James @monkey.org',
                'Your question' => '& Option 1 ○ Option 2',
                'This is a short answer' => 'I really like Short answers',
                'This is a long answer' => 'Instructions',
                '• Put whatever you want here' => "Keen ол answers. I'm They not so much longer Long to take Fill in",
                'Please write a number between 1 and 5 only' => '4. Linear scale field (optional) With a description.... 1',
                '5. Another linear scale- no description (optional) Please write a number between 1 (Totally worst) and 7 (Absolute best) only' => '1',
                'this one_3.3.12' => 'unfilled_checkbox',
                'another option you might like more_3.3.14' => 'filled_checkbox',
                'something else_3.3.16' => 'filled_checkbox',
                "If 'something else', please specify" => 'I cannot make up my my mind',
                'Choose Marge_3.3.46' => 'unfilled_checkbox',
                'Choose bart_3.3.46' => 'unfilled_checkbox',
                'Choose homer_3.3.46' => 'filled_checkbox',
                'All the Simpsons_3.3.62' => 'unfilled_checkbox',
                'Choose Lisa_3.3.62' => 'unfilled_checkbox',
                'Choose Maggie_3.3.62' => 'filled_checkbox',
                'Other_3.3.78' => 'filled_checkbox',
                "If 'Other', please specify" => 'Seymour',
                'Rate this by writing a number between 1 (worst) and 5 (best).' => '9. Rating question (optional) 3',
                'Sentiment scale question' => 'Please write a number between 1 and 5. 1 = Very bad, 3 = Ok, 5 = Very good. 5',
                'Number field' => '283',
                'Schaerbeek--' => 'Schaarbeek',
                'Ixelles--' => 'Elsene',
                'Year of birth' => '1976',
                'Active politician_6.7.34' => 'unfilled_checkbox',
                'Retired politician_6.7.36' => 'filled_checkbox' } }
  end

  let_it_be(:pdf_template_text) do
    [['Welcome to our survey',
      '',
      "Fill it in as honestly as you can. We've customised this introduction - so please:",
      '',
      "   1. Don't lie",
      '   2. Be nice',
      '',
      '',
      'Personal data',
      '',
      "We will submit your input to Abshireville's online participation platform. If you want to",
      'receive updates relevant to your input by email, please fill out the following fields on',
      'this page and we will create an account for you. Your data will not be public and will',
      'only be used by Abshireville. If you do not agree for us to use your personal data in this',
      'way, you can leave them empty.',
      '',
      '',
      'First name(s) (optional)',
      '',
      '',
      '',
      'Last name (optional)',
      '',
      '',
      '',
      '',
      'Email address (optional)',
      '',
      '',
      '',
      '',
      '   By checking this box I consent to my data being used to create an account on',
      "   Abshireville's participation platform.",
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '                                                                                   Page 1'],
      ['This is a page title',
        '',
        'And here is the description of it. These appear as section dividers and not new pages in',
        'the printed form.',
        '',
        '1. Your question (optional)',
        '',
        '       Option 1',
        '       Option 2',
        '',
        '',
        '2. This is a short answer (optional)',
        '',
        '',
        '',
        '',
        '3. This is a long answer (optional)',
        '',
        '    Instructions',
        '',
        '         Put whatever you want here',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'This is another page title',
        'But this is just a section in the printed version, not a single page.',
        '',
        '',
        '4. Linear scale field (optional)',
        '    With a description....',
        '',
        '    Please write a number between 1 and 5 only',
        '',
        '',
        '',
        '',
        '5. Another linear scale - no description (optional)',
        '    Please write a number between 1 (Totally worst) and 7 (Absolute best) only',
        '',
        '',
        '',
        '         i        i   (          )',
        '',
        '                                                                                 Page 2'],
      ['6. Multiple choice (optional)',
        '',
        '    *Choose as many as you like',
        '       this one',
        '',
        '       another option you might like more',
        '       something else',
        '',
        '',
        "    If 'something else', please specify",
        '',
        '',
        '',
        '',
        '',
        '7. Image choice (optional)',
        '',
        '    *Choose between 2 and 4 options',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '       Choose Marge              Choose bart              Choose homer',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '       Choose Lisa               Choose Maggie            All the Simpsons',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '       Other',
        '',
        '',
        "    If 'Other', please specify",
        '',
        '',
        '',
        '',
        '',
        '',
        '         i          i   (         )',
        '',
        '                                                                              Page 3'],
      ['8. Ranking question (optional)',
        '',
        '    Please write a number from 1 (most preferred) and 3 (least preferred) in each',
        '    box. Use each number only once.',
        '',
        '        First one',
        '',
        '        Another one',
        '',
        '        Choose this one',
        '',
        '',
        '',
        '9. Rating question (optional)',
        '    Rate this by writing a number between 1 (worst) and 5 (best).',
        '',
        '',
        '',
        '',
        '',
        '10. Sentiment scale question (optional)',
        '    Please write a number between 1 and 5.',
        '    1 = Very bad, 3 = Ok, 5 = Very good.',
        '',
        '',
        '',
        '',
        '11. Matrix question (optional)',
        '',
        '    For each row, mark one circle with a cross to indicate your preference.',
        '',
        '                             Strongly                                     Strongly',
        '                             disagree   Disagree    Neutral     Agree      agree',
        '',
        '    I like stuff',
        '',
        '',
        '    I like nonsense',
        '',
        '    I like nothing, but I do',
        '    like really long',
        '    statements as they',
        '    are the best!',
        '',
        '',
        '',
        '12. File upload field (optional)',
        '    This field cannot be completed on paper. Please use the online version of this',
        '    form instead.',
        '',
        '',
        '13. Number field (optional)',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '        i',
        '',
        '                                                                                 Page 4'],
      ['Mapping page',
        '',
        'All the questions in this section relate to the following map.',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '14. Drop pin question (optional)',
        '    Please do something with this map',
        '    Please draw an X on the map below to show the location or write the address',
        '',
        '    instead.',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '                        i    (         )',
        '',
        '                                                                                 Page 5'],
      ['15. Draw route question (optional)',
        '',
        '   Draw sometning',
        '   Please draw a route on the map below.',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '16. Draw area question (optional)',
        '',
        '   Draw an area please',
        '   Please draw a shape on the map below.',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '                                                                          Page 6'],
      ['About you',
        '',
        '',
        '17. Gender (optional)',
        '',
        '      Male',
        '      Female',
        '',
        '      Other',
        '',
        '',
        '18. Year of birth (optional)',
        '',
        '',
        '',
        '',
        '19. Are you a politician? (optional)',
        '',
        '   We use this to provide you with customized information',
        '      Active politician',
        '',
        '      Retired politician',
        '      No',
        '',
        '',
        '20.Place of residence (optional)',
        '',
        '      Herbland',
        '',
        '      West Horacio',
        '      West Rexberg',
        '      Murielport',
        '',
        '      Candiestad',
        '      North Hisakoland',
        '',
        '      Boehmshire',
        '      Oscarburgh',
        '',
        '      Jonathanfort',
        '      Roweview',
        '      East Jackelineport',
        '',
        '      North Reyberg',
        '      Westbrook',
        '',
        '      Somewhere else',
        '',
        '',
        'Thanks for filling in this printed survey',
        '',
        '     We will use your answers to make wise decisions.',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '                                                                           Page 7']]
  end

  let_it_be(:pdf_template_data) do
    { page_count: 7,
      fields: [{ name: 'Your question',
                 type: 'field',
                 key: 'your_question_6l0',
                 page: 2,
                 position: 10,
                 code: nil,
                 input_type: 'select',
                 description: nil,
                 print_title: '1. Your question (optional)',
                 content_delimiters: { start: 'Option 2', end: '2. This is a short answer (optional)' } },
        { name: 'Option 1', type: 'option', key: 'option_1_m9p', page: 2, position: 14, parent_key: 'your_question_6l0' },
        { name: 'Option 2', type: 'option', key: 'option_2_fpd', page: 2, position: 16, parent_key: 'your_question_6l0' },
        { name: 'This is a short answer',
          type: 'field',
          key: 'this_is_a_short_answer_o7i',
          page: 2,
          position: 21,
          code: nil,
          input_type: 'text',
          description: nil,
          print_title: '2. This is a short answer (optional)',
          content_delimiters: { start: '2. This is a short answer (optional)', end: '3. This is a long answer (optional)' } },
        { name: 'This is a long answer',
          type: 'field',
          key: 'this_is_a_long_answer_j4k',
          page: 2,
          position: 29,
          code: nil,
          input_type: 'multiline_text',
          description: 'InstructionsPut whatever you want here',
          print_title: '3. This is a long answer (optional)',
          content_delimiters: { start: 'Put whatever you want here', end: 'This is another page title' } },
        { name: 'Linear scale field',
          type: 'field',
          key: 'linear_scale_field_fq5',
          page: 2,
          position: 74,
          code: nil,
          input_type: 'linear_scale',
          description: 'With a description....',
          print_title: '4. Linear scale field (optional)',
          content_delimiters: { start: 'Please write a number between 1 and 5 only', end: '5. Another linear scale - no description (optional)' } },
        { name: 'Another linear scale - no description',
          type: 'field',
          key: 'another_linear_scale_jul',
          page: 2,
          position: 88,
          code: nil,
          input_type: 'linear_scale',
          description: nil,
          print_title: '5. Another linear scale - no description (optional)',
          content_delimiters: { start: 'Please write a number between 1 (Totally worst) and 7 (Absolute best) only', end: '6. Multiple choice (optional)' } },
        { name: 'Multiple choice',
          type: 'field',
          key: 'multiple_choice_fyh',
          page: 3,
          position: 2,
          code: nil,
          input_type: 'multiselect',
          description: nil,
          print_title: '6. Multiple choice (optional)',
          content_delimiters: { start: "If 'Other', please specify", end: "If 'something else', please specify" } },
        { name: 'this one', type: 'option', key: 'this_one_t3a', page: 3, position: 6, parent_key: 'multiple_choice_fyh' },
        { name: 'another option you might like more', type: 'option', key: 'another_option_you_might_like_more_na7', page: 3, position: 10, parent_key: 'multiple_choice_fyh' },
        { name: 'something else', type: 'option', key: 'other', page: 3, position: 11, parent_key: 'multiple_choice_fyh' },
        { name: "If 'something else', please specify",
          type: 'field',
          key: 'multiple_choice_fyh_other',
          page: 3,
          position: 16,
          code: nil,
          input_type: 'text',
          description: nil,
          print_title: "If 'something else', please specify",
          content_delimiters: { start: "If 'Other', please specify", end: 'Image choice (optional)' } },
        { name: 'Image choice',
          type: 'field',
          key: 'image_choice_9z2',
          page: 3,
          position: 26,
          code: nil,
          input_type: 'multiselect_image',
          description: nil,
          print_title: '7. Image choice (optional)',
          content_delimiters: { start: "If 'Other', please specify", end: "If 'Other', please specify" } },
        { name: 'Choose  Marge', type: 'option', key: 'this_is_an_image_7e5', page: 3, position: 28, parent_key: 'image_choice_9z2' },
        { name: 'Choose bart', type: 'option', key: 'choose_bart_wjv', page: 3, position: 45, parent_key: 'image_choice_9z2' },
        { name: 'Choose homer', type: 'option', key: 'choose_homer_yuq', page: 3, position: 47, parent_key: 'image_choice_9z2' },
        { name: 'Choose Lisa', type: 'option', key: 'choose_lisa_jzm', page: 3, position: 63, parent_key: 'image_choice_9z2' },
        { name: 'Choose Maggie', type: 'option', key: 'choose_maggie_tdf', page: 3, position: 65, parent_key: 'image_choice_9z2' },
        { name: 'All the Simpsons', type: 'option', key: 'all_the_simpsons_smv', page: 3, position: 65, parent_key: 'image_choice_9z2' },
        { name: 'Other', type: 'option', key: 'other', page: 3, position: 81, parent_key: 'image_choice_9z2' },
        { name: "If 'Other', please specify",
          type: 'field',
          key: 'image_choice_9z2_other',
          page: 3,
          position: 85,
          code: nil,
          input_type: 'text',
          description: nil,
          print_title: "If 'Other', please specify",
          content_delimiters: { start: "If 'Other', please specify", end: 'Ranking question (optional)' } },
        { name: 'First one', type: 'option', key: 'first_one_nzc', page: 4, position: 10, parent_key: 'ranking_question_7k9' },
        { name: 'Another one', type: 'option', key: 'another_one_l3z', page: 4, position: 13, parent_key: 'ranking_question_7k9' },
        { name: 'Choose this one', type: 'option', key: 'choose_this_one_rpq', page: 4, position: 16, parent_key: 'ranking_question_7k9' },
        { name: 'Rating question',
          type: 'field',
          key: 'rating_q_s7h',
          page: 4,
          position: 22,
          code: nil,
          input_type: 'rating',
          description: nil,
          print_title: '9. Rating question (optional)',
          content_delimiters: { start: 'Rate this by writing a number between 1 (worst) and 5 (best).', end: '10. Sentiment scale question (optional)' } },
        { name: 'Sentiment scale question',
          type: 'field',
          key: 'sentiment_scale_question_puz',
          page: 4,
          position: 33,
          code: nil,
          input_type: 'sentiment_linear_scale',
          description: nil,
          print_title: '10. Sentiment scale question (optional)',
          content_delimiters: { start: '1 = Very bad, 3 = Ok, 5 = Very good.', end: '11. Matrix question (optional)' } },
        { name: 'Number field',
          type: 'field',
          key: 'number_field_eon',
          page: 4,
          position: 83,
          code: nil,
          input_type: 'number',
          description: nil,
          print_title: '13. Number field (optional)',
          content_delimiters: { start: '13. Number field (optional)', end: 'Mapping page' } },
        { name: 'Gender', type: 'field', key: 'u_gender', page: 7, position: 6, code: nil, input_type: 'select', description: nil, print_title: '17. Gender (optional)', content_delimiters: { start: 'Other', end: '18. Year of birth (optional)' } },
        { name: 'Male', type: 'option', key: 'male', page: 7, position: 10, parent_key: 'u_gender' },
        { name: 'Female', type: 'option', key: 'female', page: 7, position: 11, parent_key: 'u_gender' },
        { name: 'Other', type: 'option', key: 'unspecified', page: 7, position: 14, parent_key: 'u_gender' },
        { name: 'Year of birth',
          type: 'field',
          key: 'u_birthyear',
          page: 7,
          position: 19,
          code: nil,
          input_type: 'number',
          description: nil,
          print_title: '18. Year of birth (optional)',
          content_delimiters: { start: '18. Year of birth (optional)', end: '19. Are you a politician? (optional)' } },
        { name: 'Are you a politician?',
          type: 'field',
          key: 'u_politician',
          page: 7,
          position: 27,
          code: nil,
          input_type: 'select',
          description: 'We use this to provide you with customized information',
          print_title: '19. Are you a politician? (optional)',
          content_delimiters: { start: 'We will use your answers to make wise decisions.', end: '20. Place of residence (optional)' } },
        { name: 'Active politician', type: 'option', key: 'active_politician', page: 7, position: 32, parent_key: 'u_politician' },
        { name: 'Retired politician', type: 'option', key: 'retired_politician', page: 7, position: 35, parent_key: 'u_politician' },
        { name: 'No', type: 'option', key: 'no', page: 7, position: 37, parent_key: 'u_politician' },
        { name: 'Place of residence', type: 'field', key: 'u_domicile', page: 7, position: 39, code: nil, input_type: 'select', description: nil, print_title: '20. Place of residence (optional)', content_delimiters: {} },
        { name: 'Herbland', type: 'option', key: '96fccbd7-ac1a-4d5a-b70e-2dfd2bdc3f81', page: 7, position: 44, parent_key: 'u_domicile' },
        { name: 'West Horacio', type: 'option', key: '3a702c15-3013-496f-9931-c90fb3a74381', page: 7, position: 48, parent_key: 'u_domicile' },
        { name: 'West Rexberg', type: 'option', key: '4c584172-dad6-4be1-b4f7-a14436b02ee2', page: 7, position: 49, parent_key: 'u_domicile' },
        { name: 'Murielport', type: 'option', key: '0b82f3e9-6d70-4045-b708-256674bfa9f5', page: 7, position: 51, parent_key: 'u_domicile' },
        { name: 'Candiestad', type: 'option', key: 'f70b9e6b-4266-413e-8db2-51c65aa8c63d', page: 7, position: 54, parent_key: 'u_domicile' },
        { name: 'North Hisakoland', type: 'option', key: 'e3510ee7-ff2f-4efc-88d7-900053c82829', page: 7, position: 56, parent_key: 'u_domicile' },
        { name: 'Boehmshire', type: 'option', key: '2985ff1e-28e2-426d-a991-8837dcfe2043', page: 7, position: 59, parent_key: 'u_domicile' },
        { name: 'Oscarburgh', type: 'option', key: '2e67f167-8966-4798-b6bf-572278786cb3', page: 7, position: 60, parent_key: 'u_domicile' },
        { name: 'Jonathanfort', type: 'option', key: 'dee7d6ee-4281-4df1-b6a5-fdef25960ed2', page: 7, position: 63, parent_key: 'u_domicile' },
        { name: 'Roweview', type: 'option', key: 'b9ca621b-2821-4fd0-82df-6b93e4138e22', page: 7, position: 65, parent_key: 'u_domicile' },
        { name: 'East Jackelineport', type: 'option', key: 'b0a97021-c224-4756-ab77-c86b52a648f7', page: 7, position: 67, parent_key: 'u_domicile' },
        { name: 'North Reyberg', type: 'option', key: '4fd79357-3ef9-445b-bf6a-e70bd7abb025', page: 7, position: 70, parent_key: 'u_domicile' },
        { name: 'Westbrook', type: 'option', key: '3382ae37-7b1e-4f25-955f-453c29a483b9', page: 7, position: 71, parent_key: 'u_domicile' },
        { name: 'Somewhere else', type: 'option', key: 'somewhere_else_41w', page: 7, position: 75, parent_key: 'u_domicile' }] }
  end
end

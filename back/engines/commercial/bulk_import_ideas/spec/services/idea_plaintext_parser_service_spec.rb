# frozen_string_literal: true

require 'rails_helper'

def parse_page(page)
  page
    .lines
    .reject { |line| line == "\n" }
    .map(&:strip)
    .join("\n")
end

def parse_pages(pages)
  pages.map { |page| parse_page(page) }
end

describe BulkImportIdeas::IdeaPlaintextParserService do
  let(:project) { create(:continuous_project) }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
  let(:custom_fields) { IdeaCustomFieldsService.new(Factory.instance.participation_method_for(project).custom_form).importable_fields }

  before do
    project.allowed_input_topics << create(:topic_economy)
    project.allowed_input_topics << create(:topic_waste)
  end

  describe 'form without descriptions' do
    before do
      # Custom fields
      create(:custom_field, resource: custom_form,
        key: 'pool_question',
        title_multiloc: { 'en' => 'Your favourite name for a swimming pool' },
        input_type: 'text',
        enabled: true,
        required: false)

      pizza_select_field = create(:custom_field, resource: custom_form,
        key: 'pizza',
        title_multiloc: { 'en' => 'How much do you like pizza' },
        input_type: 'select',
        enabled: true,
        required: false)
      create(:custom_field_option, custom_field: pizza_select_field,
        key: 'a-lot',
        title_multiloc: { 'en' => 'A lot' })
      create(:custom_field_option, custom_field: pizza_select_field,
        key: 'not-at-all',
        title_multiloc: { 'en' => 'Not at all' })

      burger_select_field = create(:custom_field, resource: custom_form,
        key: 'burgers',
        title_multiloc: { 'en' => 'How much do you like burgers' },
        input_type: 'select',
        enabled: true,
        required: false)
      create(:custom_field_option, custom_field: burger_select_field,
        key: 'a-lot',
        title_multiloc: { 'en' => 'A lot' })
      create(:custom_field_option, custom_field: burger_select_field,
        key: 'not-at-all',
        title_multiloc: { 'en' => 'Not at all' })
    end

    it 'parses text correctly (single document)' do
      text = parse_pages [
        "The\n
        City\n
        An idea? Bring it to your council!\n
        Instructions\n
        • Write as clearly as you can- these forms might be scanned\n
        • Write your answers in the same language as this form\n
        Title\n
        My very good idea\n
        Description\n
        would suggest building the\n
        new swimming Pool near the\n
        Shopping mall on Park Lane,\n
        It's easily accessible location\n
        with enough space\n
        an\n
        Location (optional)\n
        Dear shopping mall\n
        Your favourite name for a swimming pool (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        The cool pool\n
        How much do you like pizza (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        A lot\n
        ○ Not at all\n
        Page 1\n",
        "How much do you like burgers (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        O A lot\n
        Not at all\n
        Page 2\n"
      ]

      service = described_class.new project, custom_fields, 'en'
      docs = service.parse_text text

      result = [{
        form_pages: [1, 2],
        pdf_pages: [1, 2],
        fields: {
          'Title' => 'My very good idea',
          'Description' =>
                  "would suggest building the new swimming Pool near the Shopping mall on Park Lane, It's easily accessible location with enough space an",
          'Location (optional)' => 'Dear shopping mall',
          'Your favourite name for a swimming pool (optional)' => 'The cool pool',
          'How much do you like pizza (optional)' => 'A lot',
          'How much do you like burgers (optional)' => 'Not at all'
        }
      }]

      expect(docs).to eq result
    end

    it 'parses text correctly (multiple documents)' do
      text = parse_pages [
        "The\n
        City\n
        An idea? Bring it to your council!\n
        Instructions\n
        • Write as clearly as you can- these forms might be scanned\n
        • Write your answers in the same language as this form\n
        Title\n
        Another great idea, wow\n
        Description\n
        Can you\n
        believe how great this\n
        idea is? Absolutely mind-blowing.\n
        next-level stuff\n
        Location (optional)\n
        Pachecolaan 34, Brussels\n
        Your favourite name for a swimming pool (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        How much do you like pizza (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        ○ A lot\n
        ① Not at all\n
        Page 1\n",
        "How much do you like burgers (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        ☑ A lot\n
        ○ Not at all\n
        Page 2\n",
        "Title\n
        This one is a bil mediarre\n
        inedio,\n
        Description\n
        Honestly, I've seen better ideas.\n
        This one is a bit\n
        dissappointing.\n
        Location (optional)\n
        Your favourite name for a swimming pool (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        Pooly Mc Poolface\n
        How much do you like pizza (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        A lot\n
        ○ Not at all\n
        Page 1\n",
        "How much do you like burgers (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        ⑨ A lot\n
        ○ Not at all\n
        Page 2\n"
      ]

      service = described_class.new project, custom_fields, 'en'
      docs = service.parse_text text

      result = [{
        form_pages: [1, 2],
        pdf_pages: [1, 2],
        fields: { 'Title' => 'Another great idea, wow',
                  'Description' =>
           'Can you believe how great this idea is? Absolutely mind-blowing. next-level stuff',
                  'Location (optional)' => 'Pachecolaan 34, Brussels',
                  'Your favourite name for a swimming pool (optional)' => nil,
                  'How much do you like pizza (optional)' => 'Not at all',
                  'How much do you like burgers (optional)' => 'A lot' }
      },
        {
          form_pages: [1, 2],
          pdf_pages: [3, 4],
          fields: { 'Title' => 'This one is a bil mediarre inedio,',
                    'Description' =>
            "Honestly, I've seen better ideas. This one is a bit dissappointing.",
                    'Location (optional)' => nil,
                    'Your favourite name for a swimming pool (optional)' => 'Pooly Mc Poolface',
                    'How much do you like pizza (optional)' => 'A lot',
                    'How much do you like burgers (optional)' => 'A lot' }
        }]

      expect(docs).to eq result
    end
  end

  describe 'form with descriptions' do
    before do
      # Custom fields
      create(:custom_field, resource: custom_form,
        key: 'pool_question',
        title_multiloc: {
          'en' => 'Your favourite name for a swimming pool',
          'fr-FR' => 'Votre nom préféré pour une piscine'
        },
        description_multiloc: {
          'en' => "<p>A slightly longer description under a field, with a bunch of words used to explain things to people. Please don't put anything weird in this field, thanks!</p>",
          'fr-FR' => '<p>Une description un peu plus longue</p>'
        },
        input_type: 'text',
        enabled: true,
        required: false)

      pizza_select_field = create(:custom_field, resource: custom_form,
        key: 'pizza',
        title_multiloc: {
          'en' => 'How much do you like pizza',
          'fr-FR' => 'A quel point aimez-vous la pizza'
        },
        description_multiloc: {
          'en' => '<p>A short description</p>',
          'fr-FR' => '<p>Une brève description</p>'
        },
        input_type: 'select',
        enabled: true,
        required: false)
      create(:custom_field_option, custom_field: pizza_select_field,
        key: 'a-lot',
        title_multiloc: { 'en' => 'A lot', 'fr-FR': 'Beaucoup' })
      create(:custom_field_option, custom_field: pizza_select_field,
        key: 'not-at-all',
        title_multiloc: { 'en' => 'Not at all', 'fr-FR': 'Pas du tout' })

      burger_select_field = create(:custom_field, resource: custom_form,
        key: 'burgers',
        title_multiloc: {
          'en' => 'How much do you like burgers',
          'fr-FR' => 'A quel point aimez-vous les hamburgers'
        },
        input_type: 'select',
        enabled: true,
        required: false)
      create(:custom_field_option, custom_field: burger_select_field,
        key: 'a-lot',
        title_multiloc: { 'en' => 'A lot', 'fr-FR': 'Beaucoup' })
      create(:custom_field_option, custom_field: burger_select_field,
        key: 'not-at-all',
        title_multiloc: { 'en' => 'Not at all', 'fr-FR': 'Pas du tout' })

      ice_cream_field = create(:custom_field, resource: custom_form,
        key: 'icecream',
        title_multiloc: {
          'en' => 'Which flavors do you want?',
          'fr-FR' => 'Quelles sont les saveurs souhaitées?'
        },
        input_type: 'multiselect',
        enabled: true,
        required: true)
      create(:custom_field_option, custom_field: ice_cream_field,
        key: 'vanilla',
        title_multiloc: { 'en' => 'Vanilla', 'fr-FR': 'Vanille' })
      create(:custom_field_option, custom_field: ice_cream_field,
        key: 'strawberry',
        title_multiloc: { 'en' => 'Strawberry', 'fr-FR': 'Fraise' })
      create(:custom_field_option, custom_field: ice_cream_field,
        key: 'chocolate',
        title_multiloc: { 'en' => 'Chocolate', 'fr-FR': 'Chocolat' })
      create(:custom_field_option, custom_field: ice_cream_field,
        key: 'pistachio',
        title_multiloc: { 'en' => 'Pistachio', 'fr-FR': 'Pistache' })
    end

    it 'parses text correctly (single document)' do
      text = parse_pages [
        "The\n
        City\n
        An idea? Bring it to your council!\n
        Instructions\n
        • Write as clearly as you can- these forms might be scanned\n
        • Write your answers in the same language as this form\n
        Title\n
        Page numbers test\n
        Description\n
        Page numbers test description\n
        with words and things\n
        Location (optional)\n
        Somewhere\n
        Your favourite name for a swimming pool (optional)\n
        A slightly longer description under a field, with a bunch of words used to explain things to\n
        people. Please don't put anything weird in this field, thanks!\n
        *This answer will only be shared with moderators, and not to the public.\n
        Page 1\n",
        "How much do you like pizza (optional)\n
        A short description\n
        *This answer will only be shared with moderators, and not to the public.\n
        A lot\n
        ○ Not at all\n
        How much do you like burgers (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        ○ A lot\n
        ☑ Not at all\n
        Which flavors do you want?\n
        *Choose as many as you like\n
        *This answer will only be shared with moderators, and not to the public.\n
        ☐ Vanilla\n
        ☑ Strawberry\n
        Chocolate\n
        Pistachio\n
        Page 2\n"
      ]

      service = described_class.new project, custom_fields, 'en'
      docs = service.parse_text text

      result = [{
        form_pages: [1, 2],
        pdf_pages: [1, 2],
        fields: { 'Title' => 'Page numbers test',
                  'Description' => 'Page numbers test description with words and things',
                  'Location (optional)' => 'Somewhere',
                  'Your favourite name for a swimming pool (optional)' => nil,
                  'How much do you like pizza (optional)' => 'A lot',
                  'How much do you like burgers (optional)' => 'Not at all',
                  'Which flavors do you want?' => %w[Strawberry Chocolate Pistachio] }
      }]

      expect(docs).to eq result
    end

    it 'works in French' do
      text = parse_pages [
        "The\n
        City\n
        An idea? Bring it to your council!\n
        Instructions\n
        • Écrivez aussi clairement que possible: ces formulaires peuvent être numérisés\n
        • Écrivez vos réponses dans la même langue que ce formulaire\n
        Titre\n
        Test pour les page numbers\n
        Description\n
        Description du test pour les page numbers\n
        avec mots\n
        Adresse (optionnel)\n
        Champs-Élysées\n
        Votre nom préféré pour une piscine (optionnel)\n
        Une description un peu plus longue\n
        *Cette réponse ne sera communiquée qu'aux modérateurs, et non au public.\n
        Page 1\n",
        "A quel point aimez-vous la pizza (optionnel)\n
        Une brève description\n
        *Cette réponse ne sera communiquée qu'aux modérateurs, et non au public.\n
        Beaucoup\n
        ○ Pas du tout\n
        A quel point aimez-vous les hamburgers (optionnel)\n
        *Cette réponse ne sera communiquée qu'aux modérateurs, et non au public.\n
        ○ Beaucoup\n
        ☑ Pas du tout\n
        Quelles sont les saveurs souhaitées?\n
        *Choisissez-en autant que vous le souhaitez\n
        *Cette réponse ne sera communiquée qu'aux modérateurs, et non au public.\n
        ☐ Vanille\n
        ☑ Fraise\n
        Chocolat\n
        Pistache\n
        Page 2\n"
      ]

      service = described_class.new project, custom_fields, 'fr-FR'
      docs = service.parse_text text

      result = [{
        form_pages: [1, 2],
        pdf_pages: [1, 2],
        fields: {
          'Titre' => 'Test pour les page numbers',
          'Description' => 'Description du test pour les page numbers avec mots',
          'Adresse (optionnel)' => 'Champs-Élysées',
          'Votre nom préféré pour une piscine (optionnel)' => nil,
          'A quel point aimez-vous la pizza (optionnel)' => 'Beaucoup',
          'A quel point aimez-vous les hamburgers (optionnel)' => 'Pas du tout',
          'Quelles sont les saveurs souhaitées?' => %w[Fraise Chocolat Pistache]
        }
      }]

      expect(docs).to eq result
    end
  end

  describe 'form with number input' do
    let(:project) { create(:continuous_project) }
    let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

    before do
      # Topics for project
      project.allowed_input_topics << create(:topic_economy)
      project.allowed_input_topics << create(:topic_waste)

      # Custom fields
      create(:custom_field, resource: custom_form,
        key: 'pool_question',
        title_multiloc: {
          'en' => 'Your favourite name for a swimming pool',
          'fr-FR' => 'Votre nom préféré pour une piscine'
        },
        description_multiloc: {
          'en' => "<p>A slightly longer description under a field, with a bunch of words used to explain things to people. Please don't put anything weird in this field, thanks!</p>",
          'fr-FR' => '<p>Une description un peu plus longue</p>'
        },
        input_type: 'text',
        enabled: true,
        required: false)

      create(:custom_field, resource: custom_form,
        key: 'number_field',
        title_multiloc: {
          'en' => 'What is your favorite number?'
        },
        description_multiloc: {
          'en' => '<p>Some description</p>'
        },
        input_type: 'number',
        enabled: true,
        required: true)
    end

    it 'parses text correctly (single document)' do
      text = parse_pages [
        "The\n
        City\n
        An idea? Bring it to your council!\n
        Instructions\n
        • Write as clearly as you can- these forms might be scanned\n
        • Write your answers in the same language as this form\n
        Title\n
        dea\n
        Whatever idea\n
        Description\n
        Bla Bla Bla. IBla. \n
        I am\n
        really\n
        running out of ideasор\n
        Location (optional)\n
        Some location\n
        Your favourite name for a swimming pool (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        The nice pool\n
        Page 1\n",
        "What is your favorite number?\n
        Some description\n
        *This answer will only be shared with moderators, and not to the public.\n
        72296\n
        Page 2\n"
      ]

      service = described_class.new project, custom_fields, 'en'
      docs = service.parse_text text

      result = [{
        pdf_pages: [1, 2],
        form_pages: [1, 2],
        fields: {
          'Title' => 'dea Whatever idea',
          'Description' => 'Bla Bla Bla. IBla. I am really running out of ideasор',
          'Location (optional)' => 'Some location',
          'Your favourite name for a swimming pool (optional)' => 'The nice pool',
          'What is your favorite number?' => 72_296
        }
      }]

      expect(docs).to eq result
    end

    it 'handles non-integer characters' do
      text = parse_pages [
        "The\n
        City\n
        An idea? Bring it to your council!\n
        Instructions\n
        • Write as clearly as you can- these forms might be scanned\n
        • Write your answers in the same language as this form\n
        Title\n
        dea\n
        Whatever idea\n
        Description\n
        Bla Bla Bla. IBla. \n
        I am\n
        really\n
        running out of ideasор\n
        Location (optional)\n
        Some location\n
        Your favourite name for a swimming pool (optional)\n
        *This answer will only be shared with moderators, and not to the public.\n
        The nice pool\n
        Page 1\n",
        "What is your favorite number?\n
        Some description\n
        *This answer will only be shared with moderators, and not to the public.\n
        2OIZS\n
        Page 2\n"
      ]

      service = described_class.new project, custom_fields, 'en'
      docs = service.parse_text text

      result = [{
        pdf_pages: [1, 2],
        form_pages: [1, 2],
        fields: {
          'Title' => 'dea Whatever idea',
          'Description' => 'Bla Bla Bla. IBla. I am really running out of ideasор',
          'Location (optional)' => 'Some location',
          'Your favourite name for a swimming pool (optional)' => 'The nice pool',
          'What is your favorite number?' => 20_125
        }
      }]

      expect(docs).to eq result
    end
  end

  describe 'edge cases' do
    before do
      create(:custom_field, resource: custom_form,
        key: 'pool_question',
        title_multiloc: { 'en' => 'Your favourite name for a swimming pool' },
        description_multiloc: { 'en' => 'Answer this question with "Pizza nutella"' },
        input_type: 'text',
        enabled: true,
        required: false)
    end

    it 'handles values matching substrings of description' do
      text = parse_pages [
        "The\n
        City\n
        An idea? Bring it to your council!\n
        Instructions\n
        • Write as clearly as you can- these forms might be scanned\n
        • Write your answers in the same language as this form\n
        Title\n
        Test\n
        Description\n
        Test description\n
        with words and things\n
        Location (optional)\n
        Somewhere\n
        Your favourite name for a swimming pool (optional)\n
        Answer this question with \"Pizza nutella\"\n
        *This answer will only be shared with moderators, and not to the public.\n
        Pizza nutella\n
        Page 1\n"
      ]

      service = described_class.new project, custom_fields, 'en'
      docs = service.parse_text text

      result = [{
        form_pages: [1],
        pdf_pages: [1],
        fields: { 'Title' => 'Test',
                  'Description' => 'Test description with words and things',
                  'Location (optional)' => 'Somewhere',
                  'Your favourite name for a swimming pool (optional)' => 'Pizza nutella' }
      }]

      expect(docs).to eq result
    end

    it 'handles missing page numbers' do
      text = parse_pages [
        "The\n
        City\n
        An idea? Bring it to your council!\n
        Instructions\n
        • Write as clearly as you can- these forms might be scanned\n
        • Write your answers in the same language as this form\n
        Title\n
        Test\n
        Description\n
        Test description\n
        with words and things\n
        Location (optional)\n
        Somewhere\n",
        "Your favourite name for a swimming pool (optional)\n
        Answer this question with \"Pizza nutella\"\n
        *This answer will only be shared with moderators, and not to the public.\n
        Pizza nutella\n",
        "The\n
        City\n
        An idea? Bring it to your council!\n
        Instructions\n
        • Write as clearly as you can- these forms might be scanned\n
        • Write your answers in the same language as this form\n
        Title\n
        Test\n
        Description\n
        Test description\n
        with words and things\n
        Location (optional)\n
        Somewhere\n",
        "Your favourite name for a swimming pool (optional)\n
        Answer this question with \"Pizza nutella\"\n
        *This answer will only be shared with moderators, and not to the public.\n
        Pizza nutella\n"
      ]

      service = described_class.new project, custom_fields, 'en', 'test'
      docs = service.parse_text text

      result = [{
        form_pages: [],
        pdf_pages: [1, 2],
        fields: { 'Title' => 'Test',
                  'Description' => 'Test description with words and things',
                  'Location (optional)' => 'Somewhere',
                  'Your favourite name for a swimming pool (optional)' => 'Pizza nutella' }
      }, {
        form_pages: [],
        pdf_pages: [3, 4],
        fields: { 'Title' => 'Test',
                  'Description' => 'Test description with words and things',
                  'Location (optional)' => 'Somewhere',
                  'Your favourite name for a swimming pool (optional)' => 'Pizza nutella' }
      }]

      expect(docs).to eq result
    end
  end
end

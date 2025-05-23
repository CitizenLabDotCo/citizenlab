# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Parsers::Pdf::IdeaPlainTextParserService do
  describe 'Ideation project' do
    let(:project) { create(:single_phase_ideation_project) }
    let(:service) { described_class.new custom_form.custom_fields, 'en' }
    let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

    # This raw text array is a representation of the raw text we get returned from Google Document AI
    let(:raw_text_array) do
      ["
        The
        City
        An idea? Bring it to your council!
        Instructions
        • Write as clearly as you can- these forms might be scanned
        • Write your answers in the same language as this form
        Title
        My very good idea
        Description
        I would suggest building the
        new swimming Pool near the
        Shopping mall on Park Lane
        Location (optional)
        Sheffield
        Page 1
      ", "
        Text field (optional)
        A text field description
        *This answer will only be shared with moderators, and not to the public.
        This is the text for the first text field
        Number field (optional)
        *This answer will only be shared with moderators, and not to the public.
        85
        Select field (optional)
        *This answer will only be shared with moderators, and not to the public.
        ☑ Yes
        ○ No
        Multi select field (optional)
        *Choose as many as you like
        *This answer will only be shared with moderators, and not to the public.
        ☑ This
        ○ That
        ☒ Another
        Page 2
      ", "
        Linear scale field (optional)
        Please write a number between 1 and 5 only
        *This answer will only be shared with moderators, and not to the public.
        4
        Another select field (optional)
        This is the description for the field
        *This answer will only be shared with moderators, and not to the public.
        ○ Yes
        ☒ No
        Page 3
      "]
    end

    before do
      # Custom fields
      create(:custom_field, resource: custom_form, key: 'a_text_field', title_multiloc: { 'en' => 'Text field' }, description_multiloc: { 'en' => 'A text field description' })
      create(:custom_field, resource: custom_form, key: 'number_field', title_multiloc: { 'en' => 'Number field' }, input_type: 'number')
      select_field = create(:custom_field, resource: custom_form, key: 'select_field', title_multiloc: { 'en' => 'Select field' }, input_type: 'select')
      create(:custom_field_option, custom_field: select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
      create(:custom_field_option, custom_field: select_field, key: 'no', title_multiloc: { 'en' => 'No' })
      multiselect_field = create(:custom_field, resource: custom_form, key: 'multiselect_field', title_multiloc: { 'en' => 'Multi select field' }, input_type: 'multiselect')
      create(:custom_field_option, custom_field: multiselect_field, key: 'this', title_multiloc: { 'en' => 'This' })
      create(:custom_field_option, custom_field: multiselect_field, key: 'that', title_multiloc: { 'en' => 'That' })
      create(:custom_field_option, custom_field: multiselect_field, key: 'another', title_multiloc: { 'en' => 'Another' })
      create(:custom_field, resource: custom_form, key: 'linear_scale_field', title_multiloc: { 'en' => 'Linear scale field' }, input_type: 'linear_scale', maximum: 5)
      another_select_field = create(:custom_field, resource: custom_form, key: 'another_select_field', title_multiloc: { 'en' => 'Another select field' }, input_type: 'select', description_multiloc: { 'en' => '<p>This is the description for the field</p>' })
      create(:custom_field_option, custom_field: another_select_field, key: 'yes', title_multiloc: { 'en' => 'Yes' })
      create(:custom_field_option, custom_field: another_select_field, key: 'no', title_multiloc: { 'en' => 'No' })
    end

    it 'parses an ideation response correctly' do
      expected_result = {
        pdf_pages: [1, 2, 3],
        fields: { 'Title' => 'My very good idea',
                  'Description' => 'I would suggest building the new swimming Pool near the Shopping mall on Park Lane',
                  'Location (optional)' => 'Sheffield',
                  'Text field (optional)' => 'This is the text for the first text field',
                  'Number field (optional)' => 85,
                  'Select field (optional)' => 'Yes',
                  'Multi select field (optional)' => %w[This Another],
                  'Linear scale field (optional)' => 4,
                  'Another select field (optional)' => 'No' }
      }
      expect(service.parse_text(raw_text_array)).to eq expected_result
    end

    it 'parses incorrectly identified numbers' do
      raw_text_array = ["
        Number field (optional)
        *This answer will only be shared with moderators, and not to the public.
        2OIZS
        Page 1
      "]
      fields = service.parse_text(raw_text_array)[:fields]
      expect(fields['Number field (optional)']).to eq 20_125
    end

    it 'parses different selected option identifiers correctly' do
      raw_text_array = ["
        Select field (optional)
        *This answer will only be shared with moderators, and not to the public.
        ☐ Yes
        ☒ No
        Multi select field (optional)
        *Choose as many as you like
        *This answer will only be shared with moderators, and not to the public.
        > This
        ○ That
        ☒ Another
        Page 1
      "]
      fields = service.parse_text(raw_text_array)[:fields]
      expect(fields['Select field (optional)']).to eq 'No'
      expect(fields['Multi select field (optional)']).to eq %w[This Another]
    end

    it 'parses options without a selected option identifier as selected for "select" fields only' do
      raw_text_array = ["
        Select field (optional)
        *This answer will only be shared with moderators, and not to the public.
        Yes
        ○ No
        Multi select field (optional)
        *Choose as many as you like
        *This answer will only be shared with moderators, and not to the public.
        O This
        That
        ☒ Another
        Page 1
      "]
      fields = service.parse_text(raw_text_array)[:fields]
      expect(fields['Select field (optional)']).to eq 'Yes'
      expect(fields['Multi select field (optional)']).to match_array %w[Another]
    end

    it 'chooses the first option for select fields if both are filled' do
      raw_text_array = ["
        Select field (optional)
        *This answer will only be shared with moderators, and not to the public.
        ☑ Yes
        ☒ No
        Page 1
      "]
      fields = service.parse_text(raw_text_array)[:fields]
      expect(fields['Select field (optional)']).to eq 'Yes'
    end

    it 'parses when question titles are split across lines' do
      create(:custom_field, resource: custom_form, title_multiloc: { 'en' => 'Really long text field title that will span multiple lines' })
      raw_text_array = ["
        Really long text field title that
        will span multiple lines (optional)
        *This answer will only be shared with moderators, and not to the public.
        This is my answer
        Page 1
      "]
      fields = service.parse_text(raw_text_array)[:fields]
      expect(fields['Really long text field title that will span multiple lines (optional)']).to eq 'This is my answer'
    end

    it 'parses with long multiline field descriptions with HTML' do
      create(:custom_field,
        resource: custom_form,
        title_multiloc: { 'en' => 'New text field' },
        description_multiloc: {
          'en' => '<p>This is an important description that will be split over <b>multiple lines</b> and contain HTML. OK is that clear?</p>'
        })
      raw_text_array = ["
        New text field (optional)
        This is an important description that will be split over
        multiple lines and contain HTML. OK is that clear?
        *This answer will only be shared with moderators, and not to the public.
        This is my answer
        Page 1
      "]
      fields = service.parse_text(raw_text_array)[:fields]
      expect(fields['New text field (optional)']).to eq 'This is my answer'
    end

    it 'works in another language (French)' do
      project = create(:single_phase_ideation_project)
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      create(
        :custom_field,
        resource: custom_form,
        title_multiloc: { 'fr-FR' => 'Votre nom préféré pour une piscine' },
        description_multiloc: { 'fr-FR' => '<p>Une <b>description</b> un peu plus longue</p>' }
      )
      create(
        :custom_field_select,
        resource: custom_form,
        title_multiloc: { 'fr-FR' => 'Veux-tu de la nourriture?' },
        options: [
          create(:custom_field_option, title_multiloc: { 'fr-FR' => 'Oui' }),
          create(:custom_field_option, title_multiloc: { 'fr-FR' => 'Non' })
        ]
      )
      raw_text_array = ["
        The
        City
        An idea? Bring it to your council!
        Instructions
        • Écrivez aussi clairement que possible: ces formulaires peuvent être numérisés
        • Écrivez vos réponses dans la même langue que ce formulaire
        Titre
        Test pour les page numbers
        Description
        C'est une idée fantastique
        et j'adore ça
        Adresse (optionnel)
        Champs-Élysées
        Page 1
      ", "
        Votre nom préféré pour une piscine (optionnel)
        Une description un peu plus longue
        *Cette réponse ne sera communiquée qu'aux modérateurs, et non au public.
        Je veux lui donner le nom de
        la rivière
        Veux-tu de la nourriture? (optionnel)
        *Cette réponse ne sera communiquée qu'aux modérateurs, et non au public.
        ☑ Oui
        ○ Non
        Page 2
      "]

      service = described_class.new custom_form.custom_fields, 'fr-FR'
      expected_result = {
        pdf_pages: [1, 2],
        fields: {
          'Titre' => 'Test pour les page numbers',
          'Description' => "C'est une idée fantastique et j'adore ça",
          'Adresse (optionnel)' => 'Champs-Élysées',
          'Votre nom préféré pour une piscine (optionnel)' => 'Je veux lui donner le nom de la rivière',
          'Veux-tu de la nourriture? (optionnel)' => 'Oui'
        }
      }

      expect(service.parse_text(raw_text_array)).to eq expected_result
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

# Note that projects and phases in the tests are created with an input_term,
# while their value is irrelevant. After all, the input_term is an argument
# when creating an instance of the described class. To express the irrelevance,
# the input_term for created projects and phases is different from the input_term
# passed when creating an instance of the described class.

RSpec.describe InputUiSchemaGeneratorService do
  let(:input_term) { 'question' }
  let(:field_key) { 'field_key' }

  describe '#generate_for' do
    context 'ideation form' do
      subject(:generator) { described_class.new input_term, true }

      let(:fields) { IdeaCustomFieldsService.new(custom_form).enabled_fields }
      let(:ui_schema) { generator.generate_for fields }

      context 'for a project with an ideation phase, a changed built-in field and an extra section and field' do
        let(:project) { create(:single_phase_ideation_project, phase_attrs: { input_term: input_term }) }
        let!(:custom_form) do
          create(:custom_form, :with_default_fields, participation_context: project).tap do |form|
            form.custom_fields.find_by(code: 'title_multiloc').update!(
              description_multiloc: { 'en' => 'My title description', 'nl-NL' => 'Mijn titel beschrijving' }
            )
          end
        end
        let!(:extra_section) do
          create(
            :custom_field_section,
            :for_custom_form,
            resource: custom_form,
            title_multiloc: {
              'en' => 'Extra fields',
              # No 'nl-NL' to describe that it will default to 'en'.
              'fr-FR' => 'Extra choses'
            },
            description_multiloc: {
              'en' => 'Custom stuff',
              # No 'nl-NL' to describe that it will default to 'en'.
              'fr-FR' => 'Des choses en plus'
            }
          )
        end
        let!(:extra_field) do
          create(
            :custom_field,
            :for_custom_form,
            resource: custom_form,
            input_type: 'html_multiloc',
            key: 'extra_field',
            title_multiloc: {
              'en' => 'Extra field title',
              'nl-NL' => 'Extra veldtitel'
              # No 'fr-FR' to describe that it will default to 'en'.
            },
            description_multiloc: {
              'en' => 'Extra field description',
              'nl-NL' => 'Extra veldbeschrijving'
              # No 'fr-FR' to describe that it will default to 'en'.
            }
          )
        end

        it 'returns the schema for the given fields' do
          expect(ui_schema.keys).to match_array %w[en fr-FR nl-NL]
          # en
          expect(ui_schema['en']).to eq(
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: input_term
            },
            elements: [
              {
                type: 'Category',
                label: 'What is your question?',
                options: {
                  id: custom_form.custom_fields.find_by(code: 'ideation_section1').id,
                  description: ''
                },
                elements: [
                  {
                    type: 'VerticalLayout',
                    options: { input_type: 'text_multiloc', render: 'multiloc' },
                    elements: [
                      {
                        type: 'Control',
                        scope: '#/properties/title_multiloc/properties/en',
                        label: 'Title',
                        options: {
                          answer_visible_to: 'public',
                          description: 'My title description',
                          isAdminField: false,
                          hasRule: false,
                          locale: 'en',
                          trim_on_blur: true
                        }
                      },
                      {
                        type: 'Control',
                        scope: '#/properties/title_multiloc/properties/fr-FR',
                        label: 'Title',
                        options: {
                          answer_visible_to: 'public',
                          description: 'My title description',
                          isAdminField: false,
                          hasRule: false,
                          locale: 'fr-FR',
                          trim_on_blur: true
                        }
                      },
                      {
                        type: 'Control',
                        scope: '#/properties/title_multiloc/properties/nl-NL',
                        label: 'Title',
                        options: {
                          answer_visible_to: 'public',
                          description: 'My title description',
                          isAdminField: false,
                          hasRule: false,
                          locale: 'nl-NL',
                          trim_on_blur: true
                        }
                      }
                    ]
                  },
                  {
                    type: 'VerticalLayout',
                    options: { input_type: 'html_multiloc', render: 'multiloc' },
                    elements: [
                      {
                        type: 'Control',
                        scope: '#/properties/body_multiloc/properties/en',
                        label: 'Description',
                        options: {
                          answer_visible_to: 'public',
                          description: '',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'en'
                        }
                      },
                      {
                        type: 'Control',
                        scope: '#/properties/body_multiloc/properties/fr-FR',
                        label: 'Description',
                        options: {
                          answer_visible_to: 'public',
                          description: '',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'fr-FR'
                        }
                      },
                      {
                        type: 'Control',
                        scope: '#/properties/body_multiloc/properties/nl-NL',
                        label: 'Description',
                        options: {
                          answer_visible_to: 'public',
                          description: '',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'nl-NL'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                type: 'Category',
                label: 'Images and attachments',
                options: {
                  id: custom_form.custom_fields.find_by(code: 'ideation_section2').id,
                  description: 'Upload your favourite files here'
                },
                elements: [
                  {
                    type: 'Control',
                    scope: '#/properties/idea_images_attributes',
                    label: 'Images',
                    options: {
                      answer_visible_to: 'public',
                      description: '',
                      input_type: 'image_files',
                      isAdminField: false,
                      hasRule: false
                    }
                  },
                  {
                    type: 'Control',
                    scope: '#/properties/idea_files_attributes',
                    label: 'Attachments',
                    options: {
                      answer_visible_to: 'public',
                      description: '',
                      input_type: 'files',
                      isAdminField: false,
                      hasRule: false
                    }
                  }
                ]
              },
              {
                type: 'Category',
                label: 'Details',
                options: {
                  id: custom_form.custom_fields.find_by(code: 'ideation_section3').id,
                  description: ''
                },
                elements: [
                  {
                    type: 'Control',
                    scope: '#/properties/topic_ids',
                    label: 'Tags',
                    options: {
                      answer_visible_to: 'public',
                      description: '',
                      input_type: 'topic_ids',
                      isAdminField: false,
                      hasRule: false
                    }
                  },
                  {
                    type: 'Control',
                    scope: '#/properties/location_description',
                    label: 'Location',
                    options: {
                      answer_visible_to: 'public',
                      description: '',
                      input_type: 'text',
                      isAdminField: false,
                      hasRule: false,
                      transform: 'trim_on_blur'
                    }
                  }
                ]
              },
              {
                type: 'Category',
                label: 'Extra fields',
                options: { id: extra_section.id, description: 'Custom stuff' },
                elements: [
                  {
                    type: 'VerticalLayout',
                    options: { input_type: 'html_multiloc', render: 'multiloc' },
                    elements: [
                      {
                        type: 'Control',
                        scope: '#/properties/extra_field/properties/en',
                        label: 'Extra field title',
                        options: {
                          answer_visible_to: 'admins',
                          description: 'Extra field description',
                          isAdminField: false,
                          hasRule: false,
                          locale: 'en',
                          render: 'WYSIWYG',
                          trim_on_blur: true
                        }
                      },
                      {
                        type: 'Control',
                        scope: '#/properties/extra_field/properties/fr-FR',
                        label: 'Extra field title',
                        options: {
                          answer_visible_to: 'admins',
                          description: 'Extra field description',
                          isAdminField: false,
                          hasRule: false,
                          locale: 'fr-FR',
                          render: 'WYSIWYG',
                          trim_on_blur: true
                        }
                      },
                      {
                        type: 'Control',
                        scope: '#/properties/extra_field/properties/nl-NL',
                        label: 'Extra field title',
                        options: {
                          answer_visible_to: 'admins',
                          description: 'Extra field description',
                          isAdminField: false,
                          hasRule: false,
                          locale: 'nl-NL',
                          render: 'WYSIWYG',
                          trim_on_blur: true
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          )
          # fr-FR
          expect(ui_schema['fr-FR']).to match(
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: input_term
            },
            elements: [
              hash_including(
                type: 'Category',
                label: 'Quelle est votre question ?',
                elements: [
                  hash_including(
                    type: 'VerticalLayout',
                    options: { input_type: 'text_multiloc', render: 'multiloc' },
                    elements: [
                      hash_including(
                        scope: '#/properties/title_multiloc/properties/en',
                        label: 'Titre',
                        options: hash_including(locale: 'en')
                      ),
                      hash_including(
                        scope: '#/properties/title_multiloc/properties/fr-FR',
                        label: 'Titre',
                        options: hash_including(locale: 'fr-FR')
                      ),
                      hash_including(
                        scope: '#/properties/title_multiloc/properties/nl-NL',
                        label: 'Titre',
                        options: hash_including(locale: 'nl-NL')
                      )
                    ]
                  ),
                  hash_including(
                    type: 'VerticalLayout',
                    options: { input_type: 'html_multiloc', render: 'multiloc' },
                    elements: [
                      hash_including(
                        scope: '#/properties/body_multiloc/properties/en',
                        label: 'Description',
                        options: hash_including(locale: 'en', render: 'WYSIWYG')
                      ),
                      hash_including(
                        scope: '#/properties/body_multiloc/properties/fr-FR',
                        label: 'Description',
                        options: hash_including(locale: 'fr-FR', render: 'WYSIWYG')
                      ),
                      hash_including(
                        scope: '#/properties/body_multiloc/properties/nl-NL',
                        label: 'Description',
                        options: hash_including(locale: 'nl-NL', render: 'WYSIWYG')
                      )
                    ]
                  )
                ]
              ),
              hash_including(
                type: 'Category',
                label: 'Images et pièces jointes',
                elements: [
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/idea_images_attributes',
                    label: 'Images',
                    options: hash_including(input_type: 'image_files')
                  ),
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/idea_files_attributes',
                    label: 'Pièces jointes',
                    options: hash_including(input_type: 'files')
                  )
                ]
              ),
              hash_including(
                type: 'Category',
                label: 'Details',
                elements: [
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/topic_ids',
                    label: 'Étiquettes',
                    options: hash_including(input_type: 'topic_ids')
                  ),
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/location_description',
                    label: 'Adresse',
                    options: hash_including(input_type: 'text')
                  )
                ]
              ),
              hash_including(
                type: 'Category',
                label: 'Extra choses',
                options: hash_including(description: 'Des choses en plus'),
                elements: [
                  hash_including(
                    type: 'VerticalLayout',
                    options: { input_type: 'html_multiloc', render: 'multiloc' },
                    elements: [
                      hash_including(
                        type: 'Control',
                        scope: '#/properties/extra_field/properties/en',
                        label: 'Extra field title',
                        options: hash_including(description: 'Extra field description', locale: 'en', render: 'WYSIWYG')
                      ),
                      hash_including(
                        type: 'Control',
                        scope: '#/properties/extra_field/properties/fr-FR',
                        label: 'Extra field title',
                        options: hash_including(description: 'Extra field description', locale: 'fr-FR', render: 'WYSIWYG')
                      ),
                      hash_including(
                        type: 'Control',
                        scope: '#/properties/extra_field/properties/nl-NL',
                        label: 'Extra field title',
                        options: hash_including(description: 'Extra field description', locale: 'nl-NL', render: 'WYSIWYG')
                      )
                    ]
                  )
                ]
              )
            ]
          )
          # nl-NL
          expect(ui_schema['nl-NL']).to match(
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: input_term
            },
            elements: [
              hash_including(
                type: 'Category',
                label: 'Wat is je vraag?',
                elements: [
                  hash_including(
                    type: 'VerticalLayout',
                    options: { input_type: 'text_multiloc', render: 'multiloc' },
                    elements: [
                      hash_including(
                        scope: '#/properties/title_multiloc/properties/en',
                        label: 'Titel',
                        options: hash_including(locale: 'en', description: 'Mijn titel beschrijving')
                      ),
                      hash_including(
                        scope: '#/properties/title_multiloc/properties/fr-FR',
                        label: 'Titel',
                        options: hash_including(locale: 'fr-FR', description: 'Mijn titel beschrijving')
                      ),
                      hash_including(
                        scope: '#/properties/title_multiloc/properties/nl-NL',
                        label: 'Titel',
                        options: hash_including(locale: 'nl-NL', description: 'Mijn titel beschrijving')
                      )
                    ]
                  ),
                  hash_including(
                    type: 'VerticalLayout',
                    options: { input_type: 'html_multiloc', render: 'multiloc' },
                    elements: [
                      hash_including(
                        scope: '#/properties/body_multiloc/properties/en',
                        label: 'Beschrijving',
                        options: hash_including(locale: 'en', render: 'WYSIWYG')
                      ),
                      hash_including(
                        scope: '#/properties/body_multiloc/properties/fr-FR',
                        label: 'Beschrijving',
                        options: hash_including(locale: 'fr-FR', render: 'WYSIWYG')
                      ),
                      hash_including(
                        scope: '#/properties/body_multiloc/properties/nl-NL',
                        label: 'Beschrijving',
                        options: hash_including(locale: 'nl-NL', render: 'WYSIWYG')
                      )
                    ]
                  )
                ]
              ),
              hash_including(
                type: 'Category',
                label: 'Afbeeldingen en bijlagen',
                elements: [
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/idea_images_attributes',
                    label: 'Afbeeldingen',
                    options: hash_including(input_type: 'image_files')
                  ),
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/idea_files_attributes',
                    label: 'Bijlagen',
                    options: hash_including(input_type: 'files')
                  )
                ]
              ),
              hash_including(
                type: 'Category',
                label: 'Details',
                elements: [
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/topic_ids',
                    label: 'Tags',
                    options: hash_including(input_type: 'topic_ids')
                  ),
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/location_description',
                    label: 'Locatie',
                    options: hash_including(input_type: 'text')
                  )
                ]
              ),
              hash_including(
                type: 'Category',
                label: 'Extra fields',
                options: hash_including(description: 'Custom stuff'),
                elements: [
                  hash_including(
                    type: 'VerticalLayout',
                    options: { input_type: 'html_multiloc', render: 'multiloc' },
                    elements: [
                      hash_including(
                        type: 'Control',
                        scope: '#/properties/extra_field/properties/en',
                        label: 'Extra veldtitel',
                        options: hash_including(description: 'Extra veldbeschrijving', locale: 'en', render: 'WYSIWYG')
                      ),
                      hash_including(
                        type: 'Control',
                        scope: '#/properties/extra_field/properties/fr-FR',
                        label: 'Extra veldtitel',
                        options: hash_including(description: 'Extra veldbeschrijving', locale: 'fr-FR', render: 'WYSIWYG')
                      ),
                      hash_including(
                        type: 'Control',
                        scope: '#/properties/extra_field/properties/nl-NL',
                        label: 'Extra veldtitel',
                        options: hash_including(description: 'Extra veldbeschrijving', locale: 'nl-NL', render: 'WYSIWYG')
                      )
                    ]
                  )
                ]
              )
            ]
          )
        end
      end

      context 'for a project with an ideation phase and with an empty custom section' do
        let(:project) { create(:single_phase_ideation_project, phase_attrs: { input_term: input_term }) }
        let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
        let!(:extra_section) do
          create(
            :custom_field_section,
            :for_custom_form,
            resource: custom_form,
            title_multiloc: { 'en' => 'Empty custom section' }
          )
        end

        it 'returns the schema for the given fields' do
          expect(ui_schema.keys).to match_array %w[en fr-FR nl-NL]
          expect(ui_schema['en']).to match(
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: input_term
            },
            elements: [
              hash_including(type: 'Category', label: 'What is your question?'),
              hash_including(type: 'Category', label: 'Images and attachments'),
              hash_including(type: 'Category', label: 'Details'),
              hash_including(type: 'Category', label: 'Empty custom section', elements: [])
            ]
          )
        end
      end

      context 'for a project with an ideation phase and with the default form' do
        let(:input_term) { 'option' }
        let(:project) { create(:single_phase_ideation_project, phase_attrs: { input_term: input_term }) }
        let(:custom_form) { create(:custom_form, participation_context: project) }

        it 'returns the schema for the default fields' do
          expect(ui_schema.keys).to match_array %w[en fr-FR nl-NL]
          expect(ui_schema['en']).to match(
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: input_term
            },
            elements: [
              hash_including(
                type: 'Category',
                label: 'What is your option?',
                elements: [
                  hash_including(
                    type: 'VerticalLayout',
                    options: { input_type: 'text_multiloc', render: 'multiloc' },
                    elements: [
                      hash_including(
                        scope: '#/properties/title_multiloc/properties/en',
                        label: 'Title',
                        options: hash_including(locale: 'en')
                      ),
                      hash_including(
                        scope: '#/properties/title_multiloc/properties/fr-FR',
                        label: 'Title',
                        options: hash_including(locale: 'fr-FR')
                      ),
                      hash_including(
                        scope: '#/properties/title_multiloc/properties/nl-NL',
                        label: 'Title',
                        options: hash_including(locale: 'nl-NL')
                      )
                    ]
                  ),
                  hash_including(
                    type: 'VerticalLayout',
                    options: { input_type: 'html_multiloc', render: 'multiloc' },
                    elements: [
                      hash_including(
                        scope: '#/properties/body_multiloc/properties/en',
                        label: 'Description',
                        options: hash_including(locale: 'en', render: 'WYSIWYG')
                      ),
                      hash_including(
                        scope: '#/properties/body_multiloc/properties/fr-FR',
                        label: 'Description',
                        options: hash_including(locale: 'fr-FR', render: 'WYSIWYG')
                      ),
                      hash_including(
                        scope: '#/properties/body_multiloc/properties/nl-NL',
                        label: 'Description',
                        options: hash_including(locale: 'nl-NL', render: 'WYSIWYG')
                      )
                    ]
                  )
                ]
              ),
              hash_including(
                type: 'Category',
                label: 'Images and attachments',
                options: hash_including(description: 'Upload your favourite files here'),
                elements: [
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/idea_images_attributes',
                    label: 'Images',
                    options: hash_including(input_type: 'image_files')
                  ),
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/idea_files_attributes',
                    label: 'Attachments',
                    options: hash_including(input_type: 'files')
                  )
                ]
              ),
              hash_including(
                type: 'Category',
                label: 'Details',
                elements: [
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/topic_ids',
                    label: 'Tags',
                    options: hash_including(input_type: 'topic_ids')
                  ),
                  hash_including(
                    type: 'Control',
                    scope: '#/properties/location_description',
                    label: 'Location',
                    options: hash_including(input_type: 'text')
                  )
                ]
              )
            ]
          )
        end

        it 'uses the right input_term' do
          expect(ui_schema.dig('en', :options, :inputTerm)).to eq 'option'
        end

        context 'when a nil input_term is given' do
          let(:input_term) { nil }

          it 'uses the default "idea" as input_term' do
            expect(ui_schema.dig('en', :options, :inputTerm)).to eq 'idea'
          end
        end
      end

      context 'for projects with multiple phases' do
        let(:input_term) { 'contribution' }
        let(:fields) do
          project_with_current_phase = create(:project_with_current_phase)
          TimelineService.new.current_phase(project_with_current_phase).update!(input_term: 'option')
          IdeaCustomFieldsService.new(create(:custom_form, participation_context: project_with_current_phase)).all_fields
        end

        it 'uses the right input_term' do
          expect(ui_schema.dig('en', :options, :inputTerm)).to eq 'contribution'
        end
      end
    end

    context 'native survey forms' do
      subject(:generator) { described_class.new input_term, false }

      let(:ui_schema) { generator.generate_for IdeaCustomFieldsService.new(custom_form).enabled_fields }

      context 'for a native survey phase without pages' do
        let(:project) { create(:single_phase_native_survey_project) }
        let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
        let!(:field) { create(:custom_field, resource: custom_form) }

        it 'has an empty extra category label, so that the category label is suppressed in the UI' do
          en_ui_schema = generator.generate_for([field])['en']
          expect(en_ui_schema).to eq({
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: input_term
            },
            elements: [{
              type: 'Category',
              label: nil,
              options: { id: 'extra' },
              elements: [{
                type: 'Control',
                scope: "#/properties/#{field.key}",
                label: 'Did you attend',
                options: {
                  input_type: field.input_type,
                  description: 'Which councils are you attending in our city?',
                  isAdminField: false,
                  hasRule: false,
                  transform: 'trim_on_blur'
                }
              }]
            }]
          })
        end
      end

      context 'for a native survey phase with pages' do
        let(:project) { create(:single_phase_native_survey_project) }
        let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
        let!(:page1) do
          create(
            :custom_field_page,
            resource: custom_form,
            key: 'about_you',
            title_multiloc: { 'en' => 'About you' },
            description_multiloc: { 'en' => 'Please fill in some <strong>personal details</strong>.' }
          )
        end
        let!(:field_in_page1) do
          create(
            :custom_field,
            resource: custom_form,
            key: 'what_is_your_age',
            title_multiloc: { 'en' => 'What is your age?' },
            description_multiloc: { 'en' => 'Enter a number.' }
          )
        end
        let!(:page2) do
          create(
            :custom_field_page,
            resource: custom_form,
            key: 'about_your_cycling_habits',
            title_multiloc: { 'en' => 'About your cycling habits' },
            description_multiloc: { 'en' => 'Please indicate how you use <strong>a bike</strong>.' },
            page_layout: 'map'
          )
        end
        let!(:field_in_page2) do
          create(
            :custom_field,
            resource: custom_form,
            key: 'do_you_own_a_bike',
            title_multiloc: { 'en' => 'Do you own a bike?' },
            description_multiloc: { 'en' => 'Enter Yes or No.' }
          )
        end
        let!(:page3) do
          create(
            :custom_field_page,
            resource: custom_form,
            key: 'this_is_the_end_of_the_survey',
            title_multiloc: { 'en' => 'This is the end of the survey' },
            description_multiloc: { 'en' => 'Thank you for participating 🚀' }
          )
        end

        it 'has a category for each page, including the fixed survey end page' do
          expect(ui_schema['en']).to eq({
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: 'idea'
            },
            elements: [
              {
                type: 'Page',
                options: {
                  input_type: page1.input_type,
                  id: page1.id,
                  title: 'About you',
                  description: 'Please fill in some <strong>personal details</strong>.',
                  page_layout: 'default',
                  map_config_id: nil
                },
                elements: [{
                  type: 'Control',
                  scope: "#/properties/#{field_in_page1.key}",
                  label: 'What is your age?',
                  options: {
                    input_type: field_in_page1.input_type,
                    description: 'Enter a number.',
                    isAdminField: false,
                    hasRule: false,
                    transform: 'trim_on_blur'
                  }
                }]
              },
              {
                type: 'Page',
                options: {
                  input_type: page2.input_type,
                  id: page2.id,
                  title: 'About your cycling habits',
                  description: 'Please indicate how you use <strong>a bike</strong>.',
                  page_layout: 'map',
                  map_config_id: nil
                },
                elements: [{
                  type: 'Control',
                  scope: "#/properties/#{field_in_page2.key}",
                  label: 'Do you own a bike?',
                  options: {
                    input_type: field_in_page2.input_type,
                    description: 'Enter Yes or No.',
                    isAdminField: false,
                    hasRule: false,
                    transform: 'trim_on_blur'
                  }
                }]
              },
              {
                type: 'Page',
                options: {
                  input_type: page3.input_type,
                  id: page3.id,
                  title: 'This is the end of the survey',
                  description: 'Thank you for participating 🚀',
                  page_layout: 'default',
                  map_config_id: nil
                },
                elements: []
              },
              {
                type: 'Page',
                options: {
                  id: 'survey_end',
                  title: 'Almost done',
                  description: "You are about to submit your answers. By clicking 'Submit' you give us permission to analyse your answers.<br/>After you submit, you will no longer be able to go back and change any of your answers."
                },
                elements: []
              }
            ]
          })
        end
      end

      context 'for a native survey phase with pages and logic' do
        let(:project) { create(:single_phase_native_survey_project) }
        let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }
        let!(:page1) do
          create(
            :custom_field_page,
            resource: custom_form,
            key: 'page1',
            title_multiloc: { 'en' => '' },
            description_multiloc: { 'en' => '' }
          )
        end
        let!(:field_in_page1) do
          create(
            :custom_field,
            resource: custom_form,
            input_type: 'linear_scale',
            key: 'how_old_are_you',
            title_multiloc: { 'en' => 'Hold old are you?' },
            description_multiloc: { 'en' => '' },
            maximum: 7,
            logic: {
              rules: [
                {
                  if: 1,
                  goto_page_id: page3.id
                }
              ]
            }
          )
        end
        let!(:page2) do
          create(
            :custom_field_page,
            resource: custom_form,
            key: 'page2',
            title_multiloc: { 'en' => '' },
            description_multiloc: { 'en' => '' }
          )
        end
        let!(:field_in_page2) do
          create(
            :custom_field,
            resource: custom_form,
            input_type: 'select',
            key: 'how_often_do_you_choose_to_cycle',
            title_multiloc: { 'en' => 'When considering travel near your home, how often do you choose to CYCLE?' },
            description_multiloc: { 'en' => '' }
          )
        end
        let!(:every_day_option) do
          create(:custom_field_option, custom_field: field_in_page2, key: 'every_day', title_multiloc: { 'en' => 'Every day' })
        end
        let!(:never_option) do
          create(:custom_field_option, custom_field: field_in_page2, key: 'never', title_multiloc: { 'en' => 'Never' })
        end
        let!(:other_option) do
          create(:custom_field_option, custom_field: field_in_page2, key: 'other', other: true, title_multiloc: { 'en' => 'Other' })
        end
        let!(:page3) do
          create(
            :custom_field_page,
            resource: custom_form,
            key: 'page3',
            title_multiloc: { 'en' => '' },
            description_multiloc: { 'en' => '' }
          )
        end
        let!(:page4) do
          create(
            :custom_field_page,
            resource: custom_form,
            key: 'page4',
            title_multiloc: { 'en' => '' },
            description_multiloc: { 'en' => '' }
          )
        end

        before do
          field_in_page2.update!(logic: {
            rules: [
              {
                if: never_option.id,
                goto_page_id: page4.id
              }
            ]
          })
        end

        it 'includes rules for logic & other field for "other" option' do
          ui_schema = generator.generate_for [page1, field_in_page1, page2, field_in_page2, field_in_page2.other_option_text_field, page3]
          expect(ui_schema['en']).to eq({
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: 'idea'
            },
            elements: [
              {
                type: 'Page',
                options: {
                  input_type: page1.input_type,
                  id: page1.id,
                  title: '',
                  description: '',
                  page_layout: 'default',
                  map_config_id: nil
                },
                elements: [{
                  type: 'Control',
                  scope: "#/properties/#{field_in_page1.key}",
                  label: 'Hold old are you?',
                  options: {
                    input_type: field_in_page1.input_type,
                    description: '',
                    isAdminField: false,
                    hasRule: true,
                    linear_scale_label1: '',
                    linear_scale_label2: '',
                    linear_scale_label3: '',
                    linear_scale_label4: '',
                    linear_scale_label5: '',
                    linear_scale_label6: '',
                    linear_scale_label7: ''
                  }
                }]
              },
              {
                type: 'Page',
                options: {
                  input_type: page2.input_type,
                  id: page2.id,
                  title: '',
                  description: '',
                  page_layout: 'default',
                  map_config_id: nil
                },
                elements: [{
                  type: 'Control',
                  scope: "#/properties/#{field_in_page2.key}",
                  label: 'When considering travel near your home, how often do you choose to CYCLE?',
                  options: {
                    input_type: field_in_page2.input_type,
                    description: '',
                    dropdown_layout: false,
                    isAdminField: false,
                    hasRule: true,
                    enumNames: ['Every day', 'Never', 'Other'],
                    otherField: "#{field_in_page2.key}_other"
                  }
                }, {
                  type: 'Control',
                  scope: "#/properties/#{field_in_page2.key}_other",
                  label: 'Type your answer',
                  options: {
                    description: '',
                    hasRule: false,
                    input_type: 'text',
                    isAdminField: false,
                    transform: 'trim_on_blur'
                  }
                }],
                ruleArray: [
                  {
                    effect: 'HIDE',
                    condition: {
                      scope: "#/properties/#{field_in_page1.key}",
                      schema: {
                        enum: [1]
                      }
                    }
                  }
                ]
              },
              {
                type: 'Page',
                options: {
                  input_type: page3.input_type,
                  id: page3.id,
                  title: '',
                  description: '',
                  page_layout: 'default',
                  map_config_id: nil
                },
                elements: [],
                ruleArray: [
                  {
                    effect: 'HIDE',
                    condition: {
                      scope: "#/properties/#{field_in_page2.key}",
                      schema: {
                        enum: [never_option.key]
                      }
                    }
                  }
                ]
              },
              {
                type: 'Page',
                options: {
                  id: 'survey_end',
                  title: 'Almost done',
                  description: "You are about to submit your answers. By clicking 'Submit' you give us permission to analyse your answers.<br/>After you submit, you will no longer be able to go back and change any of your answers."
                },
                elements: []
              }
            ]
          })
        end
      end
    end
  end

  describe '#visit_text' do
    subject(:generator) { described_class.new input_term, false }

    let(:ui_schema) { generator.generate_for IdeaCustomFieldsService.new(custom_form).enabled_fields }
    let(:code) { nil }
    let(:field) do
      create(
        :custom_field,
        input_type: 'text',
        code: code,
        key: field_key,
        title_multiloc: { 'en' => 'Text field title' },
        description_multiloc: { 'en-CA' => 'Text field description' }
      )
    end

    context 'for author_id built-in field' do
      let(:field) { JsonFormsService::AUTHOR_FIELD }

      it 'returns the schema for the author_id field with isAdminField set to true' do
        expect(generator.visit_text(field)).to eq({
          type: 'Control',
          scope: '#/properties/author_id',
          label: 'Author',
          options: {
            input_type: field.input_type,
            description: '',
            transform: 'trim_on_blur',
            isAdminField: true,
            hasRule: false
          }
        })
      end
    end

    context 'for other fields' do
      it 'returns the schema for the given field with isAdminField set to false' do
        expect(generator.visit_text(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Text field title',
          options: {
            input_type: field.input_type,
            description: 'Text field description',
            transform: 'trim_on_blur',
            isAdminField: false,
            hasRule: false
          }
        })
      end
    end
  end

  describe '#visit_number' do
    subject(:generator) { described_class.new input_term, false }

    let(:ui_schema) { generator.generate_for IdeaCustomFieldsService.new(custom_form).enabled_fields }
    let(:code) { nil }
    let(:field) do
      create(
        :custom_field,
        input_type: 'number',
        code: code,
        key: field_key,
        title_multiloc: { 'en' => 'Number field title' },
        description_multiloc: { 'en' => 'Number field description' }
      )
    end

    context 'for budget built-in field' do
      let(:field) { JsonFormsService::BUDGET_FIELD }

      it 'returns the schema for the budget field with isAdminField set to true' do
        expect(generator.visit_number(field)).to eq({
          type: 'Control',
          scope: '#/properties/budget',
          label: 'Budget',
          options: {
            input_type: 'number',
            description: '',
            isAdminField: true,
            hasRule: false
          }
        })
      end
    end

    context 'for other fields' do
      it 'returns the schema for the given field with isAdminField set to false' do
        expect(generator.visit_number(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Number field title',
          options: {
            input_type: field.input_type,
            description: 'Number field description',
            isAdminField: false,
            hasRule: false
          }
        })
      end
    end
  end

  describe '#visit_html_multiloc' do
    subject(:generator) { described_class.new input_term, false }

    let(:ui_schema) { generator.generate_for IdeaCustomFieldsService.new(custom_form).enabled_fields }

    context 'when the code is body_multiloc' do
      let(:field) do
        create(
          :custom_field,
          input_type: 'html_multiloc',
          code: 'body_multiloc',
          key: field_key,
          title_multiloc: {
            'en' => 'Body multiloc field title',
            'nl-NL' => 'Body multiloc veldtitel'
            # No 'fr-FR' to describe that it will default to 'en'.
          },
          description_multiloc: {
            'en' => 'Body multiloc field description',
            'nl-NL' => 'Body multiloc veldbeschrijving'
            # No 'fr-FR' to describe that it will default to 'en'.
          }
        )
      end

      it 'returns the schema for the given built-in field with translations in the current locale' do
        I18n.with_locale('en') do
          expect(generator.visit_html_multiloc(field)).to eq({
            type: 'VerticalLayout',
            options: { input_type: field.input_type, render: 'multiloc' },
            elements: [
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/en",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'en'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/fr-FR",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'fr-FR'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/nl-NL",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'nl-NL'
                }
              }
            ]
          })
        end
        I18n.with_locale('fr-FR') do
          expect(generator.visit_html_multiloc(field)).to eq({
            type: 'VerticalLayout',
            options: { input_type: field.input_type, render: 'multiloc' },
            elements: [
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/en",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'en'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/fr-FR",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'fr-FR'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/nl-NL",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'nl-NL'
                }
              }
            ]
          })
        end
        I18n.with_locale('nl-NL') do
          expect(generator.visit_html_multiloc(field)).to eq({
            type: 'VerticalLayout',
            options: { input_type: field.input_type, render: 'multiloc' },
            elements: [
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/en",
                label: 'Body multiloc veldtitel',
                options: {
                  description: 'Body multiloc veldbeschrijving',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'en'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/fr-FR",
                label: 'Body multiloc veldtitel',
                options: {
                  description: 'Body multiloc veldbeschrijving',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'fr-FR'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/nl-NL",
                label: 'Body multiloc veldtitel',
                options: {
                  description: 'Body multiloc veldbeschrijving',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'nl-NL'
                }
              }
            ]
          })
        end
      end
    end

    context 'when the code is something else' do
      let(:field) do
        create(
          :custom_field,
          input_type: 'html_multiloc',
          key: field_key,
          title_multiloc: { 'en' => 'HTML multiloc field title' },
          description_multiloc: { 'en' => 'HTML multiloc field description' }
        )
      end

      it 'returns the schema for the given field' do
        expect(generator.visit_html_multiloc(field)).to eq({
          type: 'VerticalLayout',
          options: { input_type: field.input_type, render: 'multiloc' },
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/en",
              label: 'HTML multiloc field title',
              options: {
                description: 'HTML multiloc field description',
                isAdminField: false,
                hasRule: false,
                render: 'WYSIWYG',
                trim_on_blur: true,
                locale: 'en'
              }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/fr-FR",
              label: 'HTML multiloc field title',
              options: {
                description: 'HTML multiloc field description',
                isAdminField: false,
                hasRule: false,
                render: 'WYSIWYG',
                trim_on_blur: true,
                locale: 'fr-FR'
              }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/nl-NL",
              label: 'HTML multiloc field title',
              options: {
                description: 'HTML multiloc field description',
                isAdminField: false,
                hasRule: false,
                render: 'WYSIWYG',
                trim_on_blur: true,
                locale: 'nl-NL'
              }
            }
          ]
        })
      end
    end
  end

  describe '#visit_page' do
    subject(:generator) { described_class.new input_term, false }

    let(:ui_schema) { generator.generate_for IdeaCustomFieldsService.new(custom_form).enabled_fields }
    let(:field) do
      create(
        :custom_field_page,
        key: field_key,
        title_multiloc: { 'en' => 'Page field title' },
        description_multiloc: { 'en' => 'Page field description' }
      )
    end

    let!(:map_config) { create(:map_config, mappable: field) }

    it 'returns the schema for the given field, with id, and without elements' do
      expect(generator.visit_page(field)).to eq({
        type: 'Page',
        options: {
          input_type: field.input_type,
          id: field.id,
          title: 'Page field title',
          description: 'Page field description',
          page_layout: 'default',
          map_config_id: map_config.id
        },
        elements: []
      })
    end
  end
end

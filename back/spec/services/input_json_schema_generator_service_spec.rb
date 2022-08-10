# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputJsonSchemaGeneratorService do
  subject(:generator) { described_class.new }

  let(:field_key) { 'field_key' }

  describe '#visit_text_multiloc' do
    context 'when the code is title_multiloc' do
      let(:field) { create :custom_field, input_type: 'text_multiloc', code: 'title_multiloc', key: field_key }

      it 'returns the schema for the given built-in field' do
        expect(generator.visit_text_multiloc(field)).to eq({
          type: 'object',
          minProperties: 1,
          properties: {
            'en' => {
              type: 'string',
              minLength: 10,
              maxLength: 80
            },
            'fr-FR' => {
              type: 'string',
              minLength: 10,
              maxLength: 80
            },
            'nl-NL' => {
              type: 'string',
              minLength: 10,
              maxLength: 80
            }
          }
        })
      end
    end

    context 'when the code is something else' do
      let(:field) { create :custom_field, input_type: 'text_multiloc', key: field_key }

      it 'returns the schema for the given field' do
        expect(generator.visit_text_multiloc(field)).to eq({
          type: 'object',
          minProperties: 1,
          properties: {
            'en' => { type: 'string' },
            'fr-FR' => { type: 'string' },
            'nl-NL' => { type: 'string' }
          }
        })
      end
    end
  end

  describe '#visit_html_multiloc' do
    context 'when the code is body_multiloc' do
      let(:field) { create :custom_field, input_type: 'html_multiloc', code: 'body_multiloc', key: field_key }

      it 'returns the schema for the given built-in field' do
        expect(generator.visit_html_multiloc(field)).to eq({
          type: 'object',
          minProperties: 1,
          properties: {
            'en' => {
              type: 'string',
              minLength: 40
            },
            'fr-FR' => {
              type: 'string',
              minLength: 40
            },
            'nl-NL' => {
              type: 'string',
              minLength: 40
            }
          }
        })
      end
    end

    context 'when the code is something else' do
      let(:field) { create :custom_field, input_type: 'html_multiloc', key: field_key }

      it 'returns the schema for the given field' do
        expect(generator.visit_html_multiloc(field)).to eq({
          type: 'object',
          minProperties: 1,
          properties: {
            'en' => { type: 'string' },
            'fr-FR' => { type: 'string' },
            'nl-NL' => { type: 'string' }
          }
        })
      end
    end
  end

  describe '#visit_multiselect' do
    context 'when the code is topic_ids' do
      let :project do
        create(
          :project_with_allowed_input_topics,
          allowed_input_topics_count: allowed_input_topics_count
        )
      end
      let(:topics) { project.allowed_input_topics }
      let(:form) { create :custom_form, project: project }
      let :field do
        create(
          :custom_field_select,
          resource: form,
          code: 'topic_ids',
          input_type: 'multiselect',
          required: required,
          key: field_key
        )
      end

      context 'when not required, and without topics' do
        let(:required) { false }
        let(:allowed_input_topics_count) { 0 }
        let(:form) { create :custom_form }
        let :field do
          create(
            :custom_field_select,
            resource: form,
            code: 'topic_ids',
            input_type: 'multiselect',
            key: field_key
          )
        end

        it 'returns the schema for the given field' do
          expect(generator.visit_multiselect(field)).to eq({
            type: 'array',
            uniqueItems: true,
            minItems: 0,
            items: {
              type: 'string'
            }
          })
        end
      end

      context 'when not required, and with topics' do
        let(:required) { false }
        let(:allowed_input_topics_count) { 2 }

        it 'returns the schema for the given field' do
          expect(generator.visit_multiselect(field)).to match({
            type: 'array',
            uniqueItems: true,
            minItems: 0,
            items: {
              type: 'string',
              oneOf: [
                {
                  const: topics[0].id,
                  title: topics[0].title_multiloc['en']
                },
                {
                  const: topics[1].id,
                  title: topics[1].title_multiloc['en']
                }
              ]
            }
          })
        end
      end

      context 'when required, and with topics' do
        let(:required) { true }
        let(:allowed_input_topics_count) { 2 }

        it 'returns the schema for the given field' do
          expect(generator.visit_multiselect(field)).to eq({
            type: 'array',
            uniqueItems: true,
            minItems: 1,
            items: {
              type: 'string',
              oneOf: [
                {
                  const: topics[0].id,
                  title: topics[0].title_multiloc['en']
                },
                {
                  const: topics[1].id,
                  title: topics[1].title_multiloc['en']
                }
              ]
            }
          })
        end
      end
    end

    context 'when the code is something else' do
      context 'when not required, and without options' do
        let(:field) { create :custom_field_select, input_type: 'multiselect', key: field_key }

        it 'returns the schema for the given field' do
          expect(generator.visit_multiselect(field)).to eq({
            type: 'array',
            uniqueItems: true,
            minItems: 0,
            items: {
              type: 'string'
            }
          })
        end
      end

      context 'when not required, and with options' do
        let(:field) { create :custom_field_select, :with_options, input_type: 'multiselect', key: field_key }

        it 'returns the schema for the given field' do
          expect(generator.visit_multiselect(field)).to eq({
            type: 'array',
            uniqueItems: true,
            minItems: 0,
            items: {
              type: 'string',
              oneOf: [
                {
                  const: 'option1',
                  title: 'youth council'
                },
                {
                  const: 'option2',
                  title: 'youth council'
                }
              ]
            }
          })
        end
      end

      context 'when required, and with options' do
        let(:field) { create :custom_field_select, :with_options, input_type: 'multiselect', key: field_key, required: true }

        it 'returns the schema for the given field' do
          expect(generator.visit_multiselect(field)).to eq({
            type: 'array',
            uniqueItems: true,
            minItems: 1,
            items: {
              type: 'string',
              oneOf: [
                {
                  const: 'option1',
                  title: 'youth council'
                },
                {
                  const: 'option2',
                  title: 'youth council'
                }
              ]
            }
          })
        end
      end
    end
  end
end

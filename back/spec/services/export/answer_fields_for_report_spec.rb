# frozen_string_literal: true

require 'rails_helper'

describe Export::AnswerFieldsForReport do
  subject(:builder) { described_class.new(Export::Xlsx::ValueVisitor) }

  let(:form) { create(:custom_form) }

  describe '#fields_for' do
    context 'for a plain question' do
      let(:field) do
        create(:custom_field_text, resource: form, key: 'comment', title_multiloc: { 'en' => 'Comment' })
      end
      let(:input) { create(:idea, custom_field_values: { 'comment' => 'Nice one' }) }

      it 'returns a single field with the question header and answer value' do
        fields = builder.fields_for(field)

        expect(fields.size).to eq 1
        expect(fields.first.column_header).to eq 'Comment'
        expect(fields.first.value_from(input)).to eq 'Nice one'
      end
    end

    context 'for a matrix question' do
      let(:field) { create(:custom_field_matrix_linear_scale, resource: form) }
      let(:input) do
        create(:idea, custom_field_values: {
          field.key => { 'send_more_animals_to_space' => 3, 'ride_bicycles_more_often' => 5 }
        })
      end

      it 'returns one field per statement, reading the per-statement answer' do
        fields = builder.fields_for(field)

        expect(fields.size).to eq field.matrix_statements.size
        answers = fields.to_h { |f| [f.column_header, f.value_from(input)] }
        expect(answers).to eq(
          'We should send more animals into space' => 3,
          'We should ride our bicycles more often' => 5
        )
      end
    end

    context 'for a question with an "other" option' do
      let(:field) { create(:custom_field_select, :with_options, resource: form) }
      let(:input) do
        create(:idea, custom_field_values: { field.key => 'other', "#{field.key}_other" => 'Something else' })
      end

      before do
        create(:custom_field_option, custom_field: field, key: 'other', title_multiloc: { 'en' => 'Other' }, other: true)
        field.options.reload
      end

      it 'appends the "other" free-text answer field' do
        fields = builder.fields_for(field)

        expect(fields.size).to eq 2
        expect(fields.last.value_from(input)).to eq 'Something else'
      end
    end

    context 'for a user/registration field' do
      # `custom_field` defaults to a registration (resource_type User) field.
      let(:field) { create(:custom_field, key: 'residence', title_multiloc: { 'en' => 'Residence' }) }
      let(:author) { create(:user, custom_field_values: { 'residence' => 'Manchester' }) }
      let(:input) { create(:idea, author: author) }

      it 'returns a single field read from the author profile' do
        fields = builder.fields_for(field)

        expect(fields.size).to eq 1
        expect(fields.first.value_from(input)).to eq 'Manchester'
      end
    end

    context 'for a question with a follow-up' do
      let(:field) { create(:custom_field_select, :with_options, resource: form, ask_follow_up: true) }
      let(:input) do
        create(:idea, custom_field_values: { field.key => 'option1', "#{field.key}_follow_up" => 'Because reasons' })
      end

      it 'appends the follow-up free-text answer field' do
        fields = builder.fields_for(field)

        expect(fields.size).to eq 2
        expect(fields.last.value_from(input)).to eq 'Because reasons'
      end
    end
  end
end

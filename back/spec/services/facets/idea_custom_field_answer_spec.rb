# frozen_string_literal: true

require 'rails_helper'

describe Facets::IdeaCustomFieldAnswer do
  describe '#counts' do
    let(:project) { create(:single_phase_ideation_project) }
    let(:form) { create(:custom_form, participation_context: project) }

    def create_idea_with_answer(field, value, **attributes)
      create(
        :idea,
        project:,
        custom_field_answers: [build(:custom_field_answer, key: field.key, value:)],
        **attributes
      )
    end

    context 'with a single choice question' do
      let(:field) { create(:custom_field_select, :with_options, resource: form) }

      it 'counts the ideas per chosen option' do
        create_idea_with_answer(field, 'option1')
        create_idea_with_answer(field, 'option1')
        create_idea_with_answer(field, 'option2')

        expect(described_class.new(field).counts(Idea.all)).to eq({
          field.id => { 'option1' => 2, 'option2' => 1 }
        })
      end

      it 'only counts the ideas in the scope' do
        create_idea_with_answer(field, 'option1')
        create_idea_with_answer(field, 'option2', publication_status: 'draft')

        expect(described_class.new(field).counts(Idea.published)).to eq({
          field.id => { 'option1' => 1 }
        })
      end

      it 'ignores the answers of users under the same key' do
        create(:user, custom_field_answers: [build(:custom_field_answer, key: field.key, value: 'option1')])

        expect(described_class.new(field).counts(Idea.all)).to eq({ field.id => {} })
      end
    end

    context 'with a multiple choice question' do
      let(:field) { create(:custom_field_multiselect, :with_options, resource: form) }

      it 'counts an idea under each of its chosen options' do
        create_idea_with_answer(field, %w[option1 option2])
        create_idea_with_answer(field, %w[option2])

        expect(described_class.new(field).counts(Idea.all)).to eq({
          field.id => { 'option1' => 1, 'option2' => 2 }
        })
      end
    end
  end
end

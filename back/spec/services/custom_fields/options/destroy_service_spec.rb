# frozen_string_literal: true

require 'rails_helper'

describe CustomFields::Options::DestroyService do
  let(:service) { described_class.new }
  let(:current_user) { create(:user) }

  describe '#destroy!' do
    context 'when deleting a custom-form field option that has the same key as a user field option' do
      let(:custom_field) { create(:custom_field, :for_custom_form, input_type: 'select') }
      let(:option) { create(:custom_field_option, custom_field: custom_field, key: 'same-option-key') }
      let!(:user) { create(:user, custom_field_answers: [build(:custom_field_answer, key: custom_field.key, value: 'same-option-key')]) }

      it 'does not update the custom field value of users' do
        service.destroy!(option, current_user)
        expect(user.reload.custom_field_answers.pluck(:key, :value)).to eq [[custom_field.key, 'same-option-key']]
      end
    end

    context 'when custom field option that is a survey logic option is destroyed' do
      let(:custom_field1) { create(:custom_field, :for_custom_form, input_type: 'select') }
      let(:custom_field2) { create(:custom_field, :for_custom_form, input_type: 'page', page_layout: 'default') }
      let(:custom_field3) { create(:custom_field, :for_custom_form, input_type: 'page', page_layout: 'default') }
      let(:option1) { create(:custom_field_option, custom_field: custom_field1, key: 'option_1') }
      let(:option2) { create(:custom_field_option, custom_field: custom_field1, key: 'option_2') }
      let(:logic) do
        { rules: [
          { if: option1.id, goto_page_id: custom_field2.id },
          { if: option2.id, goto_page_id: custom_field3.id }
        ] }
      end

      before do
        custom_field1.update!(logic: logic)
      end

      it 'removes the logic option from custom fields that contain it' do
        service.destroy!(option1, current_user)

        expect(custom_field1.reload.logic['rules'].count).to eq 1
        expect(custom_field1.reload.logic['rules'].pluck('if')).to eq [option2.id]
      end
    end

    context 'when an option with logic of a ranking field is destroyed' do
      let(:ranking_field) { create(:custom_field_ranking, :with_options, :for_custom_form) }
      let(:option) { ranking_field.options.first }
      let(:page) { create(:custom_field_page, resource: ranking_field.resource) }

      before { ranking_field.update!(logic: { rules: [{ if: option.id, goto_page_id: page.id }] }) }

      it 'leaves the rule of the deleted option in place (current behaviour)' do
        service.destroy!(option, current_user)

        expect(ranking_field.reload.logic['rules'].pluck('if')).to eq [option.id]
      end
    end

    context 'when the last option with a rule of a select is destroyed' do
      let(:select_field) { create(:custom_field_select, :with_options, :for_custom_form) }
      let(:option) { select_field.options.first }
      let(:page) { create(:custom_field_page, resource: select_field.resource) }

      before { select_field.update!(logic: { rules: [{ if: option.id, goto_page_id: page.id }, { if: 'any_other_answer', goto_page_id: page.id }] }) }

      it 'keeps the catch-all rules' do
        service.destroy!(option, current_user)

        expect(select_field.reload.logic).to eq('rules' => [{ 'if' => 'any_other_answer', 'goto_page_id' => page.id }])
      end
    end

    context 'when deleting a select custom-form field option' do
      let(:field) { create(:custom_field_select, :with_options, :for_custom_form) }
      let!(:idea) { create(:idea, custom_field_answers: [build(:custom_field_answer, key: field.key, value: 'option1')]) }

      it 'does not update the custom field values of ideas' do
        service.destroy!(field.options.find_by(key: 'option1'), current_user)
        expect(idea.reload.custom_field_answers.pluck(:key, :value)).to eq [[field.key, 'option1']]
      end
    end

    context 'when deleting a multiselect custom-form field option' do
      let(:field) { create(:custom_field_multiselect, :with_options, :for_custom_form) }
      let!(:idea) { create(:idea, custom_field_answers: [build(:custom_field_answer, key: field.key, value: %w[option1 option2])]) }

      it 'does not update the custom field values of ideas' do
        service.destroy!(field.options.find_by(key: 'option1'), current_user)
        expect(idea.reload.custom_field_answers.pluck(:key, :value)).to eq [[field.key, %w[option1 option2]]]
      end
    end

    context 'when deleting a user field option' do
      let(:field) { create(:custom_field_select) }
      let(:option) { create(:custom_field_option, custom_field: field, key: 'option1') }
      let!(:user) { create(:user, custom_field_answers: [build(:custom_field_answer, key: field.key, value: 'option1')]) }

      it 'deletes the option from the custom field values of users' do
        service.destroy!(option, current_user)
        expect(user.reload.custom_field_answers).to be_empty
      end
    end

    context 'when deleting a ranking custom-form field option' do
      let(:ranking_cf) { create(:custom_field_ranking, :with_options, :for_custom_form) }
      let(:another_cf) { create(:custom_field_select, :with_options, :for_custom_form) }
      let!(:idea) do
        create(:idea, custom_field_answers: [
          build(:custom_field_answer, key: ranking_cf.key, value: ranking_cf.options.map(&:key)),
          build(:custom_field_answer, key: another_cf.key, value: another_cf.options.first.key)
        ])
      end

      it 'removes the option from the custom field values of ideas' do
        option = ranking_cf.options.first

        service.destroy!(option, current_user)

        answers = idea.reload.custom_field_answers.index_by(&:key)
        expect(answers[ranking_cf.key].value).to eq(ranking_cf.options.map(&:key) - [option.key])
        expect(answers[another_cf.key].value).to eq another_cf.options.first.key
      end
    end
  end
end

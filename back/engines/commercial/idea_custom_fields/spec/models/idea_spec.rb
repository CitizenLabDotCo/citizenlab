# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Idea, type: :model do
  context 'with custom fields' do
    let(:project) { create(:project) }
    let(:form) { create(:custom_form, participation_context: project) }
    let!(:required_field) { create(:custom_field, :for_custom_form, resource: form, required: true, input_type: 'number') }
    let!(:optional_field) { create(:custom_field_select, :with_options, :for_custom_form, resource: form, required: false) }
    let!(:disabled_field) { create(:custom_field, :for_custom_form, resource: form, enabled: false, required: false, input_type: 'text') }

    context 'when creating ideas' do
      let(:idea) { build(:idea, project: project) }

      context 'on create' do
        it 'can persist an idea' do
          idea.custom_field_values = { required_field.key => 63, optional_field.key => 'option1' }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea without optional fields' do
          idea.custom_field_values = { required_field.key => 7 }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea with a non-existing field' do
          idea.custom_field_values = { required_field.key => 15, 'nonexisting_field' => 22 }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea without required field values' do
          idea.custom_field_values = { optional_field.key => 'option1' }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea with non-existing field options' do
          idea.custom_field_values = { required_field.key => 15, optional_field.key => 'non-existing-option' }
          expect(idea.valid?(:create)).to be true
        end

        it 'can persist an idea with disabled field values' do
          idea.custom_field_values = { required_field.key => 15, disabled_field.key => 'my value' }
          expect(idea.valid?(:create)).to be true
        end
      end

      context 'on publication' do
        it 'can persist an idea' do
          idea.custom_field_values = { required_field.key => 63, optional_field.key => 'option1' }
          expect(idea.valid?(:publication)).to be true
        end

        it 'can persist an idea without optional fields' do
          idea.custom_field_values = { required_field.key => 7 }
          expect(idea.valid?(:publication)).to be true
        end

        it 'cannot persist an idea with a non-existing field', skip: 'Cannot be implemented yet' do
          non_existing_key = 'nonexisting_field'
          idea.custom_field_values = { required_field.key => 15, non_existing_key => 22 }
          expect(idea.valid?(:publication)).to be false
          expect(idea.errors.details.to_h).to match(
            custom_field_values: [{
              error: start_with("The property '#/' contains additional properties [\"#{non_existing_key}\"] outside of the schema when none are allowed in schema"),
              value: { required_field.key => 15, non_existing_key => 22 }
            }]
          )
        end

        it 'cannot persist an idea with an invalid field value' do
          idea.proposed_budget = -1
          idea.custom_field_values = { required_field.key => 80 }
          expect(idea.valid?(:publication)).to be false
          expect(idea.errors.details).to eq({
            proposed_budget: [{ error: :greater_than_or_equal_to, value: -1, count: 0 }]
          })
        end

        it 'cannot persist an idea without required field values', skip: 'Cannot be implemented yet' do
          idea.custom_field_values = { optional_field.key => 'option1' }
          expect(idea.valid?(:publication)).to be false
          expect(idea.errors.details.to_h).to match(
            custom_field_values: [{
              error: start_with("The property '#/' did not contain a required property of '#{required_field.key}' in schema"),
              value: { optional_field.key => 'option1' } # No value present for required_field.key, because it was not given.
            }]
          )
        end

        it 'cannot persist an idea with non-existing field options', skip: 'Cannot be implemented yet' do
          non_existing_option = 'non-existing-option'
          idea.custom_field_values = { required_field.key => 15, optional_field.key => non_existing_option }
          expect(idea.valid?(:publication)).to be false
          expect(idea.errors.details.to_h).to match(
            custom_field_values: [{
              error: start_with("The property '#/#{optional_field.key}' value \"#{non_existing_option}\" did not match one of the following values: option1, option2 in schema"),
              value: { required_field.key => 15, optional_field.key => non_existing_option }
            }]
          )
        end

        it 'cannot persist an idea with disabled field values', skip: 'Cannot be implemented yet' do
          value_for_disabled_field = 'my value'
          idea.custom_field_values = { required_field.key => 15, disabled_field.key => value_for_disabled_field }
          expect(idea.valid?(:publication)).to be false
          expect(idea.errors.details.to_h).to match(
            custom_field_values: [{
              error: start_with("The property '#/' contains additional properties [\"#{disabled_field.key}\"] outside of the schema when none are allowed in schema"),
              value: { required_field.key => 15, disabled_field.key => value_for_disabled_field }
            }]
          )
        end
      end

      it 'can persist a draft idea without required field values' do
        idea.publication_status = 'draft'
        expect(idea.save).to be true
      end
    end

    context 'when updating ideas' do
      let(:idea) { create(:idea, project: project, custom_field_values: { required_field.key => 1 }) }

      %i[update publication].each do |validation_context|
        context "on #{validation_context}" do
          it 'can persist an idea' do
            idea.custom_field_values = { required_field.key => 63, optional_field.key => 'option1' }
            expect(idea.valid?(validation_context)).to be true
          end

          it 'can persist an idea without optional fields' do
            idea.custom_field_values = { required_field.key => 7 }
            expect(idea.valid?(validation_context)).to be true
          end

          it 'cannot persist an idea with a non-existing field', skip: 'Cannot be implemented yet' do
            non_existing_key = 'nonexisting_field'
            idea.custom_field_values = { required_field.key => 15, non_existing_key => 22 }
            expect(idea.valid?(validation_context)).to be false
            expect(idea.errors.details.to_h).to match(
              custom_field_values: [{
                error: start_with("The property '#/' contains additional properties [\"#{non_existing_key}\"] outside of the schema when none are allowed in schema"),
                value: { required_field.key => 15, non_existing_key => 22 }
              }]
            )
          end

          it 'cannot persist an idea with an invalid field value' do
            idea.proposed_budget = -1
            idea.custom_field_values = { required_field.key => 80 }
            expect(idea.valid?(validation_context)).to be false
            expect(idea.errors.details).to eq({
              proposed_budget: [{ error: :greater_than_or_equal_to, value: -1, count: 0 }]
            })
          end

          it 'cannot persist an idea without required field values', skip: 'Cannot be implemented yet' do
            idea.custom_field_values = { optional_field.key => 'option1' }
            expect(idea.valid?(validation_context)).to be false
            expect(idea.errors.details.to_h).to match(
              custom_field_values: [{
                error: start_with("The property '#/' did not contain a required property of '#{required_field.key}' in schema"),
                value: { optional_field.key => 'option1' } # No value present for required_field.key, because it was not given.
              }]
            )
          end

          it 'cannot persist an idea with non-existing field options', skip: 'Cannot be implemented yet' do
            non_existing_option = 'non-existing-option'
            idea.custom_field_values = { required_field.key => 15, optional_field.key => non_existing_option }
            expect(idea.valid?(validation_context)).to be false
            expect(idea.errors.details.to_h).to match(
              custom_field_values: [{
                error: start_with("The property '#/#{optional_field.key}' value \"#{non_existing_option}\" did not match one of the following values: option1, option2 in schema"),
                value: { required_field.key => 15, optional_field.key => non_existing_option }
              }]
            )
          end

          it 'cannot persist an idea with disabled field values', skip: 'Cannot be implemented yet' do
            value_for_disabled_field = 'my value'
            idea.custom_field_values = { required_field.key => 15, disabled_field.key => value_for_disabled_field }
            expect(idea.valid?(validation_context)).to be false
            expect(idea.errors.details.to_h).to match(
              custom_field_values: [{
                error: start_with("The property '#/' contains additional properties [\"#{disabled_field.key}\"] outside of the schema when none are allowed in schema"),
                value: { required_field.key => 15, disabled_field.key => value_for_disabled_field }
              }]
            )
          end
        end
      end

      it 'can persist other attributes of an idea with unchanged invalid custom field values' do
        idea.update!(custom_field_values: { required_field.key => 7 })
        optional_field.update! required: true
        idea.reload
        idea.author = create(:user)
        expect(idea.save).to be true
        # Make a valid change to the field values to trigger the custom field values validation,
        # because the validation is only performed if `custom_field_values` changes.
        idea.custom_field_values[optional_field.key] = 'option1'
        expect(idea.valid?).to be true
      end

      it 'cannot persist other attributes of an idea with unchanged invalid custom field values when publishing',
        skip: 'Cannot be implemented yet' do
        idea.update!(custom_field_values: { required_field.key => 7 })
        optional_field.update! required: true
        idea.reload
        idea.title_multiloc = { 'en' => 'Updated idea title' }
        expect(idea.save(context: :publication)).to be false
        expect(idea.errors.details.to_h).to match(
          custom_field_values: [{
            error: start_with("The property '#/' did not contain a required property of '#{optional_field.key}' in schema"),
            value: { required_field.key => 7 } # No value present for optional_field.key, because it was not given.
          }]
        )
      end

      it 'can persist an idea without disabled required field values' do
        disabled_field.update! required: true
        idea.custom_field_values = { required_field.key => 39 }
        expect(idea.save).to be true
      end
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldAnswerService do
  describe 'syncing on save' do
    let!(:field) { create(:custom_field, key: 'pet') }

    it 'creates answers when custom_field_values is written, without a custom field for unknown keys' do
      user = create(:user, custom_field_values: { 'pet' => 'cat', 'unknown_key' => 'x' })

      answers = user.custom_field_answers.index_by(&:key)
      expect(answers['pet']).to have_attributes(custom_field_id: field.id, value: 'cat')
      expect(answers['unknown_key']).to have_attributes(custom_field_id: nil, value: 'x')
    end

    it 'links _other and _follow_up companion keys to their parent field' do
      user = create(:user, custom_field_values: { 'pet' => 'other', 'pet_other' => 'A ferret' })

      expect(user.custom_field_answers.find_by(key: 'pet_other'))
        .to have_attributes(custom_field_id: field.id, value: 'A ferret')
    end

    it 'updates and deletes answers when custom_field_values changes' do
      user = create(:user, custom_field_values: { 'pet' => 'cat', 'city' => 'Ghent' })
      expect(user.custom_field_answers.pluck(:key, :value)).to contain_exactly(%w[pet cat], %w[city Ghent])

      user.update!(custom_field_values: { 'pet' => 'dog' })
      expect(user.custom_field_answers.pluck(:key, :value)).to eq [%w[pet dog]]
    end

    it 'deletes all answers when custom_field_values is cleared' do
      user = create(:user, custom_field_values: { 'pet' => 'cat' })
      expect(user.custom_field_answers.pluck(:key, :value)).to eq [%w[pet cat]]

      user.update!(custom_field_values: {})
      expect(user.custom_field_answers).to be_empty
    end

    it 'stores false answers and skips nil answers' do
      user = create(:user, custom_field_values: { 'pet' => nil, 'attends' => false })

      expect(user.custom_field_answers.pluck(:key, :value)).to eq [['attends', false]]
    end

    it 'stores keys and values as jsonb serializes them' do
      user = create(:user, custom_field_values: { pet: :cat })

      expect(user.custom_field_answers.pluck(:key, :value)).to eq [%w[pet cat]]
    end

    it 'does not run when a save does not change custom_field_values' do
      user = create(:user, custom_field_values: { 'pet' => 'cat' })

      expect(described_class).not_to receive(:new)
      user.update!(first_name: 'Jane')
    end

    it 'resolves idea keys against the form fields and u_ keys against registration fields' do
      project = create(:project)
      form = create(:custom_form, participation_context: project)
      form_field = create(:custom_field, resource: form, key: 'pet')
      idea = create(:idea, project: project, custom_field_values: {
        'pet' => 'cat', 'pet_follow_up' => 'why', 'u_pet' => 'dog', 'u_pet_other' => 'A hamster', 'u_unknown' => 'x'
      })

      answers = idea.custom_field_answers.index_by(&:key)
      expect(answers['pet']).to have_attributes(custom_field_id: form_field.id, value: 'cat')
      expect(answers['pet_follow_up']).to have_attributes(custom_field_id: form_field.id, value: 'why')
      expect(answers['u_pet']).to have_attributes(custom_field_id: field.id, value: 'dog')
      expect(answers['u_pet_other']).to have_attributes(custom_field_id: field.id, value: 'A hamster')
      expect(answers['u_unknown']).to have_attributes(custom_field_id: nil, value: 'x')
    end
  end

  describe '#sync!' do
    it 'repairs answers after a write that bypassed the callback' do
      user = create(:user, custom_field_values: { 'pet' => 'cat', 'city' => 'Ghent' })
      user.update_column(:custom_field_values, { 'pet' => 'dog', 'age' => 42 })
      expect(user.custom_field_answers.pluck(:key, :value)).to contain_exactly(%w[pet cat], %w[city Ghent])

      described_class.new.sync!(user)

      expect(user.custom_field_answers.pluck(:key, :value)).to contain_exactly(%w[pet dog], ['age', 42])
    end
  end
end

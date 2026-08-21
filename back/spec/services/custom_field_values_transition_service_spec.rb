# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldValuesTransitionService do
  let(:service) { described_class.new }
  let!(:field) { create(:custom_field, key: 'pet') }

  describe '#assign' do
    it 'stages answers in-memory, persisted by the record save, without a custom field for unknown keys' do
      user = build(:user)
      service.assign(user, { 'pet' => 'cat', 'unknown_key' => 'x' })
      expect(CustomFieldAnswer.count).to eq 0

      user.save!
      answers = user.custom_field_answers.index_by(&:key)
      expect(answers['pet']).to have_attributes(custom_field_id: field.id, value: 'cat')
      expect(answers['unknown_key']).to have_attributes(custom_field_id: nil, value: 'x')
    end

    it 'links _other and _follow_up companion keys to their parent field' do
      user = build(:user)
      service.assign(user, { 'pet' => 'other', 'pet_other' => 'A ferret' })
      user.save!

      expect(user.custom_field_answers.find_by(key: 'pet_other'))
        .to have_attributes(custom_field_id: field.id, value: 'A ferret')
    end

    it 'updates and deletes existing answers' do
      user = create(:user)
      service.assign(user, { 'pet' => 'cat', 'city' => 'Ghent' })
      user.save!
      expect(user.custom_field_answers.pluck(:key, :value)).to contain_exactly(%w[pet cat], %w[city Ghent])

      service.assign(user, { 'pet' => 'dog' })
      user.save!
      expect(user.custom_field_answers.pluck(:key, :value)).to eq [%w[pet dog]]
    end

    it 'deletes all answers when assigning empty values' do
      user = create(:user)
      service.assign(user, { 'pet' => 'cat' })
      user.save!

      service.assign(user, {})
      user.save!
      expect(user.custom_field_answers).to be_empty
    end

    it 'stores false answers and skips nil answers' do
      user = create(:user)
      service.assign(user, { 'pet' => nil, 'attends' => false })
      user.save!

      expect(user.custom_field_answers.pluck(:key, :value)).to eq [['attends', false]]
    end

    it 'stores keys and values as JSON serializes them' do
      user = create(:user)
      service.assign(user, { pet: :cat })
      user.save!

      expect(user.custom_field_answers.pluck(:key, :value)).to eq [%w[pet cat]]
    end

    it 'resolves idea keys against the form fields and u_ keys against registration fields' do
      project = create(:project)
      form = create(:custom_form, participation_context: project)
      form_field = create(:custom_field, resource: form, key: 'pet')
      idea = create(:idea, project: project)
      service.assign(idea, {
        'pet' => 'cat', 'pet_follow_up' => 'why', 'u_pet' => 'dog', 'u_pet_other' => 'A hamster', 'u_unknown' => 'x'
      })
      idea.save!

      answers = idea.custom_field_answers.index_by(&:key)
      expect(answers['pet']).to have_attributes(custom_field_id: form_field.id, value: 'cat')
      expect(answers['pet_follow_up']).to have_attributes(custom_field_id: form_field.id, value: 'why')
      expect(answers['u_pet']).to have_attributes(custom_field_id: field.id, value: 'dog')
      expect(answers['u_pet_other']).to have_attributes(custom_field_id: field.id, value: 'A hamster')
      expect(answers['u_unknown']).to have_attributes(custom_field_id: nil, value: 'x')
    end
  end
end

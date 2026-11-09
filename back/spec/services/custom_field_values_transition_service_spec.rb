# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldValuesTransitionService do
  let(:service) { described_class.new }
  let!(:field) { create(:custom_field, key: 'pet') }

  describe '#assign' do
    it 'stages answers in-memory, persisted by the record save' do
      user = build(:user)
      service.assign(user, { 'pet' => 'cat' })
      expect(CustomFieldAnswer.count).to eq 0

      user.save!
      expect(user.custom_field_answers.first).to have_attributes(custom_field_id: field.id, value: 'cat')
    end

    it 'refuses a key that resolves to no field' do
      user = build(:user)

      expect { service.assign(user, { 'pet' => 'cat', 'unknown_key' => 'x' }) }
        .to raise_error(ArgumentError, /unknown_key/)
      expect(user.custom_field_answers).to be_empty
    end

    it "normalizes values through the field's input type" do
      create(:custom_field_point, resource_type: 'User', key: 'location')
      user = build(:user)
      service.assign(user, { 'location' => 'POINT (4.31 50.85)' })

      expect(user.answer_for_key('location').value).to eq('type' => 'Point', 'coordinates' => [4.31, 50.85])
    end

    it 'links _other and _follow_up companion keys to their parent field' do
      user = build(:user)
      service.assign(user, { 'pet' => 'other', 'pet_other' => 'A ferret' })
      user.save!

      expect(user.custom_field_answers.find_by(key: 'pet_other'))
        .to have_attributes(custom_field_id: field.id, value: 'A ferret')
    end

    it 'updates and deletes existing answers' do
      create(:custom_field, key: 'city')
      user = create(:user)
      service.assign(user, { 'pet' => 'cat', 'city' => 'Ghent' })
      user.save!
      expect(user.custom_field_answers.pluck(:key, :value)).to contain_exactly(%w[pet cat], %w[city Ghent])

      service.assign(user, { 'pet' => 'dog' })
      user.save!
      expect(user.custom_field_answers.pluck(:key, :value)).to eq [%w[pet dog]]
    end

    it 'keeps the field of an existing answer whose key no longer resolves' do
      source_project = create(:project)
      source_form = create(:custom_form, participation_context: source_project)
      source_field = create(:custom_field, resource: source_form, key: 'only_here')
      idea = create(:idea, project: source_project)
      idea.custom_field_answers.create!(key: 'only_here', value: 'kept', custom_field: source_field)

      idea.project = create(:project)
      service.assign(idea, { 'only_here' => 'refreshed' })

      expect(idea.answer_for_key('only_here'))
        .to have_attributes(value: 'refreshed', custom_field_id: source_field.id)
    end

    it 'relinks an existing answer when its key resolves to another field' do
      source_project = create(:project)
      source_form = create(:custom_form, participation_context: source_project)
      source_field = create(:custom_field, resource: source_form, key: 'shared')
      idea = create(:idea, project: source_project)
      idea.custom_field_answers.create!(key: 'shared', value: 'kept', custom_field: source_field)
      destination_project = create(:project)
      destination_form = create(:custom_form, participation_context: destination_project)
      destination_field = create(:custom_field, resource: destination_form, key: 'shared')

      idea.project = destination_project
      service.assign(idea, { 'shared' => 'kept' })

      expect(idea.answer_for_key('shared').custom_field_id).to eq destination_field.id
    end

    it 'still updates an existing answer that has no field' do
      user = create(:user)
      user.custom_field_answers.create!(key: 'retired', value: 'x')

      service.assign(user, { 'retired' => 'y' })

      expect(user.answer_for_key('retired')).to have_attributes(value: 'y', custom_field_id: nil)
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
      create(:custom_field_checkbox, resource_type: 'User', key: 'attends')
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
        'pet' => 'cat', 'pet_follow_up' => 'why', 'u_pet' => 'dog', 'u_pet_other' => 'A hamster'
      })
      idea.save!

      answers = idea.custom_field_answers.index_by(&:key)
      expect(answers['pet']).to have_attributes(custom_field_id: form_field.id, value: 'cat')
      expect(answers['pet_follow_up']).to have_attributes(custom_field_id: form_field.id, value: 'why')
      expect(answers['u_pet']).to have_attributes(custom_field_id: field.id, value: 'dog')
      expect(answers['u_pet_other']).to have_attributes(custom_field_id: field.id, value: 'A hamster')
    end
  end

  describe '#custom_field_values' do
    it 'returns the answers as a hash, without the answers marked for destruction' do
      user = build(:user, custom_field_answers: [
        build(:custom_field_answer, key: 'kept', value: 'yes'),
        build(:custom_field_answer, key: 'gone', value: 'no').tap(&:mark_for_destruction)
      ])

      expect(service.custom_field_values(user)).to eq('kept' => 'yes')
    end

    it 'returns an empty hash without a record' do
      expect(service.custom_field_values(nil)).to eq({})
    end
  end
end

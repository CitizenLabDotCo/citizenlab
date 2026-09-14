# frozen_string_literal: true

require 'rails_helper'

describe CustomFieldService do
  let(:service) { described_class.new }

  describe 'cleanup_custom_field_values!' do
    let(:field_values) { { 'key1' => nil, 'key2' => '', 'key3' => 'Not blank', 'key4' => true, 'key5' => false } }

    it 'destructively deletes keys with blank values from the argument and returns the argument' do
      cleaned_values = service.compact_custom_field_values! field_values
      expect(field_values).to eq({ 'key3' => 'Not blank', 'key4' => true, 'key5' => false })
      expect(cleaned_values).to be field_values
    end
  end

  describe 'delete_custom_field_values' do
    it 'deletes the custom field values from all users' do
      cf1 = create(:custom_field)
      cf2 = create(:custom_field)
      create_list(:user, 5, custom_field_values: { cf1.key => 'some_value', cf2.key => 'other_value' })
      create_list(:user, 5)
      service.delete_custom_field_values(cf1)
      expect(User.all.map { |u| u.custom_field_values.keys }.flatten).to include(cf2.key)
      expect(User.all.map { |u| u.custom_field_values.keys }.flatten).not_to include(cf1.key)
      expect(CustomFieldAnswer.where(key: cf1.key)).not_to exist
      expect(CustomFieldAnswer.where(key: cf2.key).count).to eq 5
    end

    it 'deletes the values that a user field stored on inputs through user fields in form' do
      field = create(:custom_field, key: 'the_field')
      user = create(:user, custom_field_values: { 'the_field' => 'other', 'the_field_other' => 'gone' })
      input = create(:idea, custom_field_values: { 'u_the_field' => 'other', 'u_the_field_other' => 'gone', 'other_field' => 'stays' })

      service.delete_custom_field_values(field)

      expect(user.reload.custom_field_values).to eq({})
      expect(input.reload.custom_field_values).to eq({ 'other_field' => 'stays' })
      expect(user.custom_field_answers).to be_empty
      expect(input.custom_field_answers.pluck(:key)).to eq ['other_field']
    end

    it 'deletes the values of a phase-level form field from the inputs of its phase' do
      phase = create(:single_phase_native_survey_project).phases.first
      form = create(:custom_form, participation_context: phase)
      field = create(:custom_field_text, resource: form, key: 'extra_field')
      input = create(
        :idea,
        project: phase.project,
        creation_phase: phase,
        custom_field_values: { 'extra_field' => 'gone', 'extra_field_follow_up' => 'gone', 'another_field' => 'stays' }
      )

      service.delete_custom_field_values(field)

      expect(input.reload.custom_field_values).to eq({ 'another_field' => 'stays' })
      expect(input.custom_field_answers.pluck(:key)).to eq ['another_field']
    end

    it 'does not delete values of inputs in other participation contexts with the same field key' do
      other_phase = create(:single_phase_native_survey_project).phases.first
      create(:custom_form, participation_context: other_phase)
      other_input = create(
        :idea,
        project: other_phase.project,
        creation_phase: other_phase,
        custom_field_values: { 'extra_field' => 'stays' }
      )

      phase = create(:single_phase_native_survey_project).phases.first
      form = create(:custom_form, participation_context: phase)
      field = create(:custom_field_text, resource: form, key: 'extra_field')

      service.delete_custom_field_values(field)

      expect(other_input.reload.custom_field_values).to eq({ 'extra_field' => 'stays' })
      expect(other_input.custom_field_answers.pluck(:key, :value)).to eq [%w[extra_field stays]]
    end
  end

  describe 'delete_custom_field_option_values' do
    it 'deletes the custom field option values from all users for a multiselect' do
      cf1 = create(:custom_field_multiselect)
      cfo1 = create(:custom_field_option, custom_field: cf1)
      cfo2 = create(:custom_field_option, custom_field: cf1)
      cf2 = create(:custom_field_select)
      cfo3 = create(:custom_field_option, custom_field: cf2)
      v1 = { cf1.key => [cfo1.key], cf2.key => cfo3.key }
      u1 = create(:user, custom_field_values: v1)
      v2 = { cf1.key => [cfo1.key, cfo2.key] }
      u2 = create(:user, custom_field_values: v2)
      v3 = { cf1.key => [cfo2.key] }
      u3 = create(:user, custom_field_values: v3)

      service.delete_custom_field_option_values(cfo1.key, cfo1.custom_field)

      expect(u1.reload.custom_field_values).to eq({ cf2.key => cfo3.key })
      expect(u2.reload.custom_field_values).to eq({ cf1.key => [cfo2.key] })
      expect(u3.reload.custom_field_values).to eq v3
      expect(u1.custom_field_answers.pluck(:key, :value)).to eq [[cf2.key, cfo3.key]]
      expect(u2.custom_field_answers.pluck(:key, :value)).to eq [[cf1.key, [cfo2.key]]]
      expect(u3.custom_field_answers.pluck(:key, :value)).to eq [[cf1.key, [cfo2.key]]]
    end

    it 'deletes the custom field option values from all users for a single select' do
      cf1 = create(:custom_field_select)
      cfo1 = create(:custom_field_option, custom_field: cf1)
      cfo2 = create(:custom_field_option, custom_field: cf1)
      v1 = { cf1.key => cfo1.key }
      u1 = create(:user, custom_field_values: v1)
      v2 = { cf1.key => cfo2.key }
      u2 = create(:user, custom_field_values: v2)

      service.delete_custom_field_option_values(cfo1.key, cfo1.custom_field)

      expect(u1.reload.custom_field_values).to eq({})
      expect(u2.reload.custom_field_values).to eq v2
      expect(u1.custom_field_answers).to be_empty
      expect(u2.custom_field_answers.pluck(:key, :value)).to eq [[cf1.key, cfo2.key]]
    end
  end

  describe 'keyify' do
    it 'throws out non-valid chars' do
      str = (0..255).map { |i| i.chr('UTF-8').to_s }.join # keyify (parameterize call) does not work with ASCII strings
      expect(service.keyify(str)[0..-5]).to eq '0123456789_abcdefghijklmnopqrstuvwxyz___abcdefghijklmnopqrstuvwxyz_aaaaaaaeceeeeiiiidnoooooxouuuuythssaaaaaaaeceeeeiiiidnooooo_ouuuuythy'
    end
  end

  describe 'handle_title' do
    it 'returns the title in the requested locale' do
      field = create(:custom_field, title_multiloc: { 'en' => 'size', 'nl-NL' => 'grootte' })
      expect(service.handle_title(field, 'en')).to eq 'size'
      expect(service.handle_title(field, 'nl-NL')).to eq 'grootte'
    end

    it 'returns the title from the first available locale if the requested locale is not available' do
      field = create(:custom_field, title_multiloc: { 'en' => 'size', 'fr-FR' => 'taille' })
      expect(service.handle_title(field, 'en')).to eq 'size'
      expect(service.handle_title(field, 'fr-FR')).to eq 'taille'
      expect(service.handle_title(field, 'nl-NL')).to eq 'size'
    end
  end

  describe 'remove_not_visible_fields' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:custom_form) { create(:custom_form, participation_context: project) }

    let(:select_custom_field_with_other) do
      cf = create(:custom_field_select, resource: custom_form)
      create(:custom_field_option, custom_field: cf, key: 'option1')
      create(:custom_field_option, custom_field: cf, key: 'option2')
      create(:custom_field_option, custom_field: cf, key: 'other')
      cf
    end
    let(:select_key) { select_custom_field_with_other.key }

    let(:sentiment_custom_field_with_follow_up) do
      create(
        :custom_field_sentiment_linear_scale,
        ask_follow_up: true,
        resource: custom_form
      )
    end

    let(:sentiment_key) { sentiment_custom_field_with_follow_up.key }
    let(:author) { create(:user) }

    let(:idea) do
      create(
        :idea,
        project: project,
        author: author,
        custom_field_values: {
          select_key => 'other',
          "#{select_key}_other": 'other value',
          sentiment_key => 3,
          "#{sentiment_key}_follow_up": 'follow up value',
          key_not_matching_field: 'foo'
        }
      )
    end

    it 'does not show custom fields if user is not author or moderator' do
      values = described_class.remove_not_visible_fields(idea, create(:user))
      expect(values[select_key]).to be_nil
      expect(values[sentiment_key]).to be_nil
    end

    it 'shows custom fields if user is author' do
      values = described_class.remove_not_visible_fields(idea, author)
      expect(values[select_key]).to eq('other')
      expect(values[sentiment_key]).to eq(3)
    end

    it 'removes keys of non-existent custom fields' do
      values = described_class.remove_not_visible_fields(idea, author)
      expect(values['key_not_matching_field']).to be_nil
    end

    it 'does not remove keys of "other" or "follow_up" fields' do
      values = described_class.remove_not_visible_fields(idea, author)
      expect(values["#{select_key}_other"]).to eq('other value')
      expect(values["#{sentiment_key}_follow_up"]).to eq('follow up value')
    end
  end
end

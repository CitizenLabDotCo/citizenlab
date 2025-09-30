# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::CommonGround do
  subject(:participation_method) { described_class.new(phase) }

  let(:phase) { create(:common_ground_phase) }

  it 'is a participation method' do
    expect(described_class).to be < ParticipationMethod::Base
    expect(ParticipationMethod::Base.all_methods).to include(described_class)
  end

  describe '#method_str' do
    it 'returns common_ground' do
      expect(described_class.method_str).to eq 'common_ground'
    end
  end

  describe '#default_fields' do
    it 'returns the correct default fields' do
      transient_form = create(:custom_form, participation_context: phase)
      fields = participation_method.default_fields(transient_form)
      expect(fields.size).to eq(3)

      fields_attrs = fields.map(&:attributes)

      expect(fields_attrs).to match [
        hash_including(
          'resource_id' => transient_form.id,
          'resource_type' => 'CustomForm',
          'key' => 'page1',
          'code' => 'title_page',
          'input_type' => 'page',
          'required' => false,
          'enabled' => true,
          'ordering' => 0
        ),

        hash_including(
          'resource_id' => transient_form.id,
          'resource_type' => 'CustomForm',
          'key' => 'title_multiloc',
          'code' => 'title_multiloc',
          'input_type' => 'text_multiloc',
          'required' => true,
          'enabled' => true,
          'ordering' => 1
        ),

        hash_including(
          'resource_id' => transient_form.id,
          'resource_type' => 'CustomForm',
          'key' => 'form_end',
          'code' => nil,
          'input_type' => 'page',
          'required' => false,
          'enabled' => true,
          'ordering' => 2
        )
      ]
    end
  end

  describe 'constraints' do
    it 'has no constraints' do
      expect(participation_method.constraints).to eq({})
    end
  end

  describe '#supported_email_campaigns' do
    it 'returns campaigns supported for common ground' do
      expect(participation_method.supported_email_campaigns).to match_array %w[idea_published mention_in_official_feedback official_feedback_on_idea_you_follow project_phase_started]
    end
  end

  its(:use_reactions_as_votes?) { is_expected.to be(true) }
  its(:transitive?) { is_expected.to be(false) }
  its(:supports_status?) { is_expected.to be(false) }
  its(:supports_inputs_without_author?) { is_expected.to be(false) }
  its(:supports_submission?) { is_expected.to be(true) }
  its(:allow_posting_again_after) { is_expected.to eq(0.seconds) }
  its(:follow_idea_on_idea_submission?) { is_expected.to be(false) }
  its(:supports_edits_after_publication?) { is_expected.to be(true) }
  its(:supports_permitted_by_everyone?) { is_expected.to be(false) }
  its(:supports_multiple_phase_reports?) { is_expected.to be(false) }
  its(:supports_input_term?) { is_expected.to be(false) }
  its(:supports_assignment?) { is_expected.to be(false) }
  its(:supports_toxicity_detection?) { is_expected.to be(true) }
  its(:return_disabled_actions?) { is_expected.to be(false) }
  its(:supports_public_visibility?) { is_expected.to be(true) }
  its(:add_autoreaction_to_inputs?) { is_expected.to be(false) }

  its(:form_logic_enabled?) { is_expected.to be(false) }
  its(:user_fields_in_form?) { is_expected.to be(false) }
  its(:supports_custom_field_categories?) { is_expected.to be(false) }
  its(:built_in_title_required?) { is_expected.to be(true) }

  its(:supports_exports?) { is_expected.to be(true) }
  its(:supports_private_attributes_in_export?) { is_expected.to be(true) }

  # We might reconsider this in the future.
  its(:supports_commenting?) { is_expected.to be(false) }

  its(:supports_reacting?) { is_expected.to be(true) }
  it { expect(participation_method.supports_reacting?('up')).to be(true) }
  it { expect(participation_method.supports_reacting?('down')).to be(true) }
  it { expect(participation_method.supports_reacting?('neutral')).to be(true) }
end

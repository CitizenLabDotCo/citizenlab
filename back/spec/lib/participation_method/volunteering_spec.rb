# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Volunteering do
  subject(:participation_method) { described_class.new project }

  let(:input) { create :idea }
  let(:project) { create :continuous_project }

  describe '#assign_slug!' do
    it 'does not change the input' do
      participation_method.assign_slug! input
      expect(input).not_to be_changed
    end
  end

  describe '#validate_built_in_fields?' do
    it 'returns false' do
      expect(participation_method.validate_built_in_fields?).to be false
    end
  end

  describe '#assign_default_idea_status' do
    it 'does not change the input' do
      participation_method.assign_default_idea_status input
      expect(input).not_to be_changed
    end
  end

  describe '#assign_defaults' do
    it 'does not change the input' do
      participation_method.assign_defaults input
      expect(input).not_to be_changed
    end
  end
end

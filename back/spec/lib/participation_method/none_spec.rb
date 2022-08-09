# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::None do
  subject(:participation_method) { described_class.new }

  describe '#assign_slug!' do
    let(:input) { create :idea, slug: 'original-slug' }

    it 'does not change the slug of the input' do
      expect { participation_method.assign_slug!(input) }.not_to change(input, :slug)
    end
  end

  describe '#validate_built_in_fields?' do
    it 'returns false' do
      expect(participation_method.validate_built_in_fields?).to be false
    end
  end
end

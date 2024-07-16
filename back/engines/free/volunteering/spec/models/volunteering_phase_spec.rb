# frozen_string_literal: true

require 'rails_helper'

describe Volunteering::VolunteeringPhase do
  describe 'causes_allowed_in_participation_method' do
    it 'invalidates the participation context when there are causes associated to a non-volunteering participation_method' do
      cause = create(:cause)
      phase = cause.phase
      phase.participation_method = 'information'
      expect(phase).to be_invalid
      expect(phase.errors.details).to eq({ base: [{ error: :cannot_contain_causes, causes_count: 1 }] })
    end
  end
end

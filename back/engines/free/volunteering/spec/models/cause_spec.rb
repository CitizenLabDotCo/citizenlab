# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Volunteering::Cause do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:cause)).to be_valid
    end
  end

  it_behaves_like 'a sanitized html_multiloc', factory: :cause
  it_behaves_like 'a plain text multiloc', factory: :cause

  describe 'phase_supports_causes validation' do
    it 'is invalid when the phase is not a volunteering phase' do
      cause = build(:cause, phase: create(:phase, participation_method: 'ideation'))

      expect(cause).not_to be_valid
      expect(cause.errors[:phase]).to be_present
    end
  end
end

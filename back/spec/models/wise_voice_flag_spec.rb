require 'rails_helper'

RSpec.describe WiseVoiceFlag do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:wise_voice_flag)).to be_valid
    end
  end
end

require 'rails_helper'

RSpec.describe IdeaStatus, type: :model do
  context 'Default factory' do
    it 'is valid' do
      expect(build(:idea_status)).to be_valid
    end
  end

  subject { create(:idea_status) }

  before :all do
    @code = IdeaStatus::MINIMUM_REQUIRED_CODES.sample
  end

  context 'when its code is required' do
    before do
      subject.code = @code
    end

    describe 'if it is the only existing with this code' do
      it 'cannot be destroyed' do
        subject.destroy
        expect(subject.destroyed?).to eq false
      end
    end

    describe 'if others exist with this code' do
      before do
        create_list(:idea_status, 3, code: @code)
      end

      it 'can be destroyed' do
        subject.destroy
        expect(subject.destroyed?).to eq true
      end
    end
  end

  context 'when its code is not required' do
    before do
      subject.code = 'accepted'
    end

    it 'can be destroyed' do
      subject.destroy
      expect(subject.destroyed?).to eq true
    end
  end
end

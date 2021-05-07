# frozen_string_literal: true

require 'rspec'

describe 'Insights::View' do
  describe 'validations' do
    subject { build(:view) }

    specify { expect(subject).to be_valid }

    it 'is not valid without a name' do
      subject.name = nil
      expect(subject).not_to be_valid
    end

    it 'is not valid with an empty name' do
      subject.name = ''
      expect(subject).not_to be_valid
    end

    it 'is not valid if the name is already taken' do
      build_stubbed(:view, name: subject.name)
      expect(subject).not_to be_valid
    end
  end
end

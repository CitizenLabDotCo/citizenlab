# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Polls::Option do
  it_behaves_like 'a plain text multiloc', factory: :poll_option

  describe 'Default factory' do
    it 'is valid' do
      expect(build(:poll_option)).to be_valid
    end
  end
end

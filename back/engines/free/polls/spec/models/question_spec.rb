# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Polls::Question do
  it_behaves_like 'a plain text multiloc', factory: :poll_question

  describe 'Default factory' do
    it 'is valid' do
      expect(build(:poll_question)).to be_valid
    end
  end
end

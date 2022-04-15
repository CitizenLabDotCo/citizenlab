# frozen_string_literal: true

require 'rails_helper'

describe UserCustomFields::Representativeness::RefDistribution do
  describe 'validations' do
    specify do
      ref_distribution = create(:ref_distribution)
      expect(ref_distribution).to be_valid
    end

    it 'other tests here' do
      pending 'not yet implemented'
      raise NotImplementedError
    end
  end
end

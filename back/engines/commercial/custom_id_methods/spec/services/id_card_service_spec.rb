# frozen_string_literal: true

require 'rails_helper'

describe CustomIdMethods::IdCardLookup::IdCardService do
  subject(:service) { described_class.new }

  describe 'normalize' do
    it 'removes all whitespace' do
      expect(service.normalize('123 abc5 ')).to eq '123abc5'
    end

    it 'removes all special chars' do
      expect(service.normalize('j4-ab%c&8')).to eq 'j4abc8'
    end

    it 'downcases all chars' do
      expect(service.normalize('aaAa4CC')).to eq 'aaaa4cc'
    end
  end

  describe 'encode' do
    it 'normalizes and hashes' do
      expect(service.encode(' aA-.4 1')).to eq '$2a$10$Cu8AnxXnDwWAH0OkCBrbd.XQRzMDcXb46dMlEezTzL6nUz00JiHKK'
    end
  end
end

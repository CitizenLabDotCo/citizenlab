# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::Templates::Utils do
  let(:service) { described_class.new }

  describe 'available_templates' do
    it 'returns a non-empty list' do
      expect(service.available_templates).not_to be_empty
    end
  end
end

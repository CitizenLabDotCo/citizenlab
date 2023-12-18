# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::Templates::Utils do
  subject(:service) { described_class.new(template_bucket: nil) }

  describe '#internal_template_names' do
    it 'returns expected templates' do
      expect(service.internal_template_names)
        .to contain_exactly('base', 'e2etests_template')
    end
  end
end

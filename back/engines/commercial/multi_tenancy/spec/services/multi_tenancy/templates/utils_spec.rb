# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::Templates::Utils do
  let(:service) do
    described_class.new(tenant_bucket: nil, template_bucket: nil)
  end

  describe '#available_internal_templates' do
    it 'returns a non-empty list' do
      expect(service.available_internal_templates).not_to be_empty
    end
  end
end

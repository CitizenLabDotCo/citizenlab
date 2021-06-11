# frozen_string_literal: true

require 'rails_helper'

describe Insights::CategoryAssignmentsService do
  subject(:service) { described_class.new }

  describe '#add_assignments!' do
    context 'when the input is not an idea' do
      let(:input) { create(:comment) }
      let(:category) { create(:category) }

      it { expect { service.add_assignments!(input, [category]) }.to raise_error(ActiveRecord::RecordInvalid) }
    end
  end
end

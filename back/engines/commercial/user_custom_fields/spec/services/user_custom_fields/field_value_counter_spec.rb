# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::FieldValueCounter do
  describe '.counts_by_field_option' do
    context 'when custom field values are inconsistent with custom field options' do
      let(:gender_custom_field) { create(:custom_field_gender, :with_options) }

      before do
        # Create user with invalid value for gender custom field.
        user = build(:user, gender: 'unicorn')
        user.save!(validate: false)
      end

      it 'compute counts without raising an error', :aggregate_failures do
        expect(ErrorReporter).to receive(:report).with(kind_of(ArgumentError))

        counts = nil
        expect { counts = described_class.counts_by_field_option(User.active, gender_custom_field) }
          .not_to raise_error(ArgumentError)

        expect(counts).to match('unicorn' => 1, described_class::UNKNOWN_VALUE_LABEL => 0)
      end
    end
  end
end

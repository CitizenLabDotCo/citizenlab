# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::FieldValueCounter do
  subject(:counts) { described_class.counts_by_field_option(users, custom_field, options) }

  let(:users) { User.active }
  let(:options) { {} }

  describe '.counts_by_field_option' do
    context 'when custom field values are inconsistent with custom field options' do
      let(:custom_field) { create(:custom_field_gender, :with_options) }

      before do
        # Create user with invalid value for gender custom field.
        user = build(:user, gender: 'unicorn')
        user.save!(validate: false)
      end

      it 'compute counts without raising an error', :aggregate_failures do
        expect(ErrorReporter).to receive(:report).with(kind_of(ArgumentError))
        expect { counts }.not_to raise_error
        expect(counts).to match('unicorn' => 1, described_class::UNKNOWN_VALUE_LABEL => 0)
      end
    end

    context "when 'by' option is ':area_id'" do
      let(:options) { { by: :area_id } }
      let(:area) { create(:area) }

      before do
        # Domicile field must be created before the user, otherwise the user is not
        # valid.
        @domicile_field = create(:custom_field_domicile)
        create(:user, domicile: area.id)
      end

      context 'and custom field is domicile' do
        let(:custom_field) { @domicile_field }

        it 'returns counts indexed by area id' do
          expect(counts.keys).to contain_exactly(area.id, described_class::UNKNOWN_VALUE_LABEL)
        end
      end

      context 'and custom field is not domicile' do
        let(:custom_field) { create(:custom_field_gender, :with_options) }

        specify { expect { counts }.to raise_error(ArgumentError) }
      end
    end
  end
end

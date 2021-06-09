# frozen_string_literal: true

require 'rails_helper'

describe TrackIntercomService do
  let(:intercom) { double(INTERCOM_CLIENT).as_null_object }
  let(:service) { described_class.new(intercom) }

  describe 'identify_user' do
    context 'when it creates a new contact' do
      let(:user) { create(:admin) }

      # rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations
      it "includes 'isProjectModerator' custom attribute" do
        contacts_api = double('contacts_api').as_null_object
        expect(intercom).to receive(:contacts).twice.and_return(contacts_api)

        zero_contacts = OpenStruct.new(count: 0)
        expect(contacts_api).to receive(:search).and_return(zero_contacts)

        expect(contacts_api).to receive(:create) do |attributes|
          expect(attributes.dig(:custom_attributes, :isProjectModerator)).to eq(false)
        end.and_return(double('contact').as_null_object)

        service.identify_user(user)
      end
      # rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations
    end

    context 'when it updates an existing contact' do
      let(:user) { create(:admin) }

      # rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations
      it "includes 'isProjectModerator' custom attribute" do
        contacts_api = double('contacts_api').as_null_object
        expect(intercom).to receive(:contacts).twice.and_return(contacts_api)

        contact = double('contact').as_null_object
        expect(contacts_api).to receive(:search).and_return(double({ count: 1, :[] => contact }))

        # The main assertion:
        expect(contact).to receive(:custom_attributes=).with(hash_including(isProjectModerator: false))

        service.identify_user(user)
      end
      # rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations
    end
  end
end

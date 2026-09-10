# frozen_string_literal: true

require 'rails_helper'

describe AnonymizeUserService do
  let(:service) { described_class.new }

  describe '#anonymized_attributes' do
    before do
      create(:custom_field_birthyear)
      create(:custom_field_gender, :with_options)
      create(:custom_field_domicile)
    end

    def build_user(service, user: nil)
      answers = service.anonymized_answers(user: user)
      new_user = User.new(service.anonymized_attributes(['en'], answers: answers, user: user))
      answers.each do |answer|
        new_user.custom_field_answers.build(
          key: answer['custom_field'].key,
          value: answer['value'],
          custom_field: answer['custom_field']
        )
      end
      new_user
    end

    it "anonymizes confidential parts of the user's attributes" do
      10.times do
        user = create(:user)
        expect(build_user(service, user: user)).to be_valid
        expect(build_user(service)).to be_valid
      end
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Events::Attendance do
  subject(:attendance) { build(:event_attendance) }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.to belong_to(:event) }
  it { is_expected.to belong_to(:attendee).class_name('User') }

  specify do
    expect(attendance)
      .to validate_uniqueness_of(:attendee)
      .scoped_to(:event_id)
      .with_message('is already registered to this event')
  end
end

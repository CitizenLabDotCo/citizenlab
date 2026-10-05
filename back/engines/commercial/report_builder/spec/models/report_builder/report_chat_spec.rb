# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::ReportChat do
  subject(:chat) { create(:report_chat) }

  it 'is one per report' do
    expect { create(:report_chat, report: chat.report) }
      .to raise_error(ActiveRecord::RecordNotUnique)
  end

  it 'refuses a transcript that is not a list of turns' do
    chat.transcript = { 'role' => 'user' }

    expect(chat).not_to be_valid
    expect(chat.errors[:transcript]).to be_present
  end
end

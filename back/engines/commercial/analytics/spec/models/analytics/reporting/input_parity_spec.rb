# frozen_string_literal: true

require 'rails_helper'

# The received_feedback boolean must agree with the legacy posts fact
# (analytics_fact_posts), which derives the same signal from official
# feedbacks and status-change activities.
RSpec.describe 'reporting_inputs parity with Analytics::FactPost' do # rubocop:disable RSpec/DescribeClass
  before_all do
    Analytics::PopulateDimensionsService.populate_types
  end

  before do
    create(:idea)
    create(:official_feedback)
    create(:idea_changed_status_activity, item: create(:idea))
  end

  it 'agrees with the legacy posts fact on which inputs received feedback' do
    expect(Analytics::Reporting::Input.where(received_feedback: true).count)
      .to eq Analytics::FactPost.where(feedback_none: 0).count
    expect(Analytics::Reporting::Input.where(received_feedback: false).count)
      .to eq Analytics::FactPost.where(feedback_none: 1).count
  end
end

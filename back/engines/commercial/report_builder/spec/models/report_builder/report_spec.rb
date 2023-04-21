# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Report do
  subject(:report) { build(:report) }

  it { is_expected.to validate_uniqueness_of(:name) }
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to belong_to(:owner).class_name('User') }
  it { is_expected.to have_one(:layout).class_name('ContentBuilder::Layout').dependent(:destroy) }
end

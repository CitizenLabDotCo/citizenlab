# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PhasePlacement::OnTimeline do
  subject(:placement) { described_class.new }

  its(:sequential?) { is_expected.to be true }
  its(:presented_as_page?) { is_expected.to be true }
end

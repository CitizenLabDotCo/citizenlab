# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PhasePlacementStrategy::OnTimeline do
  subject(:placement_strategy) { described_class.new }

  its(:sequential?) { is_expected.to be true }
  its(:presented_as_page?) { is_expected.to be true }
end

require 'rails_helper'

RSpec.describe Permissions::ActionDescriptorsService do
  subject(:service) { described_class.new(action_descriptors) }

  def descriptor(enabled:, disabled_reason: nil)
    { enabled: enabled, disabled_reason: disabled_reason }
  end

  describe '#participation_possible?' do
    context 'when an action other than attending_event is enabled' do
      let(:action_descriptors) do
        {
          posting_idea: descriptor(enabled: false, disabled_reason: 'posting_disabled'),
          taking_survey: descriptor(enabled: true)
        }
      end

      it { expect(service.participation_possible?).to be true }
    end

    context 'when no action is enabled but a disabled reason is user-fixable' do
      let(:action_descriptors) do
        {
          posting_idea: descriptor(enabled: false, disabled_reason: 'user_not_signed_in'),
          taking_survey: descriptor(enabled: false, disabled_reason: 'not_survey')
        }
      end

      it { expect(service.participation_possible?).to be true }
    end

    context 'when no action is enabled and no disabled reason is fixable' do
      let(:action_descriptors) do
        {
          posting_idea: descriptor(enabled: false, disabled_reason: 'posting_disabled'),
          taking_survey: descriptor(enabled: false, disabled_reason: 'not_survey')
        }
      end

      it { expect(service.participation_possible?).to be false }
    end
  end
end

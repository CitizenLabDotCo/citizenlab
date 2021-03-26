# frozen_string_literal: true

require 'rails_helper'

describe TrackEventJob do
  context 'when there is no AppConfiguration' do

    before do
      AppConfiguration.instance.destroy
    end

    # using 'build' because 'create' needs the AppConfiguration
    let(:activity) { build(:activity) } 

    it 'does not raise a ActiveRecord::RecordNotFound' do
      expect { described_class.perform_now(activity) }.not_to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end

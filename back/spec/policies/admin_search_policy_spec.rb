# frozen_string_literal: true

require 'rails_helper'

describe AdminSearchPolicy do
  subject(:policy) { described_class.new(user, :admin_search) }

  describe 'index?' do
    using RSpec::Parameterized::TableSyntax

    # A nil factory means a visitor (not signed in).
    where(:factory, :permitted) do
      nil                       | false
      :user                     | false
      :admin                    | true
      :project_moderator        | true
      :project_folder_moderator | true
      :space_moderator          | true
    end

    with_them do
      let(:user) { factory && create(factory) }

      it { expect(policy.index?).to be(permitted) }
    end

    context 'for a blocked admin' do
      let(:user) { create(:admin, block_end_at: 5.days.from_now) }

      it { is_expected.not_to permit(:index) }
    end
  end
end

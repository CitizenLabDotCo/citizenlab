# frozen_string_literal: true

require 'rails_helper'

describe InvitePolicy do
  describe '#view_token?' do
    using RSpec::Parameterized::TableSyntax

    subject(:policy) { described_class.new(current_user, create(invite_factory)) }

    let(:current_user) { viewer && create(viewer) }

    where(:invite_factory, :viewer, :allowed) do
      :invite               | nil          | false
      :invite               | :admin       | false
      :invite               | :super_admin | true
      :invite_without_email | :admin       | true
    end

    with_them do
      it { expect(policy.view_token?).to eq allowed }
    end
  end
end

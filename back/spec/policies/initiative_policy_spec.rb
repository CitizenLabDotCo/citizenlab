# frozen_string_literal: true

require 'rails_helper'

describe InitiativePolicy do
  subject(:policy) { described_class.new(user, idea) }

  let(:scope) { InitiativePolicy::Scope.new(user, Initative) }

end

# frozen_string_literal: true

require 'rails_helper'

describe EmailNormalizationService do
  describe '.normalize' do
    using RSpec::Parameterized::TableSyntax

    where(:input, :expected) do
      # blank emails
      nil                           | ''
      ''                            | ''

      # strips and downcases
      '  USER@Example.COM  '        | 'user@example.com'

      # Gmail: removes dots, plus addressing, normalizes googlemail.com
      'john.doe@gmail.com'          | 'johndoe@gmail.com'
      'john+tag@gmail.com'          | 'john@gmail.com'
      'john.doe+tag@gmail.com'      | 'johndoe@gmail.com'
      'john@googlemail.com'         | 'john@gmail.com'
      'john.doe+tag@googlemail.com' | 'johndoe@gmail.com'

      # Plus addressing providers: removes plus, preserves dots
      'user+tag@outlook.com'        | 'user@outlook.com'
      'john.doe@outlook.com'        | 'john.doe@outlook.com'
      'user+tag@hotmail.com'        | 'user@hotmail.com'
      'john.doe@hotmail.com'        | 'john.doe@hotmail.com'
      'user+tag@live.com'           | 'user@live.com'
      'john.doe@live.com'           | 'john.doe@live.com'
      'user+tag@yahoo.com'          | 'user@yahoo.com'
      'john.doe@yahoo.com'          | 'john.doe@yahoo.com'
      'user+tag@protonmail.com'     | 'user@protonmail.com'
      'john.doe@protonmail.com'     | 'john.doe@protonmail.com'
      'user+tag@proton.me'          | 'user@proton.me'
      'john.doe@proton.me'          | 'john.doe@proton.me'

      # Other domains: preserves dots and plus addressing
      'john.doe@company.com'        | 'john.doe@company.com'
      'john+tag@company.com'        | 'john+tag@company.com'

      # Edge case: no domain
      'nodomain'                    | 'nodomain'
    end

    with_them do
      it { expect(described_class.normalize(input)).to eq(expected) }
    end
  end
end

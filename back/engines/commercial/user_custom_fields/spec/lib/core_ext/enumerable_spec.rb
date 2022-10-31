# frozen_string_literal: true

require 'rails_helper'
require 'user_custom_fields/core_ext/enumerable'

RSpec.describe Enumerable do
  describe '#sorted?' do
    context 'when sorted' do
      where(enumerable: [
        [],
        [0],
        [-1, 0, 1],
        %w[a b c],
        %i[a b c],
        { a: 1, b: 2, c: 3 }
      ])

      with_them do
        it { expect(enumerable).to be_sorted }
      end
    end

    context 'when unsorted' do
      where(enumerable: [
        [1, 0],
        %w[c b a],
        %i[c b a],
        { b: 3, a: 2 }
      ])

      with_them do
        it { expect(enumerable).not_to be_sorted }
      end
    end

    context 'when order is ill-defined' do
      where(enumerable: [
        [:a, 'b'],
        [nil, 1],
        [1, {}]
      ])

      with_them do
        it { expect { enumerable.sorted? }.to raise_error(NoMethodError) }
      end
    end
  end
end

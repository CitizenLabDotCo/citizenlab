# frozen_string_literal: true

require 'rails_helper'

describe Analysis::CommentsToText do
  describe '#execute' do
    subject(:text) { described_class.new.execute(input, **kwargs) }

    let(:kwargs) { {} }

    let(:input) { create(:idea) }

    context 'when the input has no comments' do
      it { is_expected.to be_nil }
    end

    context 'when the input has comments' do
      let!(:comments) { create_list(:comment, 2, idea: input) }

      it { is_expected.not_to be_nil }

      it 'does not include original author names' do
        pii_items = User.all.flat_map { |u| [u.id, u.first_name, u.last_name, u.slug] }
        expect(text).not_to include(*pii_items)
      end
    end

    context 'when the comments have mentions' do
      let!(:comments) { create_list(:comment_with_mentions, 2, idea: input) }

      it 'does not include the originally mentioned names' do
        pii_items = User.all.flat_map { |u| [u.id, u.first_name, u.last_name, u.slug] }
        expect(text).not_to include(*pii_items)
      end
    end

    context 'when there are subcomments' do
      let!(:comments) { create_list(:comment, 2, idea: input) }
      let!(:subcomments) { create_list(:comment, 2, idea: input, parent: comments.first, body_multiloc: { en: 'This should be in the text' }) }

      it 'does include the subcomments' do
        expect(text).to include('This should be in the text')
      end
    end

    context 'when truncating values' do
      let(:kwargs) { { truncate_values: 10 } }

      let!(:comments) { create_list(:comment, 2, idea: input) }

      it 'truncates the values' do
        expect(text).to include('...')
      end
    end

    context 'when the separator is changed' do
      let(:kwargs) { { separator: '+++' } }

      let!(:comments) { create_list(:comment, 2, idea: input) }

      it 'uses the separator' do
        expect(text).to include('+++').once
      end
    end

    context 'when the author is not included' do
      let(:kwargs) { { include_author: false } }

      let!(:comments) { create_list(:comment, 2, idea: input) }

      it 'does not include the author' do
        expect(text).not_to include('USER_')
      end
    end
  end
end

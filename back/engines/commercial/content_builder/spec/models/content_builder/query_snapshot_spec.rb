# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::QuerySnapshot do
  describe '.hash_for' do
    # The contract the unique index rests on: a stable digest of the normalized SQL.
    it 'is the digest of the question it was given' do
      expect(described_class.hash_for('SELECT 1')).to eq Digest::SHA256.hexdigest('SELECT 1')
    end

    it 'differs for a different question' do
      expect(described_class.hash_for('SELECT 1')).not_to eq described_class.hash_for('SELECT 2')
    end
  end

  describe 'uniqueness' do
    it 'stores one answer per question per layout' do
      snapshot = create(:query_snapshot)
      duplicate = build(
        :query_snapshot, layout: snapshot.layout, sql: snapshot.sql, query_hash: snapshot.query_hash
      )

      expect(duplicate).to be_invalid
      expect(duplicate.errors.details[:query_hash]).to include(hash_including(error: :taken))
    end

    it 'lets two layouts each keep their own answer to the same question' do
      snapshot = create(:query_snapshot)

      expect(build(:query_snapshot, sql: snapshot.sql, query_hash: snapshot.query_hash)).to be_valid
    end
  end

  describe 'reading the stored answer' do
    it 'exposes the columns, rows and whether the result was cut short' do
      snapshot = create(:query_snapshot, data: {
        'columns' => %w[month count], 'rows' => [{ 'month' => '2026-01', 'count' => 3 }], 'truncated' => true
      })

      expect(snapshot.columns).to eq %w[month count]
      expect(snapshot.rows).to eq [{ 'month' => '2026-01', 'count' => 3 }]
      expect(snapshot).to be_truncated
    end

    it 'reads empty rather than raising when nothing was stored' do
      snapshot = build(:query_snapshot, data: {})

      expect(snapshot.columns).to eq []
      expect(snapshot.rows).to eq []
      expect(snapshot).not_to be_truncated
    end
  end

  describe 'when the layout goes' do
    it 'takes its stored answers with it' do
      snapshot = create(:query_snapshot)

      expect { snapshot.layout.destroy! }.to change(described_class, :count).by(-1)
    end
  end
end

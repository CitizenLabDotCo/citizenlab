# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PlainTextMultiloc do
  # Temporary models over a temporary table, as in `sluggable_spec`: the rules below are about which
  # declarations apply and when they run, which no real model can show on its own.
  # These disabled RuboCop rules are necessary to permit the successful creation and removal of a
  # dynamic class, the leakage of which is what the rubocop rules are trying to prevent.
  before(:context) do # rubocop:disable RSpec/BeforeAfterAll
    ActiveRecord::Base.connection.create_table(:test_plain_text_models, temporary: true) do |t|
      t.jsonb :title_multiloc
      t.jsonb :subtitle_multiloc
      t.string :slug
    end

    Object.const_set(:TempPlainTextModel, Class.new(ApplicationRecord) do
      self.table_name = 'test_plain_text_models'
      include PlainTextMultiloc
      plain_text_multiloc :title_multiloc
      plain_text_multiloc :subtitle_multiloc
    end)

    Object.const_set(:TempSubtitlePlainTextModel, Class.new(TempPlainTextModel) do
      plain_text_multiloc :subtitle_multiloc
    end)

    Object.const_set(:TempValidatedPlainTextModel, Class.new(ApplicationRecord) do
      self.table_name = 'test_plain_text_models'
      include PlainTextMultiloc
      plain_text_multiloc :title_multiloc
      validates :title_multiloc, multiloc: { presence: true }
    end)

    Object.const_set(:TempSluggedPlainTextModel, Class.new(ApplicationRecord) do
      self.table_name = 'test_plain_text_models'
      include PlainTextMultiloc
      plain_text_multiloc :title_multiloc, prepend: true
      slug from: proc { |record| record.title_multiloc['en'] }
    end)
  end

  after(:context) do # rubocop:disable RSpec/BeforeAfterAll
    # rubocop:disable RSpec/RemoveConst
    %i[TempPlainTextModel TempSubtitlePlainTextModel TempValidatedPlainTextModel
      TempSluggedPlainTextModel].each do |name|
      Object.send(:remove_const, name) if Object.const_defined?(name)
    end
    # rubocop:enable RSpec/RemoveConst
    connection = ActiveRecord::Base.connection
    connection.drop_table(:test_plain_text_models) if connection.table_exists?(:test_plain_text_models)
  end

  it 'strips markup from a declared attribute on write' do
    record = TempPlainTextModel.create!(title_multiloc: { 'en' => '<b>bold</b> text' })

    expect(record[:title_multiloc]).to eq({ 'en' => 'bold text' })
  end

  it 'strips every attribute declared, not only the ones in the last declaration' do
    record = TempPlainTextModel.create!(
      title_multiloc: { 'en' => '<b>title</b>' },
      subtitle_multiloc: { 'en' => '<b>subtitle</b>' }
    )

    expect(record[:title_multiloc]).to eq({ 'en' => 'title' })
    expect(record[:subtitle_multiloc]).to eq({ 'en' => 'subtitle' })
  end

  it 'keeps what a parent declared when a subclass declares an attribute of its own' do
    record = TempSubtitlePlainTextModel.create!(
      title_multiloc: { 'en' => '<b>title</b>' },
      subtitle_multiloc: { 'en' => '<b>subtitle</b>' }
    )

    expect(record[:title_multiloc]).to eq({ 'en' => 'title' })
    expect(record[:subtitle_multiloc]).to eq({ 'en' => 'subtitle' })
  end

  it 'leaves a declared attribute alone when the save does not change it' do
    record = TempPlainTextModel.create!(title_multiloc: { 'en' => 'Clean' })
    record.update_columns(title_multiloc: { 'en' => '<b>Legacy</b>' })

    record.reload.update!(subtitle_multiloc: { 'en' => 'Subtitle' })

    expect(record.reload[:title_multiloc]).to eq({ 'en' => '<b>Legacy</b>' })
  end

  # Stripping is registered on `before_validation`, so a presence rule judges what survives it. Move
  # it to `before_save` and the raw markup passes the rule, then lands blank in a column that
  # requires a value - leaving a row no later save of any field can get past.
  it 'strips before a presence rule runs, so an all-markup value is rejected rather than stored' do
    record = TempValidatedPlainTextModel.new(title_multiloc: { 'en' => '<img src=x onerror=alert(1)>' })

    expect(record).not_to be_valid
    expect(record.errors[:title_multiloc]).to be_present
  end

  it 'strips the title before `Sluggable` builds the slug from it, when declared with prepend' do
    record = TempSluggedPlainTextModel.create!(title_multiloc: { 'en' => '<b>Bold</b> title' })

    expect(record.slug).to eq 'bold-title'
  end
end

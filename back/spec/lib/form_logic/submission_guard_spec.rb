# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FormLogic::SubmissionGuard do
  def page(id, **attributes)
    FormLogic::Field.from_h({ 'id' => "#{id}-id", 'key' => id, 'input_type' => 'page' }.merge(attributes.stringify_keys))
  end

  def question(key, input_type = 'select', options: [], **attributes)
    FormLogic::Field.from_h({
      'id' => "#{key}-id", 'key' => key, 'input_type' => input_type,
      'options' => options.map { |option| { 'id' => "#{option}-id", 'key' => option } }
    }.merge(attributes.stringify_keys))
  end

  # p1: colour (red skips p2); p2: why (required); p3: brand (only shown for blue), title
  let(:fields) do
    [
      page('p1', 'logic' => {}),
      question('colour', options: %w[red blue other], required: true,
        'logic' => { 'rules' => [{ 'if' => 'red-id', 'goto_page_id' => 'p3-id' }] }),
      page('p2'),
      question('why', 'text', required: true),
      page('p3'),
      question('brand', 'text', required: true),
      question('title', 'text_multiloc', required: true),
      page('form_end')
    ]
  end
  let(:logic) do
    FormLogic::LegacyNormalizer.new(fields).call.logic.merge(
      'brand-id' => { 'display' => { 'field' => 'colour-id', 'op' => 'one_of', 'value' => %w[blue-id] } }
    )
  end

  def guard(mode: :enforce) = described_class.new(fields, logic: logic, mode: mode)

  describe 'enforcing' do
    it 'keeps answers on the path and drops answers on skipped pages and hidden questions' do
      result = guard.call({ 'colour' => 'red', 'why' => 'x', 'brand' => 'volvo', 'title' => { 'en' => 'T' } }, publishing: true)

      expect(result.values).to eq('colour' => 'red', 'title' => { 'en' => 'T' })
      expect(result.dropped_keys).to eq(%w[why brand])
      expect(result.errors).to eq({})
    end

    it 'drops the other and follow-up texts of a dropped answer, and keeps those of a kept answer' do
      result = guard.call(
        { 'colour' => 'blue', 'colour_other' => 'teal', 'why' => 'x', 'why_follow_up' => 'y', 'brand' => 'b', 'title' => { 'en' => 'T' } },
        publishing: true
      )
      skipped = guard.call({ 'colour' => 'red', 'why' => 'x', 'why_follow_up' => 'y', 'title' => { 'en' => 'T' } }, publishing: true)

      expect(result.values.keys).to eq(%w[colour colour_other why why_follow_up brand title])
      expect(skipped.values).to eq('colour' => 'red', 'title' => { 'en' => 'T' })
      expect(skipped.dropped_keys).to eq(%w[why why_follow_up])
    end

    it 'passes through keys that are not questions of the form' do
      result = guard.call({ 'colour' => 'red', 'title' => { 'en' => 'T' }, 'u_gender' => 'f', 'unknown' => 1 }, publishing: true)

      expect(result.values).to include('u_gender' => 'f', 'unknown' => 1)
    end

    it 'reports missing required answers on the path when publishing' do
      result = guard.call({ 'colour' => 'blue' }, publishing: true)

      expect(result.missing_required_keys).to eq(%w[why brand title])
      expect(result.errors).to eq(
        'why' => [{ error: 'blank' }], 'brand' => [{ error: 'blank' }], 'title' => [{ error: 'blank' }]
      )
    end

    it 'does not require questions on skipped pages or hidden questions' do
      expect(guard.call({ 'colour' => 'red' }, publishing: true).missing_required_keys).to eq(%w[title])
    end

    it 'counts blank answers as missing, including a multiloc with only blank texts' do
      result = guard.call({ 'colour' => 'red', 'title' => { 'en' => '', 'nl-BE' => ' ' } }, publishing: true)

      expect(result.missing_required_keys).to eq(%w[title])
    end

    it 'does not check required answers on drafts, but still drops answers' do
      result = guard.call({ 'colour' => 'red', 'why' => 'x' }, publishing: false)

      expect(result.errors).to eq({})
      expect(result.missing_required_keys).to eq([])
      expect(result.values).to eq('colour' => 'red')
    end

    it 'does not touch the values it was given' do
      values = { 'colour' => 'red', 'why' => 'x' }
      guard.call(values, publishing: true)

      expect(values).to eq('colour' => 'red', 'why' => 'x')
    end
  end

  describe 'shadow mode' do
    it 'keeps every value and reports no errors, but tells what it would have done' do
      values = { 'colour' => 'red', 'why' => 'x' }
      result = guard(mode: :shadow).call(values, publishing: true)

      expect(result.values).to eq(values)
      expect(result.errors).to eq({})
      expect(result.dropped_keys).to eq(%w[why])
      expect(result.missing_required_keys).to eq(%w[title])
    end

    it 'is the default' do
      expect(described_class.new(fields, logic: logic).call({ 'colour' => 'red', 'why' => 'x' }, publishing: true).values)
        .to eq('colour' => 'red', 'why' => 'x')
    end
  end

  it 'normalizes the stored logic when no logic is given' do
    result = described_class.new(fields, mode: :enforce).call({ 'colour' => 'red', 'why' => 'x', 'brand' => 'b' }, publishing: false)

    expect(result.values).to eq('colour' => 'red', 'brand' => 'b')
  end

  it 'rejects an unknown mode' do
    expect { described_class.new(fields, mode: :strict) }.to raise_error(ArgumentError)
  end
end

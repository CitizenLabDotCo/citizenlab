# frozen_string_literal: true

require 'rails_helper'

describe FormLogicService do
  subject(:form_logic) { described_class.new fields }

  let(:form) { create(:custom_form) }
  let(:fields) do
    # Guarantee correct values for `ordering` attribute.
    [
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_linear_scale, :for_custom_form, maximum: 3),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_select, :for_custom_form, :with_options, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_page, :for_custom_form, resource: form),
      create(:custom_field_section, :for_custom_form, resource: form)
    ]
  end

  describe '#ui_schema_rules_for' do
    let(:page1) { fields[0] }
    let(:question1) { fields[1] }
    let(:page2) { fields[2] }
    let(:question2) { fields[3] }
    let(:option1) { question2.options[0] }
    let(:option2) { question2.options[1] }
    let(:page3) { fields[4] }
    let(:page4) { fields[5] }
    let(:page5) { fields[6] }
    let(:question1_value) { 1 }
    let(:question2_answer) { option2 }

    context 'when there is no logic' do
      before do
        question1.update!(logic: {})
        page2.update!(logic: {})
      end

      it 'returns a UI schema without rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to be_nil
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to be_nil
        expect(form_logic.ui_schema_rules_for(page4)).to be_nil
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when a page has an explicit next page' do
      before do
        page2.update!(logic: { 'next_page_id' => page5.id })
      end

      it 'returns a UI schema with rules for the given next page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to be_nil
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to eq([{
          effect: 'HIDE',
          condition: {
            type: 'HIDEPAGE',
            pageId: page2.id
          }
        }])
        expect(form_logic.ui_schema_rules_for(page4)).to eq([{
          effect: 'HIDE',
          condition: {
            type: 'HIDEPAGE',
            pageId: page2.id
          }
        }])
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when a page has an explicit next page, which is the end page' do
      before do
        page2.update!(logic: { 'next_page_id' => 'survey_end' })
      end

      it 'returns a UI schema with rules for the given next page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to be_nil
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to eq([{
          effect: 'HIDE',
          condition: {
            type: 'HIDEPAGE',
            pageId: page2.id
          }
        }])
        expect(form_logic.ui_schema_rules_for(page4)).to eq([{
          effect: 'HIDE',
          condition: {
            type: 'HIDEPAGE',
            pageId: page2.id
          }
        }])
        expect(form_logic.ui_schema_rules_for(page5)).to eq([{
          effect: 'HIDE',
          condition: {
            type: 'HIDEPAGE',
            pageId: page2.id
          }
        }])
      end
    end

    context 'when a page has an explicit next page, and an answer to a single choice question in the page triggers going to another page' do
      before do
        page2.update!(logic: { 'next_page_id' => page5.id })
        question2.update!(logic: {
          'rules' => [{ 'if' => question2_answer.id, 'goto_page_id' => page4.id }]
        })
      end

      it 'returns a UI schema with rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to be_nil
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to eq([{
          effect: 'HIDE',
          condition: {
            type: 'HIDEPAGE',
            pageId: page2.id
          }
        }, {
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question2.key}",
            schema: {
              enum: [question2_answer.key]
            }
          }
        }, {
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question2.key}",
            schema: {
              enum: [option1.key]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page4)).to eq([{
          effect: 'HIDE',
          condition: {
            type: 'HIDEPAGE',
            pageId: page2.id
          }
        }, {
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question2.key}",
            schema: {
              enum: [option1.key]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when a page has an explicit next page, and an answer to a linear scale question in the page triggers going to another page' do
      before do
        page1.update!(logic: { 'next_page_id' => page5.id })
        question1.update!(logic: {
          'rules' => [{ 'if' => 3, 'goto_page_id' => page3.id }]
        })
      end

      it 'returns a UI schema with rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to match_array([
          {
            effect: 'HIDE',
            condition: {
              scope: "#/properties/#{question1.key}",
              schema: {
                enum: [1]
              }
            }
          },
          {
            effect: 'HIDE',
            condition: {
              scope: "#/properties/#{question1.key}",
              schema: {
                enum: [2]
              }
            }
          },
          {
            effect: 'HIDE',
            condition: {
              scope: "#/properties/#{question1.key}",
              schema: {
                enum: [3]
              }
            }
          },
          {
            effect: 'HIDE',
            condition: {
              type: 'HIDEPAGE',
              pageId: page1.id
            }
          }
        ])
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to match_array([
          {
            effect: 'HIDE',
            condition: {
              scope: "#/properties/#{question1.key}",
              schema: {
                enum: [1]
              }
            }
          },
          {
            effect: 'HIDE',
            condition: {
              scope: "#/properties/#{question1.key}",
              schema: {
                enum: [2]
              }
            }
          },
          {
            effect: 'HIDE',
            condition: {
              type: 'HIDEPAGE',
              pageId: page1.id
            }
          }
        ])
        expect(form_logic.ui_schema_rules_for(page4)).to match_array([
          {
            effect: 'HIDE',
            condition: {
              scope: "#/properties/#{question1.key}",
              schema: {
                enum: [1]
              }
            }
          },
          {
            effect: 'HIDE',
            condition: {
              scope: "#/properties/#{question1.key}",
              schema: {
                enum: [2]
              }
            }
          },
          {
            effect: 'HIDE',
            condition: {
              type: 'HIDEPAGE',
              pageId: page1.id
            }
          }
        ])
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when an answer triggers going to a page' do
      before do
        question1.update!(logic: {
          'rules' => [{ 'if' => question1_value, 'goto_page_id' => page4.id }]
        })
        question2.update!(logic: {
          'rules' => [{ 'if' => question2_answer.id, 'goto_page_id' => page5.id }]
        })
      end

      it 'returns a UI schema with rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [question1_value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [question1_value]
            }
          }
        }, {
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question2.key}",
            schema: {
              enum: [question2_answer.key]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page4)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question2.key}",
            schema: {
              enum: [question2_answer.key]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when an answer triggers going to the next page' do
      before do
        question1.update!(logic: {
          'rules' => [{ 'if' => question1_value, 'goto_page_id' => page2.id }]
        })
      end

      it 'returns a UI schema without rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to be_nil
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to be_nil
        expect(form_logic.ui_schema_rules_for(page4)).to be_nil
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when an answer triggers going to the last page' do
      before do
        question1.update!(logic: {
          'rules' => [{ 'if' => question1_value, 'goto_page_id' => page5.id }]
        })
      end

      it 'returns a UI schema with rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [question1_value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [question1_value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page4)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [question1_value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when an answer triggers going to the survey end' do
      before do
        question1.update!(
          logic: {
            'rules' => [{ 'if' => question1_value, 'goto_page_id' => 'survey_end' }]
          },
          required: true
        )
      end

      it 'returns a UI schema with rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [question1_value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [question1_value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page4)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [question1_value]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page5)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question1.key}",
            schema: {
              enum: [question1_value]
            }
          }
        }])
      end
    end

    context 'when any other answer triggers going to another page' do
      before do
        # question2.update!(logic: {
        #   'rules' => [
        #     { 'if' => option1.id, 'goto_page_id' => page4.id },
        #     { 'if' => option2.id, 'goto_page_id' => page4.id }
        #   ]
        # })
        question2.update!(logic: {
          'rules' => [
            { 'if' => 'any_other_answer', 'goto_page_id' => page4.id }
          ]
        })
      end

      it 'returns a UI schema with rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to be_nil
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question2.key}",
            schema: {
              enum: [option1.key]
            }
          }
        },
          {
            effect: 'HIDE',
            condition: {
              scope: "#/properties/#{question2.key}",
              schema: {
                enum: [option2.key]
              }
            }
          }])
        expect(form_logic.ui_schema_rules_for(page4)).to be_nil
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end

    context 'when one answer triggers going to one page and any other answer triggers going to another page' do
      before do
        question2.update!(logic: {
          'rules' => [
            { 'if' => option1.id, 'goto_page_id' => page4.id },
            { 'if' => 'any_other_answer', 'goto_page_id' => page5.id }
          ]
        })
      end

      it 'returns a UI schema with rules for the given page' do
        expect(form_logic.ui_schema_rules_for(page1)).to be_nil
        expect(form_logic.ui_schema_rules_for(question1)).to be_nil
        expect(form_logic.ui_schema_rules_for(page2)).to be_nil
        expect(form_logic.ui_schema_rules_for(question2)).to be_nil
        expect(form_logic.ui_schema_rules_for(page3)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question2.key}",
            schema: {
              enum: [option1.key]
            }
          }
        },
          {
            effect: 'HIDE',
            condition: {
              scope: "#/properties/#{question2.key}",
              schema: {
                enum: [option2.key]
              }
            }
          }])
        expect(form_logic.ui_schema_rules_for(page4)).to eq([{
          effect: 'HIDE',
          condition: {
            scope: "#/properties/#{question2.key}",
            schema: {
              enum: [option2.key]
            }
          }
        }])
        expect(form_logic.ui_schema_rules_for(page5)).to be_nil
      end
    end
  end

  describe '#valid?' do
    let(:page1) { fields[0] }
    let(:question1) { fields[1] }
    let(:page2) { fields[2] }
    let(:question2) { fields[3] }
    let(:page3) { fields[4] }
    let(:page4) { fields[5] }
    let(:page5) { fields[6] }
    let(:section1) { fields[7] }

    context 'for logic on questions' do
      context 'when logic has a good structure' do
        it 'returns true' do
          [
            {},
            { 'rules' => [] },
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] },
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] },
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => 'survey_end' }] },
            { 'rules' => [
              { 'if' => 1, 'goto_page_id' => page2.id },
              { 'if' => 2, 'goto_page_id' => page4.id },
              { 'if' => 'no_answer', 'goto_page_id' => page2.id },
              { 'if' => 'any_other_answer', 'goto_page_id' => page2.id }
            ] }
          ].each do |good_logic|
            question1.update! logic: good_logic, required: true

            expect(form_logic.valid?).to be true
            expect(question1.errors).to be_empty
            expect(question2.errors).to be_empty
          end
        end
      end

      context 'when all logic in multiple fields have good structure' do
        let(:logic_for_question1) do
          { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] }
        end
        let(:logic_for_question2) do
          { 'rules' => [
            { 'if' => 1, 'goto_page_id' => 'survey_end' },
            { 'if' => 2, 'goto_page_id' => page4.id },
            { 'if' => 'no_answer', 'goto_page_id' => 'survey_end' },
            { 'if' => 'any_other_answer', 'goto_page_id' => page4.id }
          ] }
        end

        it 'returns true' do
          question1.update! logic: logic_for_question1, required: true
          question2.update! logic: logic_for_question2, required: true

          expect(form_logic.valid?).to be true
          expect(question1.errors).to be_empty
          expect(question2.errors).to be_empty
        end
      end

      context 'when logic has a bad structure' do
        it 'returns false' do
          [
            { 'bad' => [] },
            { 'rules' => [], 'bad' => [] },
            { 'rules' => [{}] },
            { 'rules' => [{ 'test' => {} }] },
            { 'rules' => [{ 'if' => 1 }] },
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id, 'bad' => {} }] }
          ].each do |bad_logic|
            question1.update! logic: bad_logic, required: true
            expect(form_logic.valid?).to be false
            expect(question1.errors.messages.to_h).to eq({
              logic: ['has invalid structure']
            })
            expect(question1.errors.details).to eq({
              logic: [{ error: :invalid_structure }]
            })
          end
        end
      end

      context 'when a field has logic, but it is not required' do
        let(:logic_for_question1) do
          { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] }
        end
        let(:logic_for_question2) do
          { 'rules' => [{ 'if' => 1, 'goto_page_id' => 'survey_end' }] }
        end

        it 'returns false' do
          question1.update! logic: logic_for_question1, required: false
          question2.update! logic: logic_for_question2, required: false

          expect(form_logic.valid?).to be false
          expect(question1.errors.messages.to_h).to eq({
            logic: ['allowed only on required fields']
          })
          expect(question1.errors.details).to eq({
            logic: [{ error: :only_allowed_on_required_fields }]
          })
          expect(question2.errors.messages.to_h).to eq({
            logic: ['allowed only on required fields']
          })
          expect(question2.errors.details).to eq({
            logic: [{ error: :only_allowed_on_required_fields }]
          })
        end
      end

      context 'when some logic in multiple fields has bad structure' do
        let(:logic_for_question1) do
          { 'rules' => [{ 'if' => 1, 'goto_page_id' => page2.id }] }
        end
        let(:logic_for_question2) do
          { 'rules' => [
            { 'if' => 1, 'goto_page_id' => 'survey_end' },
            { 'if' => 2 }
          ] }
        end

        it 'returns true' do
          question1.update! logic: logic_for_question1, required: true
          question2.update! logic: logic_for_question2, required: true

          expect(form_logic.valid?).to be false
          expect(question1.errors).to be_empty
          expect(question2.errors.messages.to_h).to eq({
            logic: ['has invalid structure']
          })
          expect(question2.errors.details).to eq({
            logic: [{ error: :invalid_structure }]
          })
        end
      end

      context 'when logic has invalid goto_page_id' do
        it 'returns false' do
          invalid_goto_page_id = create(:custom_field_page).id
          [
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => invalid_goto_page_id }] },
            { 'rules' => [
              { 'if' => 1, 'goto_page_id' => invalid_goto_page_id },
              { 'if' => 2, 'goto_page_id' => page4.id }
            ] }
          ].each do |bad_logic|
            question1.update! logic: bad_logic, required: true

            expect(form_logic.valid?).to be false
            expect(question1.errors.messages.to_h).to eq({
              logic: ['has invalid goto_page_id']
            })
            expect(question1.errors.details).to eq({
              logic: [{ error: :invalid_goto_page_id, value: invalid_goto_page_id }]
            })
          end
        end
      end

      context 'when logic has target pages that occur before the source field' do
        it 'returns false' do
          invalid_goto_page_id = page1.id
          [
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => invalid_goto_page_id }] },
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => invalid_goto_page_id }] }
          ].each do |bad_logic|
            question1.update! logic: bad_logic, required: true

            expect(form_logic.valid?).to be false
            expect(question1.errors.messages.to_h).to eq({
              logic: ['has target before source']
            })
            expect(question1.errors.details).to eq({
              logic: [{ error: :target_before_source_not_allowed, value: invalid_goto_page_id }]
            })
          end
        end
      end

      context 'when logic has target fields that are not pages' do
        it 'returns false' do
          invalid_goto_page_id = question2.id
          [
            { 'rules' => [{ 'if' => 1, 'goto_page_id' => invalid_goto_page_id }] },
            { 'rules' => [
              { 'if' => 1, 'goto_page_id' => page2.id },
              { 'if' => 2, 'goto_page_id' => invalid_goto_page_id }
            ] }
          ].each do |bad_logic|
            question1.update! logic: bad_logic, required: true

            expect(form_logic.valid?).to be false
            expect(question1.errors.messages.to_h).to eq({
              logic: ['has target that is not a page']
            })
            expect(question1.errors.details).to eq({
              logic: [{ error: :only_page_allowed_as_target, value: invalid_goto_page_id }]
            })
          end
        end
      end
    end

    context 'for logic on pages' do
      context 'when logic has a good structure' do
        it 'returns true' do
          [
            {},
            { 'next_page_id' => page3.id },
            { 'next_page_id' => page4.id },
            { 'next_page_id' => page5.id }
          ].each do |good_logic|
            page2.update! logic: good_logic, required: true

            expect(form_logic.valid?).to be true
            expect(page1.errors).to be_empty
            expect(question1.errors).to be_empty
            expect(page2.errors).to be_empty
            expect(question2.errors).to be_empty
            expect(page3.errors).to be_empty
            expect(page4.errors).to be_empty
            expect(page5.errors).to be_empty
          end
        end
      end

      context 'when all logic in multiple pages have good structure' do
        let(:logic_for_page1) { { 'next_page_id' => page4.id } }
        let(:logic_for_page2) { { 'next_page_id' => page5.id } }

        it 'returns true' do
          page1.update! logic: logic_for_page1, required: true
          page2.update! logic: logic_for_page2, required: true

          expect(form_logic.valid?).to be true
          expect(page1.errors).to be_empty
          expect(question1.errors).to be_empty
          expect(page2.errors).to be_empty
          expect(question2.errors).to be_empty
          expect(page3.errors).to be_empty
          expect(page4.errors).to be_empty
          expect(page5.errors).to be_empty
        end
      end

      context 'when logic has a bad structure' do
        it 'returns false' do
          bad_logic = { 'bad' => page5.id }
          page2.update! logic: bad_logic, required: true
          expect(form_logic.valid?).to be false
          expect(page1.errors).to be_empty
          expect(question1.errors).to be_empty
          expect(page2.errors.messages.to_h).to eq({
            logic: ['has invalid structure']
          })
          expect(page2.errors.details).to eq({
            logic: [{ error: :invalid_structure }]
          })
          expect(question2.errors).to be_empty
          expect(page3.errors).to be_empty
          expect(page4.errors).to be_empty
          expect(page5.errors).to be_empty
        end
      end

      context 'when logic has invalid next_page_id' do
        it 'returns false' do
          invalid_next_page_id = create(:custom_field_page).id
          bad_logic = { 'next_page_id' => invalid_next_page_id }
          page2.update! logic: bad_logic, required: true

          expect(form_logic.valid?).to be false
          expect(page1.errors).to be_empty
          expect(question1.errors).to be_empty
          expect(page2.errors.messages.to_h).to eq({
            logic: ['has invalid next_page_id']
          })
          expect(page2.errors.details).to eq({
            logic: [{ error: :invalid_next_page_id, value: invalid_next_page_id }]
          })
          expect(question2.errors).to be_empty
          expect(page3.errors).to be_empty
          expect(page4.errors).to be_empty
          expect(page5.errors).to be_empty
        end
      end

      context 'when logic has a target page that does not follow the source page' do
        it 'returns false' do
          [
            page1.id,
            page2.id,
            page3.id
          ].each do |bad_page_id|
            page3.update! logic: { 'next_page_id' => bad_page_id }, required: true

            expect(form_logic.valid?).to be false
            expect(page1.errors).to be_empty
            expect(question1.errors).to be_empty
            expect(page2.errors).to be_empty
            expect(question1.errors).to be_empty
            expect(page3.errors.messages.to_h).to eq({
              logic: ['has target before source']
            })
            expect(page3.errors.details).to eq({
              logic: [{ error: :target_before_source_not_allowed, value: bad_page_id }]
            })
            expect(page4.errors).to be_empty
            expect(page5.errors).to be_empty
          end
        end
      end

      context 'when logic has a target that is not a page' do
        it 'returns false' do
          invalid_next_page_id = question2.id
          bad_logic = { 'next_page_id' => invalid_next_page_id }
          page1.update! logic: bad_logic, required: true

          expect(form_logic.valid?).to be false
          expect(page1.errors.messages.to_h).to eq({
            logic: ['has target that is not a page']
          })
          expect(page1.errors.details).to eq({
            logic: [{ error: :only_page_allowed_as_target, value: invalid_next_page_id }]
          })
        end
      end
    end

    context 'for logic on sections' do
      context 'when logic is added to sections' do
        it 'returns false' do
          logic = { 'next_page_id' => 1 }
          section1.update! logic: logic, required: true
          expect(form_logic.valid?).to be false
          expect(section1.errors.messages.to_h).to eq({
            logic: ['not allowed on section fields']
          })
          expect(section1.errors.details).to eq({
            logic: [{ error: :not_allowed_on_section_fields }]
          })
        end
      end
    end
  end

  describe '#replace_temp_ids_in_field_logic!' do
    let(:page1) { fields[2] }
    let(:question1) { fields[3] }
    let(:option1) { question1.options[0] }
    let(:option2) { question1.options[1] }
    let(:page2) { fields[4] }

    before do
      question1.update!(logic: {
        'rules' => [
          { 'if' => option1.id, 'goto_page_id' => page2.id },
          { 'if' => 'NON_EXISTENT_ID', 'goto_page_id' => page2.id }
        ]
      })
    end

    it 'silently removes rules on select fields with option ids that do not exist' do
      form_logic.replace_temp_ids!({}, {})

      expect(question1.reload.logic).to eq('rules' => [{ 'if' => option1.id, 'goto_page_id' => page2.id }])
    end
  end
end

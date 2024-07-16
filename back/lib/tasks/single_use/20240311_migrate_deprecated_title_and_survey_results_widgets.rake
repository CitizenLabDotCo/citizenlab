# frozen_string_literal: true

namespace :single_use do
  desc 'Fix existing layouts'
  task migrate_deprecated_title_and_survey_results_widgets: [:environment] do |_t, _args|
    content_buildable_type = 'ReportBuilder::Report'

    def resolved_name(node)
      type = node['type']
      type['resolvedName'] if type.is_a?(Hash)
    end

    def survey_question_node(phase, project, question, parent)
      {
        'type' => { 'resolvedName' => 'SurveyQuestionResultWidget' },
        'nodes' => [],
        'props' => {
          'phaseId' => phase.id,
          'projectId' => project.id,
          'questionId' => question.id
        },
        'custom' => {},
        'hidden' => false,
        'parent' => parent,
        'isCanvas' => false,
        'displayName' => 'SurveyQuestionResultWidget',
        'linkedNodes' => {}
      }
    end

    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      tenant.switch do
        Rails.logger.info tenant.host

        layouts = ContentBuilder::Layout.where(content_buildable_type: content_buildable_type)
        layouts.each do |layout|
          layout.craftjs_json.dup.each do |(node_id, node)|
            node['custom'] = {} # we previously stored some data here, but it's not used

            case resolved_name(node)
            when 'TitleMultiloc'
              node['type']['resolvedName'] = 'TextMultiloc'
              node['custom'] = {}
              node['props']['text'].transform_values! { |text| "<h3>#{text}</h3>" }
            when 'SurveyResultsWidget'
              phase = Phase.find_by(id: node['props']['phaseId'])
              project = Project.find_by(id: node['props']['projectId'])
              if phase.nil? || project.nil?
                Rails.logger.info "Phase or project not found for SurveyResultsWidget. layout.id: #{layout.id}, projectId: #{node['props']['projectId']} phaseId: #{node['props']['phaseId']}"
                layout.craftjs_json.delete(node_id)
                layout.craftjs_json[node['parent']]['nodes'].delete(node_id)
                next
              end

              # Includes SurveyResultsGeneratorService#visit_* methods
              # and ignores these fields front/app/containers/Admin/reporting/components/ReportBuilder/Widgets/_deprecated/SurveyResultsWidget/QuestionFilter.tsx:34
              selected_input_types = %w[select multiselect linear_scale]
              custom_fields = phase.custom_form.custom_fields.select do |field|
                selected_input_types.include?(field.input_type)
              end
              shown_questions = node['props']['shownQuestions'] || custom_fields.map { true }

              new_node_ids = shown_questions.map.with_index do |show_question, index|
                next unless show_question

                question = custom_fields[index]
                new_node = survey_question_node(phase, project, question, node['parent'])
                # The length is 10 https://github.com/prevwong/craft.js/blob/v0.2.0-beta.5/packages/utils/src/getRandomId.ts#L12
                # The characters that can be used https://github.com/ai/nanoid/blob/main/url-alphabet/index.js#L5
                new_node_id = SecureRandom.urlsafe_base64.first(10)
                layout.craftjs_json[new_node_id] = new_node
                new_node_id
              end.compact

              layout.craftjs_json[node['parent']]['nodes'].map! do |child_node_id|
                child_node_id == node_id ? new_node_ids : child_node_id
              end.flatten!
              layout.craftjs_json.delete(node_id)
            end
          end

          if layout.changed?
            layout.save!
            Rails.logger.info "Updated #{layout.id}"
          end
        end
      end
    end
  end
end

# frozen_string_literal: true

FactoryBot.define do
  factory(
    :text_network_analysis_task_view,
    aliases: [:tna_task_view],
    class: 'Insights::TextNetworkAnalysisTaskView'
  ) do
    task factory: :tna_task
    view
    language { 'en' }
  end
end

# This migration comes from polls (originally 20191209172704)
class AddQuestionTypeToQuestions < ActiveRecord::Migration[5.2]
  def change
    add_column :polls_questions, :question_type, :string, null: false, default: 'single_option'
    add_column :polls_questions, :max_options, :integer, null: true
  end
end

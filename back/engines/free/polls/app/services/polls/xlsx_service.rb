# frozen_string_literal: true

module Polls
  class XlsxService
    def generate_poll_results_xlsx(participation_context, responses, current_user)
      multiloc_service = MultilocService.new
      is_anonymous = participation_context.poll_anonymous?
      questions = Polls::Question
        .where(participation_context: participation_context)
        .order(:ordering)

      columns = questions.map do |q|
        {
          header: multiloc_service.t(q.title_multiloc),
          f: ->(r) { extract_responses(r, q.id, multiloc_service) }
        }
      end
      columns += compute_user_columns is_anonymous, current_user.admin?

      ::XlsxService.new.generate_xlsx 'Poll results', columns, responses
    end

    private

    def compute_user_columns(is_anonymous, is_admin)
      return [] if is_anonymous

      columns = [
        { header: 'User ID',    f: ->(r) { r.user_id }, skip_sanitization: true },
        { header: 'First Name', f: ->(r) { r.user.first_name } },
        { header: 'Last Name',  f: ->(r) { r.user.last_name } }
      ]

      columns << { header: 'Email', f: ->(r) { r.user.email } } if is_admin
      columns.concat ::XlsxService.new.user_custom_field_columns(:user)

      columns
    end

    def extract_responses(response_obj, question_id, multiloc_service)
      resp_opts = response_obj.response_options.select { |ro| ro.option.question_id == question_id }
      return '' if resp_opts.blank?

      resp_opts
        .map { |ro| multiloc_service.t(ro.option.title_multiloc) }
        .join(', ')
    end
  end
end

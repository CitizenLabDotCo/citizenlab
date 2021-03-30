module UserCustomFields
  module WebApi
    module V1
      class StatsUsersController < ::WebApi::V1::StatsController

        @@multiloc_service = MultilocService.new


        def users_by_gender_serie
          users = StatUserPolicy::Scope.new(current_user, User.active).resolve

          if params[:group]
            group = Group.find(params[:group])
            users = users.merge(group.members)
          end

          ps = ParticipantsService.new

          if params[:project]
            project = Project.find(params[:project])
            participants = ps.project_participants(project)
            users = users.where(id: participants)
          end

          serie = users
            .where(registration_completed_at: @start_at..@end_at)
            .group("custom_field_values->'gender'")
            .order(Arel.sql("custom_field_values->'gender'"))
            .count

          serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?

          serie
        end

        def users_by_gender
          render json: {series: {users: users_by_gender_serie}}
        end

        def users_by_gender_as_xlsx
          xlsx = XlsxService.new.generate_field_stats_xlsx users_by_gender_serie, 'gender', 'users'
          send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'users_by_gender.xlsx'
        end

        def users_by_birthyear_serie
          users = StatUserPolicy::Scope.new(current_user, User.active).resolve

          if params[:group]
            group = Group.find(params[:group])
            users = users.merge(group.members)
          end

          ps = ParticipantsService.new

          if params[:project]
            project = Project.find(params[:project])
            participants = ps.project_participants(project)
            users = users.where(id: participants)
          end

          serie = users
            .where(registration_completed_at: @start_at..@end_at)
            .group("custom_field_values->'birthyear'")
            .order(Arel.sql("custom_field_values->'birthyear'"))
            .count
          serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?

          serie
        end

        def users_by_birthyear
          render json: {series: {users: users_by_birthyear_serie}}
        end

        def users_by_birthyear_as_xlsx
          xlsx = XlsxService.new.generate_field_stats_xlsx users_by_birthyear_serie, 'birthyear', 'users'
          send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'users_by_birthyear.xlsx'
        end

        def users_by_domicile_serie
          users = StatUserPolicy::Scope.new(current_user, User.active).resolve

          if params[:group]
            group = Group.find(params[:group])
            users = users.merge(group.members)
          end

          ps = ParticipantsService.new

          if params[:project]
            project = Project.find(params[:project])
            participants = ps.project_participants(project)
            users = users.where(id: participants)
          end

          serie = users
            .where(registration_completed_at: @start_at..@end_at)
            .group("custom_field_values->'domicile'")
            .order(Arel.sql("custom_field_values->'domicile'"))
            .count
          serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?

          serie
        end

        def users_by_domicile
          serie = users_by_domicile_serie
          areas = Area.all.select(:id, :title_multiloc)
          render json: {series: {users: serie}, areas: areas.map{|a| [a.id, a.attributes.except('id')]}.to_h}
        end

        def users_by_domicile_as_xlsx
          serie = users_by_domicile_serie
          res = Area.all.map {  |area|
            {
              "area_id" => area.id,
              "area" => @@multiloc_service.t(area.title_multiloc),
              "users" => serie.find{|entry| entry[0] == area.id}&.at(1) || 0
            }
          }
          res.push({
            "area_id" => "_blank",
            "area" => "unknown",
            "users" => serie.delete(nil) || 0
            }) unless serie.empty?

          xlsx = XlsxService.new.generate_res_stats_xlsx res, 'users', 'area'
          send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'users_by_domicile.xlsx'
        end

        def users_by_education_serie
          users = StatUserPolicy::Scope.new(current_user, User.active).resolve

          if params[:group]
            group = Group.find(params[:group])
            users = users.merge(group.members)
          end

          ps = ParticipantsService.new

          if params[:project]
            project = Project.find(params[:project])
            participants = ps.project_participants(project)
            users = users.where(id: participants)
          end

          serie = users
            .where(registration_completed_at: @start_at..@end_at)
            .group("custom_field_values->'education'")
            .order(Arel.sql("custom_field_values->'education'"))
            .count
          serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?

          serie
        end
        
        def users_by_education
          render json: {series: {users: users_by_education_serie}}
        end

        def users_by_education_as_xlsx
          xlsx = XlsxService.new.generate_field_stats_xlsx users_by_education_serie, 'education', 'users'
          send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'users_by_education.xlsx'
        end

        def users_by_custom_field_serie
          users = StatUserPolicy::Scope.new(current_user, User.active).resolve

          if params[:group]
            group = Group.find(params[:group])
            users = users.merge(group.members)
          end

          ps = ParticipantsService.new

          if params[:project]
            project = Project.find(params[:project])
            participants = ps.project_participants(project)
            users = users.where(id: participants)
          end

          case @custom_field.input_type
          when 'select'
            serie = users
              .where(registration_completed_at: @start_at..@end_at)
              .group("custom_field_values->'#{@custom_field.key}'")
              .order(Arel.sql("custom_field_values->'#{@custom_field.key}'"))
              .count
            serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?
            serie
          when 'multiselect'
            serie = users
              .joins("LEFT OUTER JOIN (SELECT jsonb_array_elements(custom_field_values->'#{@custom_field.key}') as field_value, id FROM users) as cfv ON users.id = cfv.id")
              .where(registration_completed_at: @start_at..@end_at)
              .group('cfv.field_value')
              .order('cfv.field_value')
              .count
            serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?
            serie
          when 'checkbox'
            serie = users
              .where(registration_completed_at: @start_at..@end_at)
              .group("custom_field_values->'#{@custom_field.key}'")
              .order(Arel.sql("custom_field_values->'#{@custom_field.key}'"))
              .count
            serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?
            serie
          else
            head :not_implemented
          end
        end

        def users_by_custom_field
          @custom_field = CustomField.find(params[:custom_field_id])
          serie = users_by_custom_field_serie
          if ['select', 'multiselect'].include?(@custom_field.input_type)
            options = @custom_field.custom_field_options.select(:key, :title_multiloc)
            render json: {series: {users: serie}, options: options.map{|o| [o.key, o.attributes.except('key', 'id')]}.to_h}
          else
            render json: {series: {users: serie}}
          end
        end

        def users_by_custom_field_as_xlsx
          @custom_field = CustomField.find(params[:custom_field_id])

          if ['select', 'multiselect'].include?(@custom_field.input_type)
            serie = users_by_custom_field_serie
            options = @custom_field.custom_field_options.select(:key, :title_multiloc)

            res = options.map { |option|
              {
                'option_id' => option.key,
                'option' => @@multiloc_service.t(option.title_multiloc),
                'users' => serie[option.key] || 0
              }
            }
            res.push({
              'option_id' => '_blank',
              'option' =>'unknown',
              'users' => serie['_blank'] || 0
              })
            xlsx = XlsxService.new.generate_res_stats_xlsx res, 'users', 'option'
            send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'users_by_custom_field.xlsx'
          else
            xlsx = XlsxService.new.generate_field_stats_xlsx users_by_custom_field_serie, 'option', 'users'
            send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'users_by_custom_field.xlsx'
          end
        end

        private

        def do_authorize
          authorize :'user_custom_fields/stat_user'
        end

      end
    end
  end
end

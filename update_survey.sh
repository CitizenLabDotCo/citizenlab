#!/bin/bash

# The JSON payload containing the 10-page survey with restricted question types.
DATA=$'
{
  "custom_fields": [
    {
      "id": "page-01-welcome", "input_type": "page", "enabled": true, "title_multiloc": { "en": "Welcome to the Team! (1/9)" },
      "description_multiloc": { "en": "<p>We\'re so glad to have you. This survey helps us improve our onboarding process. Let\'s start with one general question.</p>" },
      "key": "page1", "page_layout": "default"
    },
    {
      "id": "q-01-overall-exp", "input_type": "linear_scale", "enabled": true, "required": true,
      "title_multiloc": { "en": "Overall, how would you rate your onboarding experience so far?" },
      "key": "overall_onboarding_experience", "maximum": "10",
      "linear_scale_label_1_multiloc": { "en": "Poor" }, "linear_scale_label_10_multiloc": { "en": "Excellent" }
    },
    {
      "id": "page-02-pre-board", "input_type": "page", "enabled": true, "title_multiloc": { "en": "Before Your First Day (2/9)" }, "key": "page2", "page_layout": "default"
    },
    {
      "id": "q-02-hiring-clarity", "input_type": "select", "enabled": true, "title_multiloc": { "en": "How clear was the communication from our HR team before you started?" }, "key": "hr_comm_clarity", "options": [
        { "id": "opt-hr-1", "key": "very_clear", "title_multiloc": {"en": "Very Clear"} }, { "id": "opt-hr-2", "key": "clear", "title_multiloc": {"en": "Clear"} },
        { "id": "opt-hr-3", "key": "neutral", "title_multiloc": {"en": "Neutral"} }, { "id": "opt-hr-4", "key": "unclear", "title_multiloc": {"en": "Unclear"} }
      ]
    },
    { "id": "q-03-contract", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Was the process of signing your contract straightforward?" }, "key": "contract_process", "options": [
        { "id": "opt-con-1", "key": "yes", "title_multiloc": {"en": "Yes, very easy"} }, { "id": "opt-con-2", "key": "no", "title_multiloc": {"en": "No, it was confusing"} }
      ]
    },
    { "id": "q-04-equipment", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Did your work equipment (laptop, etc.) arrive on time?" }, "key": "equipment_arrival", "options": [
        { "id": "opt-eq-1", "key": "yes_early", "title_multiloc": {"en": "Yes, it was early"} }, { "id": "opt-eq-2", "key": "yes_on_time", "title_multiloc": {"en": "Yes, just in time"} }, { "id": "opt-eq-3", "key": "no_late", "title_multiloc": {"en": "No, it was late"} }
      ]
    },
    { "id": "q-05-first-day-info", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Did you receive all the necessary information for your first day?" }, "key": "first_day_info", "options": [
        { "id": "opt-info-1", "key": "yes_all", "title_multiloc": {"en": "Yes, I had everything I needed"} }, { "id": "opt-info-2", "key": "mostly", "title_multiloc": {"en": "Mostly, but some things were missing"} }, { "id": "opt-info-3", "key": "no", "title_multiloc": {"en": "No, I felt unprepared"} }
      ]
    },
    { "id": "q-06-pre-start-anxiety", "input_type": "linear_scale", "enabled": true, "title_multiloc": { "en": "On a scale of 1 (Anxious) to 5 (Excited), how did you feel the weekend before you started?" }, "key": "pre_start_feeling", "maximum": "5",
      "linear_scale_label_1_multiloc": { "en": "Anxious" }, "linear_scale_label_5_multiloc": { "en": "Excited" }
    },
    { "id": "page-03-first-week", "input_type": "page", "enabled": true, "title_multiloc": { "en": "Your First Week (3/9)" }, "key": "page3", "page_layout": "default"
    },
    { "id": "q-07-team-welcome", "input_type": "select", "enabled": true, "title_multiloc": { "en": "How welcomed did you feel by your direct team?" }, "key": "team_welcome", "options": [
        { "id": "opt-wel-1", "key": "very", "title_multiloc": {"en": "Very welcomed"} }, { "id": "opt-wel-2", "key": "somewhat", "title_multiloc": {"en": "Somewhat welcomed"} }, { "id": "opt-wel-3", "key": "not_at_all", "title_multiloc": {"en": "Not at all"} }
      ]
    },
    { "id": "q-08-first-tasks", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Were your first tasks and objectives clear?" }, "key": "first_tasks_clarity", "options": [
        { "id": "opt-tsk-1", "key": "very_clear", "title_multiloc": {"en": "Very Clear"} }, { "id": "opt-tsk-2", "key": "mostly_clear", "title_multiloc": {"en": "Mostly Clear"} }, { "id": "opt-tsk-3", "key": "confusing", "title_multiloc": {"en": "Confusing"} }
      ]
    },
    { "id": "q-09-tool-access", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Did you have access to all the necessary tools (Slack, Jira, etc.) by the end of Day 1?" }, "key": "tool_access", "options": [
        { "id": "opt-tool-1", "key": "yes_all", "title_multiloc": {"en": "Yes, everything worked"} }, { "id": "opt-tool-2", "key": "some_missing", "title_multiloc": {"en": "I was missing access to some tools"} }, { "id": "opt-tool-3", "key": "major_issues", "title_multiloc": {"en": "I had major access issues"} }
      ]
    },
    { "id": "q-10-manager-checkin", "input_type": "select", "enabled": true, "title_multiloc": { "en": "How frequent were check-ins with your manager during the first week?" }, "key": "manager_checkins", "options": [
        { "id": "opt-mgr-1", "key": "daily", "title_multiloc": {"en": "Daily"} }, { "id": "opt-mgr-2", "key": "a_few_times", "title_multiloc": {"en": "A few times"} }, { "id": "opt-mgr-3", "key": "once_or_twice", "title_multiloc": {"en": "Once or twice"} }, { "id": "opt-mgr-4", "key": "not_at_all", "title_multiloc": {"en": "Not at all"} }
      ]
    },
    { "id": "q-11-week-one-word", "input_type": "multiline_text", "enabled": true, "title_multiloc": { "en": "Describe your first week in one word." }, "key": "first_week_one_word" },
    { "id": "page-04-tools", "input_type": "page", "enabled": true, "title_multiloc": { "en": "Tools & Technology (4/9)" }, "key": "page4", "page_layout": "default"
    },
    { "id": "q-12-it-support", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Have you needed to contact IT support yet?" }, "key": "it_support_contact", "options": [
        { "id": "opt-it-1", "key": "yes_positive", "title_multiloc": {"en": "Yes, and it was a positive experience"} }, { "id": "opt-it-2", "key": "yes_negative", "title_multiloc": {"en": "Yes, and it was a negative experience"} }, { "id": "opt-it-3", "key": "no", "title_multiloc": {"en": "No, I haven\'t needed to"} }
      ]
    },
    { "id": "q-13-laptop-perf", "input_type": "linear_scale", "enabled": true, "title_multiloc": { "en": "How would you rate your computer\'s performance?" }, "key": "laptop_performance", "maximum": "5",
      "linear_scale_label_1_multiloc": { "en": "Slow" }, "linear_scale_label_5_multiloc": { "en": "Very Fast" }
    },
    { "id": "q-14-software-training", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Have you received adequate training on our primary software tools?" }, "key": "software_training", "options": [
        { "id": "opt-train-1", "key": "yes", "title_multiloc": {"en": "Yes"} }, { "id": "opt-train-2", "key": "somewhat", "title_multiloc": {"en": "Somewhat"} }, { "id": "opt-train-3", "key": "no", "title_multiloc": {"en": "No"} }
      ]
    },
    { "id": "q-15-missing-tools", "input_type": "multiselect", "enabled": true, "title_multiloc": { "en": "Are there any tools you feel you are missing to do your job effectively?" }, "key": "missing_tools", "options": [
        { "id": "opt-miss-1", "key": "design_software", "title_multiloc": {"en": "Design Software (e.g., Figma)"} }, { "id": "opt-miss-2", "key": "project_management", "title_multiloc": {"en": "Project Management Tool"} }, { "id": "opt-miss-3", "key": "communication", "title_multiloc": {"en": "Communication Tool"} }, { "id": "opt-miss-4", "key": "no_im_set", "title_multiloc": {"en": "No, I have everything I need"} }
      ]
    },
    { "id": "q-16-tool-frustration", "input_type": "multiline_text", "enabled": true, "title_multiloc": { "en": "Is there any tool or process you find particularly frustrating?" }, "key": "tool_frustration_text" },
    { "id": "page-05-team-manager", "input_type": "page", "enabled": true, "title_multiloc": { "en": "Team & Manager (5/9)" }, "key": "page5", "page_layout": "default"
    },
    { "id": "q-17-manager-support", "input_type": "select", "enabled": true, "title_multiloc": { "en": "How supportive has your manager been?" }, "key": "manager_support", "options": [
        { "id": "opt-sup-1", "key": "very", "title_multiloc": {"en": "Very Supportive"} }, { "id": "opt-sup-2", "key": "moderately", "title_multiloc": {"en": "Moderately Supportive"} }, { "id": "opt-sup-3", "key": "not_supportive", "title_multiloc": {"en": "Not Supportive"} }
      ]
    },
    { "id": "q-18-feedback-freq", "input_type": "select", "enabled": true, "title_multiloc": { "en": "How often do you receive feedback on your work?" }, "key": "feedback_frequency", "dropdown_layout": true, "options": [
        { "id": "opt-feed-1", "key": "daily", "title_multiloc": {"en": "Daily"} }, { "id": "opt-feed-2", "key": "weekly", "title_multiloc": {"en": "Weekly"} }, { "id": "opt-feed-3", "key": "rarely", "title_multiloc": {"en": "Rarely"} }, { "id": "opt-feed-4", "key": "never", "title_multiloc": {"en": "Never"} }
      ]
    },
    { "id": "q-19-team-collab", "input_type": "linear_scale", "enabled": true, "title_multiloc": { "en": "Rate the collaboration within your team." }, "key": "team_collaboration", "maximum": "5",
      "linear_scale_label_1_multiloc": { "en": "Poor" }, "linear_scale_label_5_multiloc": { "en": "Excellent" }
    },
    { "id": "q-20-role-clarity", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Do you have a clear understanding of your role and responsibilities?" }, "key": "role_clarity", "options": [
        { "id": "opt-role-1", "key": "yes", "title_multiloc": {"en": "Yes, completely"} }, { "id": "opt-role-2", "key": "mostly", "title_multiloc": {"en": "Mostly"} }, { "id": "opt-role-3", "key": "no", "title_multiloc": {"en": "No, it\'s unclear"} }
      ]
    },
    { "id": "q-21-one-on-ones", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Do you find your 1-on-1 meetings with your manager valuable?" }, "key": "one_on_one_value", "options": [
        { "id": "opt-1o1-1", "key": "very", "title_multiloc": {"en": "Very valuable"} }, { "id": "opt-1o1-2", "key": "somewhat", "title_multiloc": {"en": "Somewhat valuable"} }, { "id": "opt-1o1-3", "key": "not_valuable", "title_multiloc": {"en": "Not valuable"} }, { "id": "opt-1o1-4", "key": "dont_have_them", "title_multiloc": {"en": "We don\'t have them"} }
      ]
    },
    { "id": "page-06-mid-point", "input_type": "page", "enabled": true, "title_multiloc": { "en": "Mid-Point Check-in (6/9)" }, "key": "page6", "page_layout": "default"
    },
    { "id": "q-22-one-improvement", "input_type": "multiline_text", "enabled": true, "title_multiloc": { "en": "What is ONE thing we could do to improve the onboarding experience for the next new hire?" }, "key": "one_improvement_text" },
    { "id": "page-07-growth", "input_type": "page", "enabled": true, "title_multiloc": { "en": "Role & Growth (7/9)" }, "key": "page7", "page_layout": "default"
    },
    { "id": "q-23-growth-path", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Can you see a clear growth path for yourself in your role?" }, "key": "growth_path_clarity", "options": [
        { "id": "opt-grow-1", "key": "yes", "title_multiloc": {"en": "Yes"} }, { "id": "opt-grow-2", "key": "somewhat", "title_multiloc": {"en": "Somewhat"} }, { "id": "opt-grow-3", "key": "no", "title_multiloc": {"en": "No"} }
      ]
    },
    { "id": "q-24-learning-opps", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Are you aware of the learning and development opportunities available?" }, "key": "learning_opportunities_awareness", "options": [
        { "id": "opt-learn-1", "key": "yes", "title_multiloc": {"en": "Yes"} }, { "id": "opt-learn-2", "key": "no", "title_multiloc": {"en": "No"} }
      ]
    },
    { "id": "q-25-okr-understanding", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Do you understand how your work contributes to the team\'s and company\'s goals (OKRs)?" }, "key": "okr_understanding", "options": [
        { "id": "opt-okr-1", "key": "yes_fully", "title_multiloc": {"en": "Yes, fully"} }, { "id": "opt-okr-2", "key": "partially", "title_multiloc": {"en": "Partially"} }, { "id": "opt-okr-3", "key": "not_at_all", "title_multiloc": {"en": "Not at all"} }
      ]
    },
    { "id": "q-26-biggest-challenge", "input_type": "multiline_text", "enabled": true, "title_multiloc": { "en": "What has been your biggest challenge so far?" }, "key": "biggest_challenge_text" },
    { "id": "q-27-biggest-win", "input_type": "multiline_text", "enabled": true, "title_multiloc": { "en": "What has been your biggest win or proudest moment so far?" }, "key": "biggest_win_text" },
    { "id": "page-08-culture", "input_type": "page", "enabled": true, "title_multiloc": { "en": "Company Culture (8/9)" }, "key": "page8", "page_layout": "default"
    },
    { "id": "q-28-mission-connect", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Do you feel connected to the company\'s mission and values?" }, "key": "mission_connection", "options": [
        { "id": "opt-mis-1", "key": "yes", "title_multiloc": {"en": "Yes"} }, { "id": "opt-mis-2", "key": "somewhat", "title_multiloc": {"en": "Somewhat"} }, { "id": "opt-mis-3", "key": "no", "title_multiloc": {"en": "No"} }
      ]
    },
    { "id": "q-29-work-life", "input_type": "linear_scale", "enabled": true, "title_multiloc": { "en": "How would you rate your work-life balance?" }, "key": "work_life_balance", "maximum": "5",
      "linear_scale_label_1_multiloc": { "en": "Poor" }, "linear_scale_label_5_multiloc": { "en": "Excellent" }
    },
    { "id": "q-30-inclusion", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Do you feel that your opinions are heard and valued?" }, "key": "inclusion_feeling", "options": [
        { "id": "opt-inc-1", "key": "always", "title_multiloc": {"en": "Always"} }, { "id": "opt-inc-2", "key": "sometimes", "title_multiloc": {"en": "Sometimes"} }, { "id": "opt-inc-3", "key": "rarely", "title_multiloc": {"en": "Rarely"} }
      ]
    },
    { "id": "q-31-leadership-comm", "input_type": "select", "enabled": true, "title_multiloc": { "en": "How clear is communication from the company leadership?" }, "key": "leadership_communication", "options": [
        { "id": "opt-lead-1", "key": "very_clear", "title_multiloc": {"en": "Very Clear"} }, { "id": "opt-lead-2", "key": "somewhat_clear", "title_multiloc": {"en": "Somewhat Clear"} }, { "id": "opt-lead-3", "key": "unclear", "title_multiloc": {"en": "Unclear"} }
      ]
    },
    { "id": "q-32-social-events", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Have you had a chance to participate in any company social events?" }, "key": "social_event_participation", "options": [
        { "id": "opt-soc-1", "key": "yes", "title_multiloc": {"en": "Yes"} }, { "id": "opt-soc-2", "key": "no", "title_multiloc": {"en": "No"} }, { "id": "opt-soc-3", "key": "not_aware", "title_multiloc": {"en": "I wasn\'t aware of any"} }
      ]
    },
    { "id": "page-09-retro", "input_type": "page", "enabled": true, "title_multiloc": { "en": "30-Day Retrospective (9/9)" }, "key": "page9", "page_layout": "default"
    },
    { "id": "q-33-confidence", "input_type": "linear_scale", "enabled": true, "title_multiloc": { "en": "How confident do you feel in your role now compared to Day 1?" }, "key": "confidence_level", "maximum": "10",
      "linear_scale_label_1_multiloc": { "en": "Less Confident" }, "linear_scale_label_10_multiloc": { "en": "Much More Confident" }
    },
    { "id": "q-34-recommend-us", "input_type": "select", "enabled": true, "title_multiloc": { "en": "Based on your onboarding, would you recommend us as a great place to work?" }, "key": "recommend_workplace", "options": [
        { "id": "opt-rec-1", "key": "yes", "title_multiloc": {"en": "Yes, definitely"} }, { "id": "opt-rec-2", "key": "maybe", "title_multiloc": {"en": "Maybe"} }, { "id": "opt-rec-3", "key": "no", "title_multiloc": {"en": "No"} }
      ]
    },
    { "id": "q-35-surprise-pos", "input_type": "multiline_text", "enabled": true, "title_multiloc": { "en": "What has been the most pleasant surprise about working here?" }, "key": "pleasant_surprise_text" },
    { "id": "q-36-surprise-neg", "input_type": "multiline_text", "enabled": true, "title_multiloc": { "en": "What has been the most unexpected challenge?" }, "key": "unexpected_challenge_text" },
    { "id": "q-37-final-feedback", "input_type": "multiline_text", "enabled": true, "title_multiloc": { "en": "Is there anything else you\'d like to share about your first 30 days?" }, "key": "final_feedback_text" },
    {
      "id": "page-10-final", "input_type": "page", "enabled": true, "title_multiloc": { "en": "Thank you!" },
      "description_multiloc": { "en": "We appreciate you taking the time to provide this detailed feedback. It is invaluable for helping us improve." },
      "key": "form_end", "page_layout": "default"
    }
  ],
  "form_save_type": "manual", "form_opened_at": "2025-09-17T08:49:40.821Z"
}
'

# The cURL command with the specific remote values you provided.
# curl 'https://falsebottom.epic.citizenlab.co/web_api/v1/phases/49650699-ff73-4790-8658-9ae11db45ab6/custom_fields/update_all' \
#   -X 'PATCH' \
#   -H 'accept: */*' \
#   -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
#   -H 'authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE3NjA2ODk5OTMsInN1YiI6ImEyODI2ZmNjLTk0MTItNDAzNi04Mjc1LTdjOTUxZmVhZTM3NSIsImhpZ2hlc3Rfcm9sZSI6InN1cGVyX2FkbWluIiwicm9sZXMiOlt7InR5cGUiOiJhZG1pbiJ9XSwiY2x1c3RlciI6ImZhbHNlYm90dG9tIiwidGVuYW50IjoiMjg4Zjc3MDItY2E5Ni00NGJjLTk2M2EtMjM2NWQ2ODkyYTZhIn0.NzBH2pP4LbW1qBRDuSXd3EnoS8JXp9GhYHuS9PGXGak8wy_VDuol9HKPGuicITGaiYUT5jlT3uHWLh1WK5tFRCerAGoFu3WWdThiiqoTKDhrjA1ikREtVfMooEpGaAsYRmGP3tHh8RiCioeKEgDnc-RhukuxNOYc2ltPtd4v8Ixdi77lGOxY0-tz-pnbAyF1Xg2M9LM4VS-kPWG9Ub-x3a0lq0fDjI7FDhO_5Xx2zJdXwtVn1EVC-2vhw1xcQjrSuqj13jrIYf89HbwehmxotPF1DwGY6FJxwvuXtw68vebupoqLGhBTgl0Mvr84adRsyGp4qVxYgD9DWTUfs7YNcQ' \
#   -H 'content-type: application/json' \
#   -H 'origin: https://falsebottom.epic.citizenlab.co' \
#   -H 'referer: https://falsebottom.epic.citizenlab.co/en/admin/projects/6b460db9-2a01-40fb-ba5b-468958c565ce/phases/49650699-ff73-4790-8658-9ae11db45ab6/survey-form/edit' \
#   -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' \
#   --data-raw "${DATA}"


# The cURL command with the specific values you provided.
curl 'http://localhost:3000/web_api/v1/phases/df59aea7-4f2e-491c-a4d7-d0792ba9c106/custom_fields/update_all' \
  -X 'PATCH' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE3NTk0ODA4NzgsInN1YiI6IjQ1NDAyZTU0LWRkMmItNGJiYi1hZGVjLWQ1ZmQ5ZmQ0NGRlNiIsImhpZ2hlc3Rfcm9sZSI6InN1cGVyX2FkbWluIiwicm9sZXMiOlt7InR5cGUiOiJhZG1pbiJ9XSwiY2x1c3RlciI6ImxvY2FsIiwidGVuYW50IjoiOThmYTA3MTQtN2NkYS00NmViLTk1ZmQtNjUxMDM1Njc5MTNlIn0.XxdPPKDN7C69FwjsqQMQUUWMp77bawOj5zcIAbXICAZgDDynAiwOvRlemcW9AaJIWMpDTIDEiKGYmUh40jWYe2ioU7E9xYGiJGcGOnbWNwv6UtX4UzlFeA4LTmOeqGZpImsG5SipeyGEuYzI8TQaCnAFfWu3GU9Unc4Fix2unXw-OjJT6k40EVihxpku_VgwEZ4bJXhEXhdjIQKXuKsxN8CdKE5tSa5jSHxFnCdpnoGsjfdzxjmKL8tHb_kB4Jq9cS0PKQN1Edz7n5TJRkpMXWlHRGUgdoif7VQmfLKaGRIOPCEGB5GbJvm16nM-upigfysFJ9J7pXRr1d_XIVhzcw' \
  -H 'Accept: */*' \
  --data-raw "${DATA}"

# Adding a newline for cleaner terminal output
echo
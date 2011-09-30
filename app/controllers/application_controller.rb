class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :set_locale

  helper_method :current_user, :login_type, :auto_logout
  helper_method :user_is_admin, :user_is_logged_in
  #helper_method :is_current_user
  #helper_method :set_focus_to_id
  helper_method :user_session

  def set_locale
    I18n.locale = 'en'
    return

    # working, but disabled until translations are done
    logger.debug "* Accept-Language: #{request.env['HTTP_ACCEPT_LANGUAGE']}"
    I18n.locale = extract_locale_from_accept_language_header
    logger.debug "* Locale set to '#{I18n.locale}'"
  end


  private
  
  def extract_locale_from_accept_language_header
    request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
  end

  def auto_logout
	false
  end

  def current_user
    begin
		
	  if auto_logout
		if user_session.expired
	   		return nil
		end
	  end
	  
      @current_user = user_session.user
      
	  if auto_logout && @current_user
		user_session.touch
      end
      
    rescue
      nil
    end
    @current_user
  end
  
  def login_type
	"C"
  end
  
  def user_is_admin
    current_user && current_user.name == 'admin'
  end

  def user_is_logged_in (id)
    current_user && current_user.id.to_s == id.to_s
  end

  def user_session
    @user_session ||= UserSession.new(session)
  end



end



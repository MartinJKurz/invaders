class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :set_locale
  before_filter :set_timezone #, :except => [:user_session]

  helper_method :current_user, :login_type, :auto_logout
  helper_method :user_is_admin, :user_is_logged_in, :user_is_tester
  #helper_method :is_current_user
  #helper_method :set_focus_to_id
  #helper_method :user_session

  def set_locale
    I18n.locale = 'en'
    return

    # working, but disabled until translations are done
    logger.debug "* Accept-Language: #{request.env['HTTP_ACCEPT_LANGUAGE']}"
    I18n.locale = extract_locale_from_accept_language_header
    logger.debug "* Locale set to '#{I18n.locale}'"
  end

=begin
  def set_timezone
	if user_session.timezone
	    Time.zone = user_session.timezone["name"]
	    # flash.now.alert = "set TZ to " + user_session.timezone["name"]
	else
	    # flash.now.alert = "TZ is " + Time.zone.to_s
	end
  end
=end
  def set_timezone
    if session[:timezone]
	    Time.zone = session[:timezone]["name"]
	    # flash.now.alert = "set TZ to " + session[:timezone]["name"]
	else
	    # flash.now.alert = "TZ is " + Time.zone.to_s
	end
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
		if Time.now - session[:last_seen] > 3.hours
		# if user_session.expired
	   		return nil
		end
	  end
	  
      #@current_user = user_session.user
      @current_user ||= User.find(session[:user_id]) if session[:user_id]

	  if auto_logout && @current_user
		# user_session.touch
	    session[:last_seen] = Time.now
      end
      
    #rescue
    #  nil
    end
    
    @current_user
  end
  
  def login_type
	"C"
  end
  
  def user_is_admin
    current_user && current_user.name == 'admin'
  end

  def user_is_tester
    current_user && current_user.name == 'Tester'
  end

  def user_is_logged_in (id)
    current_user && current_user.id.to_s == id.to_s
  end

=begin
  def user_session
    @user_session ||= UserSession.new(session)
  end
=end
end



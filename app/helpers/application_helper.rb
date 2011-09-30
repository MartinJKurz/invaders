module ApplicationHelper

  # Return a title on a per-page basis.
  def title
    base_title = "Alien Invasion"
    if @title.nil?
      base_title
    else
      "#{base_title} | #{@title}"
    end
  end

  def sortable(column, method, title = nil)
    title ||= column.titleize
    css_class = column == send(method) ? "current #{sort_direction}" : nil
    direction = column == send(method) && sort_direction == "desc" ? "asc" : "desc"
    link_to title, {:sort => column, :direction => direction}, {:class => css_class}
  end

  def localTimeString(t)
    if user_is_admin
      localTimeStringLong t
    else
      localTimeStringShort t
    end
  end

  def localTimeStringLong(t)
    t.localtime.strftime(I18n.t(:full, :scope => 'datetime.formats'))
  end

  def localTimeStringShort(t)
    t.localtime.strftime(I18n.t(:day, :scope => 'datetime.formats'))
  end
end



var DateFilter = React.createClass({
  mixins: [DatesMixin, ReactIntl.IntlMixin],

  getInitialState: function() {
    return {
      startDate: this.props.startDate,
      minStartDate: this.props.minStartDate,
      endDate: this.props.endDate,
      minEndDate: this.props.minEndDate
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      startDate: nextProps.startDate,
      minStartDate: nextProps.minStartDate,
      endDate: nextProps.endDate,
      minEndDate: nextProps.minEndDate
    });
  },

  propTypes: {
    minStartDate: React.PropTypes.moment.isRequired,
    minEndDate:   React.PropTypes.moment.isRequired,
    startDate:    React.PropTypes.moment,
    endDate:      React.PropTypes.moment
  },

  validateAndSetDates: function(start, end) {
    var startDate = start || this.state.startDate,
        endDate = end || this.state.endDate,
        minEndDate = this.state.minEndDate;

    if (startDate) minEndDate = startDate.clone().add(1, 'days');
    if (endDate && (endDate.isBefore(startDate) || endDate.isSame(startDate))) endDate = null;

    this.setState({
      startDate: startDate,
      endDate: endDate,
      minEndDate: minEndDate
    });

    if (startDate && endDate) {
      this.props.change([
        ['search-filter-trip-start', startDate.format(this.props.dateFormat)],
        ['search-filter-trip-end',   endDate.format(this.props.dateFormat)]
      ]);

      if (typeof this.props.onDatesEntered === 'function') {
        this.props.onDatesEntered();
      }
    }

    return {
      startDate: startDate,
      endDate: endDate
    };
  },

  render: function() {
    return (
      <div className="date-filter">
        <DateRangePicker
          minStartDate   = { this.state.minStartDate }
          startDate = { this.state.startDate }
          endDate = { this.state.endDate }
          onChange  = { this.handleDateRangeChange }
          startDatePlaceholderText = { this.props.startDatePlaceholderText || this.getIntlMessage('filters.search-filter-trip-start') }
          endDatePlaceholderText = { this.props.endDatePlaceholderText || this.getIntlMessage('filters.search-filter-trip-end') }
          startDateClassName = 'checkin'
          endDateClassName = 'checkout'
        />
      </div>
    );
  }
});

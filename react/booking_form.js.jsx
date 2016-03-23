var BookingForm = React.createClass({
  getInitialState: function() {
    return {
      canSubmit: false
    };
  },

  enableButton: function() {
    this.setState({
      canSubmit: true
    });
  },

  disableButton: function() {
    this.setState({
      canSubmit: false
    });
  },

  getDisplayedDates: function() {
    var startDate = this.props.startDate,
        endDate   = this.props.endDate,
        minStartDate = moment(this.props.now).startOf('day'),
        minEndDate = moment(this.props.now).startOf('day').add(1, 'days');

    // If both are set make sure end date is after start
    if (startDate && endDate) {
      minEndDate = startDate.clone().add(1, 'days');
      if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
        endDate = minEndDate;
      }
    }

    return {
      startDate: startDate,
      minStartDate: minStartDate,
      endDate: endDate,
      minEndDate: minEndDate
    };
  },

  handleBlurWhenValidEmail: function() {
    // updates tealium utag with email after modal capture
    utag.link({ email: this.refs.email.getValue() });

    // event for use in tealium/threads for abandon cart email logic
    $(window).trigger('threads:onsite_booking_email');
  },

  renderPolicies: function() {
    if (!this.props.policies) { return null; }

    return this.props.policies.map(function(policy, i) {
      if (!policy.content) { return null; }

      return (
        <div className='policy' key={i}>
          <b>{ policy.name }</b>
          <p>{ policy.content }</p>
        </div>
      );
    }.bind(this))
  },

  renderNoForm: function() {
    var dates = this.getDisplayedDates();

    return (
      <div className='hidden-form'>
        { this.props.querying ? <div className='cover'><i className='fa fa-spin fa-circle-o-notch'/></div> : null }
        <p>Please select your desired travel dates before completing your booking.</p>

        <StandaloneCalendar
          minStartDate = { dates.minStartDate }
          startDate = { dates.startDate }
          endDate = { dates.endDate }
          onChange = { this.props.handleDateRangeChange }
        />
      </div>
    );
  },

  renderForm: function() {
    return (
      <Formsy.Form onValidSubmit={ this.props.submit } onValid={ this.enableButton } onInvalid={ this.disableButton }>
        <div className='booking-group guest-details'>
          <h4>1. Your Guest Details</h4>
          <div className='row'>
            <div className='col-sm-6'>
              <FormGroupInput name='first_name' autocomplete='given-name' label="First Name" validations="isExisty" required/>
            </div>
            <div className='col-sm-6'>
              <FormGroupInput name="last_name" autocomplete='family-name' label="Last Name" validations="isExisty" required/>
            </div>
          </div>
          <div className='row'>
            <div className='col-sm-6'>
              <FormGroupInput ref='email' name='email' autocomplete='email' label="Email Address" validations="isEmail" onBlurWhenValid={ this.handleBlurWhenValidEmail } required/>
            </div>
            <div className='col-sm-6'>
              <FormGroupInput name="phone" autocomplete='tel' label="Phone Number" validations="minLength:10" required/>
            </div>
          </div>
        </div>

        <div className='booking-group'>
          <h4>2. Your Payment Information</h4>
          <div className='row'>
            <div className='col-sm-8'>
              <FormGroupInput name='cc_number' autocomplete='cc-number' label="Credit Card Number" className='cc-numb' validations="isCC" required>
                <span className="cc">
                  <i className="fa fa-cc-mastercard"></i>
                  <i className="fa fa-cc-visa"></i>
                  <i className="fa fa-cc-amex"></i>
                  <i className="fa fa-cc-discover"></i>
                </span>
              </FormGroupInput>
            </div>
            <div className='col-xs-4'>
              <FormGroupInput name="cc_cvc" autocomplete='cc-csc' label="CVC" className='cc_cvc' validations="isCVC" placeholder="CVC" maxLength="4" required>
                <span className="cc-help">(3 or 4 digit code)</span>
              </FormGroupInput>
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-4'>
              <FormGroupInput name="cc_month" autocomplete='cc-exp-month' label="Expiration Date" className='cc_month' validations="isExpired" placeholder="MM" maxLength="2" required/>
            </div>
            <div className='col-xs-4'>
              <FormGroupInput name="cc_year" autocomplete='cc-exp-year' hideLabel={ true } className='cc_year' placeholder="YYYY" maxLength="4" required/>
            </div>
          </div>

          <h4 className='bill-info'>3. Your Billing Information</h4>
          <div className='row'>
            <div className='col-sm-12'>
              <FormGroupInput name='billing_name' autocomplete='cc-name' label="Name" validations="isExisty" required>
                <span className="cc-help">(As appears on your credit card)</span>
              </FormGroupInput>
            </div>
          </div>
          <div className='row'>
            <div className='col-sm-6'>
              <AddressInput name='billing_address' label="Street Address" validations="isExisty" required className='street'/>
            </div>
            <div className='col-sm-6'>
              <FormGroupInput label='City' autocomplete='address-level2' name="billing_city" validations="isExisty" required/>
            </div>
          </div>

          <GeoInput label='Country' autocomplete='country' name="billing_country" validations="validGeography" required/>
        </div>

        <div className="booking-group policy">
          <h4>4. Review Policies</h4>

          { this.renderPolicies() }

          <hr/>

          <p>By submitting this form you agree to the Cancellation Policy above and Tripping.com&apos;s <a href="/about/terms" target="_blank">Terms & Conditions</a> and <a href="/about/privacy" target="_blank">Privacy Policy</a>.</p>
          <button id='book-now-btn' className='btn btn-tr' type="submit" disabled={ !this.state.canSubmit }>Book Now</button>
        </div>
      </Formsy.Form>
    )
  },

  render: function() {
    return this.renderForm();
  }
});

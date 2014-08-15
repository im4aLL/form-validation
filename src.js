/* --------------------------------------------------------------------------------------------------------------
 Form validation skeleton prototype function
 Usage: 
 var contactFrmInstance = new Form($contactFrm, rules);
 contactFrmInstance.validate(function(form){
	console.log(form);
 });
 rules obj { type: 'text/email', errMsg : 'message', errReplace: function(id){}, customMethod: function(id){} }
----------------------------------------------------------------------------------------------------------------- */

var Form = function(formObj, rules, errorReplacement){
	this.form 				= formObj;
	this.rulesObj 			= rules;
	this.error	 			= false;
	this.errorReplacement 	= ( errorReplacement !== undefined && errorReplacement === true ) ? true : false;
}

Form.prototype.validate = function(callback){
	// define variables
	var rules 		= this.rulesObj,
		form 		= this.form,
		error 		= this.error,
		errReplace 	= this.errorReplacement;

	form.submit(function(){
		// error reset
		form.find('.is-error').removeClass('is-error').find('.hint').remove();
		var errors = [],
			fieldValues = {};

		$.each(rules, function(id, field){
			var $field 				= $('#'+id),
				thisFieldContainErr = false,
				isValidField 		= true;

			// checking for error
			if( field.customMethod !== undefined && field.customMethod != null ) {
				isValidField = field.customMethod.call( this, id );
			}
			else {
				switch( field.type ) {
					case 'email':
						var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
						isValidField = re.test($field.val());
					break;

					case 'text':
						if( $field.val().length == 0 ) isValidField = false;	
					break;
				}	
			}

			// if contains error
			if( isValidField === false ) {
				error = true;
				errors.push(id);
				thisFieldContainErr = true;		
			}
			else fieldValues[id] = $field.val();

			// if user defined custom error replace
			var customError = ( field.errReplace !== undefined && field.errReplace != null ) ? true : false;
			( customError ) ? field.errReplace.call( this, id ) : '';

			// showing error
			if( errReplace === false && thisFieldContainErr && customError === false ) {
				var errText = field.errMsg !== undefined ? field.errMsg : 'This field is required';
				$field.parent().addClass('is-error').find('.hint').remove();
				$field.parent().append('<span class="hint"><i></i>'+errText+'</span>');
			}

		});

		// callback
		if( typeof(callback) == 'function' ) callback.call( this, { obj: form, isValid : !error, err: errors, values : fieldValues } );

		// prevent button behaviour
		return false;
	});

}
/**
 * https://github.com/im4aLL/form-validation
 * @author me@habibhadi.com
 * @authorURL http://habibhadi.com
 */
var Form = function(formObj, rules, errorReplacement){
	this.form 				= formObj;
	this.rulesObj 			= rules;
	this.errorReplacement 	= ( errorReplacement !== undefined && errorReplacement === true ) ? true : false;
}

Form.prototype.validate = function(callback){
	// define variables
	var self		= this,
		rules 		= this.rulesObj,
		form 		= this.form,
		errReplace 	= this.errorReplacement;

	form.submit(function(){
		// error reset
		form.find('.is-error').removeClass('is-error').find('.hint').remove();
		var errors = [],
			error = false,
			fieldValues = {};

		$.each(rules, function(id, field){
			var $field 				= $('#'+id),
				isValidField 		= true;

			// if field type radio
			if( field.inputType !== undefined && (field.inputType == 'radio' || field.inputType == 'checkbox') ) $field = $('input[name="'+id+'"]:checked');

			// checking for error
			if( field.customMethod !== undefined && field.customMethod != null ) isValidField = field.customMethod.call( this, { id: id, field: field } );
			else isValidField = self.method(id, field);

			// if contains error
			if( isValidField === false ) {
				error = true;
				var e = {};
				e.id = id;
				e.errMsg = field.errMsg !== undefined ? field.errMsg : '';
				errors.push(e);
			}
			else fieldValues[id] = $field.val();

			// if user defined custom error replace
			var customError = ( field.errReplace !== undefined && field.errReplace != null ) ? true : false;
			( customError ) ? field.errReplace.call( this, { id: id, field: field, isValidField: isValidField } ) : '';

			// showing error
			if( errReplace === false && !isValidField && customError === false ) self.addError(id, field);
			
			// bind / unbind error
			$field.blur(function(){
				( self.method(id, field) === true ) ? self.removeError(id, field) : self.addError(id, field);
			});

		});

		// callback
		if( typeof(callback) == 'function' ) callback.call( this, { obj: form, isValid : !error, err: errors, values : fieldValues } );

		// prevent button behaviour
		return false;
	});

}

// Field error checking methods
Form.prototype.method = function(id, field){
	var $field = $('#'+id),
		isValidField = true;

	// if field type radio or checkbox
	if( field.inputType !== undefined && (field.inputType == 'radio' || field.inputType == 'checkbox') ) $field = $('input[name="'+id+'"]:checked');
	
	// if field validation has dependancy to other field
	if( field.require !== undefined ) {
		var requireInputType = this.rulesObj[field.require.name].inputType;

		if( requireInputType === undefined && $('#' + field.require.name).val() != field.require.value ) return true;
		else if( requireInputType !== undefined && (requireInputType == 'radio' || requireInputType == 'checkbox') && $('input[name="'+field.require.name+'"]:checked').val() != field.require.value ) return true;
	}

	switch( field.type ) {
		case 'email':
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			isValidField = re.test($field.val());
		break;

		case 'text':
			if( $field.val() === undefined || $field.val().length == 0 ) isValidField = false;	
		break;

		case 'array':
			isValidField = false;
			$('input[name="'+id+'[]"]').each(function(index, el) {
				if( field.inputType == 'checkbox' ) {
					if( $(el).is(':checked') ) isValidField = true;
				}
				else if( $(el).val().length > 0 ) isValidField = true;
			});
		break;

		// feel free to add your own method
	}
	
	return isValidField;
}

// Add error
Form.prototype.addError = function(id, field){
	var $field = $('#'+id),
	errText = field.errMsg !== undefined ? field.errMsg : 'This field is required';
	
	// feel free to change the way you want
	$field.parent().addClass('is-error').find('.hint').remove();
	$field.parent().append('<span class="hint"><i></i>'+errText+'</span>');
}

// remove error
Form.prototype.removeError = function(id, field){
	var $field = $('#'+id);

	// feel free to change the way you want
	$field.parent().removeClass('is-error').find('.hint').remove();
}
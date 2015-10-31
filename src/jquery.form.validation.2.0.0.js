/**
 * -------------------------------
 * jQuery form validation v2.0.0
 * -------------------------------
 * @description     A simple form validation plugin 3 KB
 * @demo            http://habibhadi.com/lab/form-validation/demo/
 * @author          Habib Hadi <me@habibhadi.com>
 */

;(function ( $, window, document, undefined ) {
    var pluginName = 'validate',
        defaults = {
            errorReplacement: false,
            onComplete: null
        };

    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.form               = $(this.element);
        this.rulesObj           = this.options.rules;
        this.errorReplacement   = this.options.errorReplacement;
        this.callback           = this.options.onComplete;
        this.fieldValues        = {};

        this.init();
    }

    Plugin.prototype.init = function () {

        // define variables
        var self        = this,
            rules       = this.rulesObj,
            form        = this.form,
            errReplace  = this.errorReplacement,
            callback    = this.callback;


        form.submit(function(){
            // error reset
            form.find('.is-error').removeClass('is-error').find('.hint').remove();
            var errors = [],
                error = false;

            $.each(rules, function(id, field){
                var isValidField        = true;
                var $field;

                if(field.type === 'radio') {
                    $field = $('input:radio[name="'+id+'"]');
                }
                else if(field.type === 'checkbox') {
                    $field = $('input[type="checkbox"][name="'+id+'"]');
                }
                else {
                    $field = $('#'+id);
                    if($field.length === 0) {
                        $field = $('input[name="'+id+'"]');
                    }
                }

                // checking for error
                if( field.customMethod !== undefined && field.customMethod !== null ) {
                    isValidField = field.customMethod.call( this, { id: id, field: field, obj: $field } );
                    self.fieldValues[id] = 'customMethod';
                }
                else {
                    self.method(id, field, $field, function(result){
                        isValidField = result.validationResult;
                        self.fieldValues[id] = result.values;
                    });
                }

                // if contains error
                if( isValidField === false ) {
                    error = true;
                    var e = {};
                    e.id = id;
                    e.errMsg = field.errMsg !== undefined ? field.errMsg : '';
                    errors.push(e);
                }

                // if user defined custom error replace
                var customError = ( field.errReplace !== undefined && field.errReplace !== null ) ? true : false;
                if(customError === true) {
                    field.errReplace.call( this, { id: id, field: field, obj: $field, isValidField: isValidField } );
                }

                // showing error
                if( errReplace === false && !isValidField && customError === false ) {
                    self.addError(id, field, $field);
                }

                // bind / unbind error
                if(errReplace === false && customError === false) {
                    $field.blur(function(){
                        self.method(id, field, $field, function(result){
                            if( result.validationResult === true ) {
                                self.removeError(id, field, $field);
                            }
                            else {
                                self.addError(id, field, $field);
                            }
                        });
                    });
                }

            });

            // callback
            if( typeof(callback) === 'function' ) callback.call( this, { obj: form, isValid : !error, err: errors, values : self.fieldValues } );

            // prevent button behaviour
            if(error === true) {
                return false;
            }
        });

    };


    // Field error checking methods
    Plugin.prototype.method = function(id, field, obj, callback){
        var $field = obj,
            isValidField = false,
            self = this,
            currentValue;

        if(field.require !== undefined) {
            if(self.fieldValues[field.require.name] != field.require.value) {
                if( typeof(callback) === 'function' ) callback.call( this, { validationResult: true, values: '' } );
                return;
            }
        }

        switch( field.type ) {
            case 'email':
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                isValidField = re.test($field.val());
                currentValue = $field.val();
            break;

            case 'text':
                if( $field.val() !== undefined && $field.val().length > 0 ) isValidField = true;

                currentValue = $field.val();
            break;

            case 'checkbox':
            case 'radio':
                if($field.length > 0) {
                    currentValue = [];
                    $field.each(function(index, el) {
                        if($(el).is(':checked')) {
                            isValidField = true;
                        }

                        currentValue.push($(el).attr('value'));
                    });
                }
                else {
                    if($(field).is(':checked')) {
                        isValidField = true;
                    }

                    currentValue = $(field).attr('value');
                }
            break;

            case 'array':
                currentValue = [];
                $('input[name="'+id+'[]"]').each(function(index, el) {
                    if($(el).attr('type') === 'checkbox') {
                        if($(el).is(':checked')) {
                            isValidField = true;
                        }
                    }
                    else {
                        if( $(el).val().length > 0 ) isValidField = true;
                    }

                    currentValue.push($(el).attr('value'));
                });
            break;

            // feel free to add your own method
        }

        if( typeof(callback) === 'function' ) callback.call( this, { validationResult: isValidField, values: currentValue } );
    };

    // Add error
    Plugin.prototype.addError = function(id, field, obj){
        var $field = obj,
        errText = field.errMsg !== undefined ? field.errMsg : '';

        // feel free to change the way you want
        $field.parent().addClass('is-error').find('.hint').remove();
        if(errText.length > 0) {
            $field.parent().append('<span class="hint">'+errText+'</span>');
        }
    };

    // remove error
    Plugin.prototype.removeError = function(id, field, obj){
        var $field = obj;

        // feel free to change the way you want
        $field.parent().removeClass('is-error').find('.hint').remove();
    };


    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );

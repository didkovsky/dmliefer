///////////////////////////////////////////////////////////////////////////////////////////////////
// FeedbackForm v 2.0 
// © 2016 – Sergey Didkovsky  
// didkovsky.dev@gmail.com
///////////////////////////////////////////////////////////////////////////////////////////////////

jQuery(function($) {

	var FeedbackFormController = {

		config: {
			patternMap: {
				email :   /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
				phone :   /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/,
				numbers:  /^\d+$/,
				text:     /^[А-яЁё]+$/,
				notempty: 'notempty'
			},

			correctFieldClass: 'correct_field',
			errorFieldClass: 'error_field',
			fromSelector: "form"
		},

		forms: [],

		methods: {
			addPattern: function(pattern) {
				var form = FeedbackFormController.bindForm(this);
				(form != null)? form.addPattern(pattern): $.error('Метод "addPattern" не определен для объекта' + this);
			},

			onReset: function(handler) {
				var form = FeedbackFormController.bindForm(this);
				(form != null)? form.onReset = handler: $.error('Метод "onReset" не определен для объекта' + this);
			},

			onSubmit: function(handler) {
				var form = FeedbackFormController.bindForm(this);
				(form != null)? form.onSubmit = handler: $.error('Метод "onSubmit" не определен для объекта' + this);
			},

			onSubmitRejected: function(handler) {
				var form = FeedbackFormController.bindForm(this);
				(form != null)? form.onSubmitRejected = handler: $.error('Метод "onSubmitRejected" не определен для объекта' + this);
			},

			AJAXSuccessCallback: function(handler) {
				var form = FeedbackFormController.bindForm(this);
				(form != null)? form.AJAXSuccessCallback = handler: $.error('Метод "AJAXSuccessCallback" не определен для объекта' + this);
			},

			AJAXErrorCallback: function(handler) {
				var form = FeedbackFormController.bindForm(this);
				(form != null)? form.AJAXErrorCallback = handler: $.error('Метод "AJAXErrorCallback" не определен для объекта' + this);
			},	

			setFieldWright: function(handler) {
				var form = FeedbackFormController.bindForm(this);
				(form != null)? form.setFieldWright = handler: $.error('Метод "setFieldWright" не определен для объекта' + this);
			},

			setFieldWrong: function(handler) {
				var form = FeedbackFormController.bindForm(this);
				(form != null)? form.setFieldWrong = handler: $.error('Метод "setFieldWrong" не определен для объекта' + this);
			},
		},

	  	run: function() {
	  		var forms = $(FeedbackFormController.config.fromSelector);
	  		var context = this;
	  		$.each(forms, function(index, form) {
	  			context.forms[index] = new FeedbackForm(form, context.config);
	  		});

	  		$.fn.FeedbackForm = function(method){
			    if (context.methods[method]) {
			        return context.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			    } else if (typeof method === 'object' || !method) {
			        return context.methods.init.apply(this, arguments);
			    } else {
			        $.error('Метод "' +  method + '" не найден в плагине jQuery.mySimplePlugin');
			    }
			};
	  	},

	  	bindForm: function(form) {
	  		var formObject = null;
	  		var context = this;
	  		$.each(context.forms, function(index, item) {
	  			if(item.id == $(form).attr('id'))
	  				formObject = item;
	  		});
	  		return formObject;
	  	}
	};

	var FeedbackForm = function(target, config) {
		this.form = $(target);
		this.id = this.form.attr('id');
		this.patternMap = config.patternMap;
		this.errorFieldClass = config.errorFieldClass;
		this.correctFieldClass = config.correctFieldClass;
		this.fields = this.form.find('[data-pattern]');
		this.submitButton = this.form.find('[type=submit]');
		this.submitButton.attr('disabled', true);

		var context = this;
		var TAG = '*** FeedbackForm ' + this.id + ' : ';

		$.each(this.fields, function(index, field) {
			context.fields[index].isValid = false;
			$(field).keyup(function(event) {
				context.inputEventHandler(this, index);
			});
			$(field).blur(function(event) {
				context.inputEventHandler(this, index);
			});
		});

		this.inputEventHandler = function(target, index) {
			context.fields[index].isValid = context.isFieldCorrect($(target).data('pattern'), $(target).val());
			context.fields[index].isValid ? context.setFieldWright(target) : context.setFieldWrong(target);
			context.isFormCorrect();
		},

		this.form.submit(function(event) {
			event.preventDefault();
			var isFormCorrect = context.isFormCorrect();
			isFormCorrect ? context.onSubmit(): context.onSubmitRejected();
		});

		this.isFormCorrect = function() {
			var result = true;
			$.each(context.fields, function(index, field) {
				if(!field.isValid) 
					result = false;
			});
			context.submitButton.attr('disabled', !result);
			return result;
		}

		this.isFieldCorrect = function(pattern, value) {
			var result;
			if(context.patternMap[pattern] != undefined && context.patternMap[pattern] != context.patternMap.notempty) {
				var rE = new RegExp(context.patternMap[pattern]);
				result = rE.test(value);
			} else if(context.patternMap[pattern] == context.patternMap.notempty) {
				result =  value.lenght != 0;
			} else {
				var rE = new RegExp(pattern);
				result =  rE.test(value);
			}
			return result;
		};

		this.onSubmit = function() {
			var url = this.form.attr('action');
			var method;
			if (this.form.attr('method') != undefined)
				method = this.form.attr('method');
			else
				method = 'POST';
			$.ajax({
				url: url,
				type: method,
				data: context.form.serialize(),
				success: function (response) {
					context.AJAXSuccessCallback(response);
				},
				error: function(error) {
					context.AJAXErrorCallback(error);
				}
			});
		};

		this.polymorph = function() {
			var len2func = [];
			for(var i=0; i<arguments.length; i++)
			if(typeof(arguments[i]) == 'function')
				len2func[arguments[i].length] = arguments[i];
			return function() {
				return len2func[arguments.length].apply(this, arguments);
			}
		};

		this.addPattern = this.polymorph(
			function(patternMap) {
				for (var key in patternMap) {
					var patternKey = key;
					context.addPattern(patternKey, patternMap[patternKey]);
				}
			},
			function(key, value) {
				context.patternMap[key] = value;
			}
		);

		this.setFieldWright = function(field) {
			var target = $(field);
			if (target.hasClass(context.errorFieldClass))
				target.removeClass(context.errorFieldClass);
			target.addClass(context.correctFieldClass);
		};

		this.setFieldWrong = function(field) {
			var target = $(field);
			if (target.hasClass(context.correctFieldClass))
				target.removeClass(context.correctFieldClass);
			target.addClass(context.errorFieldClass);
			context.showErrorDescriptor(field);
		};

		this.showErrorDescriptor = function(field) {
			var error = $(field).data("error");
			if(error != undefined)
				console.log(TAG + error);
		}

		this.onSubmitRejected = function() { console.log(TAG + ' Submit rejected. '); };
		this.AJAXSuccessCallback = function(response) { console.log(TAG + 'AJAX Response: ' + response); };
		this.AJAXErrorCallback = function(error) { console.log(TAG + 'AJAX Error: ' + error); };
		this.onReset = function() { console.log(TAG + ' onReset. '); };
	};
  FeedbackFormController.run();
});

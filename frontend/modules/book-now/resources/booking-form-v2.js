/*****************************************************************************
*
*	copyright(c) - aonetheme.com - Service Finder Team
*	More Info: http://aonetheme.com/
*	Coder: Service Finder Team
*	Email: contact@aonetheme.com
*
******************************************************************************/
			
// When the browser is ready...
  jQuery(function() {
	'use strict';
	var map = null;
	var marker = null;
	var provider_id = '';
	var scost = '';
	var sid = '';
	var totalservicecost = 0;
	var totalhours = 0;
	var date = '';
	var mysetdate = '';
	var oldzipcode = '';
	var member_flag = 1;
	var adminfee;
	
	var month_flag = 1;
	var year_flag = 1;
	var twocheckout_month_flag = 1;
	var twocheckout_year_flag = 1;
	
	var region_flag = 1;
	
	var daynumarr = [];
	var datearr = [];
	var bookedarr = [];
	var disabledates = [];
	var servicearr = '';
	var service_flag = 0;
	
	/*Display Services*/
	jQuery('form.book-now').on('change', 'select[name="region"]', function(){
		var region = jQuery('select[name="region"]').val();
		if(region != ""){
			jQuery("#bookingservices").show();	
		}else{
			jQuery("#bookingservices").hide();	
		}
	});
	
	jQuery(document).on('click','.set-marker-popup-close',function(){
		jQuery('.set-marker-popup').hide();
	});															   
	jQuery(document).on('click','#viewmylocation',function(){
     jQuery('.set-marker-popup').show();
	 
	 var providerlat = jQuery(this).data('providerlat');
	 var providerlng = jQuery(this).data('providerlng');
  	 var zooml = jQuery(this).data('locationzoomlevel');
	 
	 if(zooml == ""){
		zooml = 14;	 
	 }
	 if(providerlat != "" && providerlng != ""){
	 initMap(providerlat,providerlng,zooml);
	 }else{
	 initMap(parseFloat(defaultlat),parseFloat(defaultlng),parseInt(defaultzoomlevel));	
	 }
	 
	 });
	
	function initMap(lat,lng,zoom) {
	var map = new google.maps.Map(document.getElementById('marker-map'), {
	  zoom: zoom,
	  center: {lat: lat, lng: lng}
	});
	
	marker = new google.maps.Marker({
	  map: map,
	  draggable: true,
	  animation: google.maps.Animation.DROP,
	  position: {lat: lat, lng: lng}
	});

	}
	
	/*Update booking price according to services selected*/
	jQuery('body').on('click', '#bookingservices .aon-service-bx', function(){
																					   
		var serviceid = jQuery(this).data('id');
		var costtype = jQuery(this).data('costtype');
		var providerhours = jQuery(this).data('hours');
		
		if(jQuery(this).hasClass('selected') && (costtype == 'hourly' || costtype == 'perperson')) { 
			if(providerhours > 0){
				jQuery('#hours-outer-bx-'+serviceid).show();
				jQuery('#hours-'+serviceid).show();
				jQuery('#hours-'+serviceid).val(providerhours);
				jQuery('#hours-'+serviceid).attr('readonly','readonly');	
			}else{
				jQuery('#hours-'+serviceid).closest('.bootstrap-touchspin').show();
				converttoslider(serviceid,costtype);
			}
		}else{ 
			
			if(providerhours > 0){
				jQuery('#hours-outer-bx-'+serviceid).hide();
				jQuery('#hours-'+serviceid).hide();	
				jQuery('#hours-'+serviceid).val('');
				jQuery('#hours-'+serviceid).removeAttr('readonly','readonly');	
			}else{
				jQuery('#hours-'+serviceid).closest('.bootstrap-touchspin').hide();
			}
		}
		calculate_servicecost();
	});
	
	function calculate_discount(coupon,discounttype,discountvalue,cost){
		var discount = 0; 
		if(coupon == 'verified'){
					
			if(discounttype == 'percentage'){
				discount = parseFloat(cost) * (parseFloat(discountvalue)/100);
			}else if(discounttype == 'fixed'){
				discount = parseFloat(discountvalue);	
			}
			
		}
		return discount;
	}
	
	function calculate_discount_cost(discount,cost){
		
		if(parseFloat(cost) >= parseFloat(discount)){
		cost = parseFloat(cost) - parseFloat(discount);
		}
		
		return cost;
	}
	
	function calculate_servicecost(){
		var servicecost = 0;
		var servicehours = 0;
		service_flag = 0;
		servicearr = '';
		jQuery("#bookingservices .aon-service-bx").each( function() {
            if(jQuery(this).hasClass('selected')) { 
			service_flag = 1;
				var service = jQuery(this).val();
				var costtype = jQuery(this).data('costtype');
				var cost = jQuery(this).data('cost');
				var serviceid = jQuery(this).data('id');
				
				var discounttype = jQuery('#serbx-'+serviceid).attr('data-discounttype');
				var discountvalue = jQuery('#serbx-'+serviceid).attr('data-discountvalue');
				var coupon = jQuery('#serbx-'+serviceid).attr('data-coupon');
				var couponcode = jQuery('#serbx-'+serviceid).attr('data-couponcode');
				
				if(costtype == 'fixed'){
					var hours = 0;
					var discount = calculate_discount(coupon,discounttype,discountvalue,cost);	
					cost = calculate_discount_cost(discount,cost);
					servicearr = addto_service_array(servicearr,serviceid,hours,couponcode,discount);
					servicecost = parseFloat(servicecost) + parseFloat(cost);
				}else if(costtype == 'hourly'){
					var hrmin = 0;
					var hours = jQuery('#hours-'+serviceid).val();
					var $hourflag = jQuery(this).data('hours');
					if($hourflag > 0){
					hrmin = $hourflag;	
					var temphr = $hourflag.toString().split('.');
					
					var hours = temphr[0];
					var minutes = (temphr[1] == 'undefined' || temphr[1] == undefined) ? 0 : temphr[1];
					
					if(parseInt(minutes) < 10){
						var minutescost = (parseFloat(minutes) * 10) * (parseFloat(cost)/60);	
					}else{
						var minutescost = (parseFloat(minutes)) * (parseFloat(cost)/60);	
					}
					
					var tcost = parseFloat(cost) * parseFloat(hours);	
					
					tcost = parseFloat(tcost) + parseFloat(minutescost);
					
					var discount = calculate_discount(coupon,discounttype,discountvalue,tcost);	
					cost = calculate_discount_cost(discount,tcost);
					servicecost = parseFloat(servicecost) + parseFloat(cost);
					servicearr = addto_service_array(servicearr,serviceid,$hourflag,couponcode,discount);
					}else if(hours > 0){
					/*hrmin = hours;	
					var temphr = hours.toString().split('.');
					
					var hours = temphr[0];
					var minutes = (temphr[1] == 'undefined' || temphr[1] == undefined) ? 0 : temphr[1];
					
					if(parseInt(minutes) < 10){
						var minutescost = (parseFloat(minutes) * 10) * (parseFloat(cost)/60);	
					}else{
						var minutescost = (parseFloat(minutes)) * (parseFloat(cost)/60);	
					}
					
					var tcost = parseFloat(cost) * parseFloat(hours);	
					
					tcost = parseFloat(tcost) + parseFloat(minutescost);*/
					
					var tcost = parseFloat(cost) * parseFloat(hours);
					
					var discount = calculate_discount(coupon,discounttype,discountvalue,tcost);	
					cost = calculate_discount_cost(discount,tcost);
					servicecost = parseFloat(servicecost) + (parseFloat(cost));	
					servicearr = addto_service_array(servicearr,serviceid,hours,couponcode,discount);
					}else{
					var discount = calculate_discount(coupon,discounttype,discountvalue,cost);	
					cost = calculate_discount_cost(discount,cost);
					servicecost = parseFloat(servicecost) + (parseFloat(cost));	
					servicearr = addto_service_array(servicearr,serviceid,hours,couponcode,discount);
					}
					servicehours = parseFloat(servicehours) + parseFloat(hrmin);
				}else if(costtype == 'perperson'){
					
					var hours = jQuery('#hours-'+serviceid).val();
					var $hourflag = jQuery(this).data('hours');
					if($hourflag > 0){
					var tcost = parseFloat(cost) * parseFloat($hourflag);	
					var discount = calculate_discount(coupon,discounttype,discountvalue,tcost);	
					cost = calculate_discount_cost(discount,tcost);
					servicecost = parseFloat(servicecost) + parseFloat(cost);
					servicearr = addto_service_array(servicearr,serviceid,$hourflag,couponcode,discount);
					}else if(hours > 0){
					var tcost = parseFloat(cost) * parseFloat(hours);	
					var discount = calculate_discount(coupon,discounttype,discountvalue,tcost);	
					cost = calculate_discount_cost(discount,tcost);
					servicecost = parseFloat(servicecost) + (parseFloat(cost));	
					servicearr = addto_service_array(servicearr,serviceid,hours,couponcode,discount);
					}else{
					var discount = calculate_discount(coupon,discounttype,discountvalue,cost);	
					cost = calculate_discount_cost(discount,cost);
					servicecost = parseFloat(servicecost) + (parseFloat(cost));	
					servicearr = addto_service_array(servicearr,serviceid,hours,couponcode,discount);
					}
					servicehours = parseFloat(servicehours) + parseFloat(hours);
				}
			}
			
        });
		jQuery('#servicearr').val(servicearr);
		totalservicecost = servicecost;
		totalhours = servicehours;
		calculate_totalcost();
	}
	
	function addto_service_array(servicearr,serviceid,hours,coupon,discount){
		servicearr = servicearr + serviceid +'-'+ hours+'-'+ discount +'-'+ coupon + '%%';
		return servicearr;
	}
	
	function calculate_totalcost(){
		totalcost = parseFloat(mincost) + parseFloat(totalservicecost);
		totalcost = totalcost.toFixed(2);
		jQuery('#bookingamount').html(currencysymbol+totalcost);
		calculate_commisionfee(totalcost);
	}
	
	function converttoslider(serviceid,costtype){
	if(costtype == 'perperson'){
		var str = param.perpersion;
		var step = 1;
		var maxlimit = 500;
	}else{
		var str = param.perhour;
		var step = 0.5;
		var maxlimit = 12;
	}	
	//Apply touch spin js on cleaning hours
	jQuery('#hours-'+serviceid).TouchSpin({
        min: 1,
		max: maxlimit,
		initval: 1,
		step: step,
		decimals: 1,
		postfix: str
	}).on('change', function() {
		calculate_servicecost();
	});
	}
	
	jQuery('body').on('click', '.addcouponcode', function(){
		jQuery('.alert').remove();
		jQuery('#addcouponcode input[name="couponcode"]').val('');
		
		var sid = jQuery(this).data('sid');														  
		jQuery('#addcouponcode,.sf-couponcode-popup-overlay').fadeIn("slow");
		jQuery('#addcouponcode input[name="couponcode"]').attr('id','couponcode-'+sid);
		jQuery('.verifycoupon').attr('data-sid',sid);
		
		var $this = jQuery('#serbx-'+sid);
		
		
		var serviceid = jQuery($this).data('id');

		var costtype = jQuery($this).data('costtype');

		var providerhours = jQuery($this).data('hours');

		jQuery($this).removeClass('unselected').addClass('selected');

		if(jQuery($this).hasClass('selected') && (costtype == 'hourly' || costtype == 'perperson')) { 

			if(providerhours > 0){

				jQuery('#hours-outer-bx-'+serviceid).show();

				jQuery('#hours-'+serviceid).show();

				jQuery('#hours-'+serviceid).val(providerhours);

				jQuery('#hours-'+serviceid).attr('readonly','readonly');	

			}else{

				jQuery('#hours-'+serviceid).closest('.bootstrap-touchspin').show();

				converttoslider(serviceid,costtype);

			}

		}else{ 

			

			if(providerhours > 0){

				jQuery('#hours-outer-bx-'+serviceid).hide();

				jQuery('#hours-'+serviceid).hide();	

				jQuery('#hours-'+serviceid).val('');

				jQuery('#hours-'+serviceid).removeAttr('readonly','readonly');	

			}else{

				jQuery('#hours-'+serviceid).closest('.bootstrap-touchspin').hide();

			}

		}

		calculate_servicecost();
	})
	
	jQuery('body').on('click', '.verifycoupon', function(){
		jQuery('.alert').remove();
		var sid = jQuery(this).attr('data-sid');	
		var userid = jQuery(this).data('userid');
		var couponcode = jQuery('#couponcode-'+sid).val();
		var cost = jQuery('#serbx-'+sid).data('cost');
		var costtype = jQuery('#serbx-'+sid).data('costtype');
		var hours = jQuery('#serbx-'+sid).data('hours');
		
		if(couponcode == ""){
			jQuery( "<div class='alert alert-danger'>"+param.req+"</div>" ).insertAfter( "#addcouponcode" );	
			return false;
		}else{
			var data = {
					  "action": "verify_couponcode",
					  "serviceid": sid,
					  "userid": userid,
					  "couponcode": couponcode,
					  "cost": cost,
					  "costtype": costtype,
					  "hours": hours,
					};
					
			var formdata = jQuery.param(data);
			
			jQuery.ajax({

					type: 'POST',

					url: ajaxurl,
					
					beforeSend: function() {
						jQuery('.loading-area').show();
						jQuery('.alert').remove();
					},
					
					data: formdata,
					
					dataType: "json",
					
					success:function (data, textStatus) {
						
						jQuery('.loading-area').hide();
						if(data['status'] == 'success'){
							jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertAfter( "#addcouponcode" );	
							jQuery('#addcouponcode,.sf-couponcode-popup-overlay').fadeOut("slow");
							jQuery('#serbx-'+sid).attr('data-discounttype',data['discount_type']);
							jQuery('#serbx-'+sid).attr('data-discountvalue',data['discount_value']);
							jQuery('#serbx-'+sid).attr('data-coupon','verified');
							jQuery('#serbx-'+sid).attr('data-couponcode',couponcode);
							if(costtype == 'fixed'){
							jQuery('#serbx-'+sid+' .aon-service-price').html(data['discountedcost']);
							}
							calculate_servicecost();
						}else{
							jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertAfter( "#addcouponcode" );	
						}

						return false;
					},
					error:function (xhr, status, error) {
						jQuery('.loading-area').hide();
					}

				});		
		}
		return false;
	});
	
	jQuery('body').on('click', '.verifybookingcoupon', function(){
		jQuery('.alert').remove();
		var userid = jQuery(this).data('userid');	
		var couponcode = jQuery('#couponcode').val();
		
		if(couponcode == ""){
			jQuery( "<div class='alert alert-danger'>"+param.req+"</div>" ).insertAfter( "#addbookingcoupon" );	
			return false;
		}else{
			var data = {
					  "action": "verify_booking_couponcode",
					  "userid": userid,
					  "couponcode": couponcode,
					  "totalcost": totalcost,
					};
					
			var formdata = jQuery.param(data);
			
			jQuery.ajax({

					type: 'POST',

					url: ajaxurl,
					
					beforeSend: function() {
						jQuery('.loading-area').show();
						jQuery('.alert').remove();
					},
					
					data: formdata,
					
					dataType: "json",

					success:function (data, textStatus) {
						
						jQuery('.loading-area').hide();
						if(data['status'] == 'success'){
							jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertAfter( "#addbookingcoupon" );	
							var updatedtotalcost = data['updatedtotalcost'];
							totaldiscount = data['discount'];
							jQuery('#totaldiscount').val(totaldiscount);
							calculate_commisionfee(updatedtotalcost,'discount');
						}else{
							jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertAfter( "#addbookingcoupon" );	
						}

						return false;
					}

				});		
		}
		return false;
	});
	
	function calculate_commisionfee(totalcost,dicountchk = ''){
		if(adminfeetype == 'fixed'){
				adminfee = parseFloat(adminfeefixed);	
				adminfee = adminfee.toFixed(2);
			}else if(adminfeetype == 'percentage'){
				adminfee = parseFloat(totalcost) * (parseFloat(adminfeepercentage)/100);
				adminfee = adminfee.toFixed(2);
			}
			if(dicountchk != 'discount'){
			jQuery("#totalcost").val(totalcost);
			}
			jQuery("#bookingfee").html(currencysymbol+totalcost);
			jQuery("#bookingadminfee").html(currencysymbol+adminfee);
			jQuery("#totalbookingfee").html(currencysymbol+(parseFloat(totalcost) + parseFloat(adminfee)));	
			
			if(adminfee > 0)
			{
			jQuery("#adminfee-outer").show();
			jQuery("#onlyadminfee").html(currencysymbol+adminfee);
			}else
			{
			jQuery("#adminfee-outer").hide();
			jQuery("#onlyadminfee").html(currencysymbol+adminfee);	
			}
	}
	
	/*Get Time Slots*/
			jQuery('ul.timelist').on('click', 'li', function(){
				jQuery(this).addClass('active').siblings().removeClass('active');
				service_finder_resetMembers();
				var slot = jQuery(this).attr('data-source');
				var t = jQuery(this).find("span").html();
				jQuery("#boking-slot").attr('data-slot',t);
				jQuery("#boking-slot").val(slot);
				
				if(jQuery.inArray("availability", caps) > -1 && jQuery.inArray("staff-members", caps) > -1 && staffmember == 'yes'){
				var zipcode = jQuery('input[name="zipcode"]').val();
				var region = jQuery('select[name="region"]').val();
				var provider_id = jQuery('#provider').attr('data-provider');
				var date = jQuery('#selecteddate').attr('data-seldate');
				region = Encoder.htmlEncode(region);
				var data = {
					  "action": "load_members",
					  "zipcode": zipcode,
					  "region": region,
					  "provider_id": provider_id,
					  "date": date,
					  "slot": slot,
					};
				var formdata = jQuery.param(data);
				  
				jQuery.ajax({
	
					type: 'POST',
	
					url: ajaxurl,
	
					data: formdata,
					
					dataType: "json",
					
					beforeSend: function() {
						jQuery('.loading-area').show();
					},
	
					success:function (data, textStatus) {
							jQuery('.loading-area').hide();
							jQuery("#step2").find(".alert").remove();
							 if(data != null){
								if(data['status'] == 'success'){
									jQuery("#step2").find("#members").html(data['members']);
									if(data['totalmember'] > 0){
									jQuery("#step2").find("#members").append('<div class="col-lg-12"><div class="row"><div class="checkbox text-left"><input id="anymember" class="anymember" type="checkbox" name="anymember[]" value="yes" checked><label for="anymember">'+param.anyone+'</label></div></div></div>');
									member_flag = 1;
									}else{
									member_flag = 0;								
									}
									jQuery('.display-ratings').rating();
									jQuery('.sf-show-rating').show();
								}
							}
					}
	
				});	
				}
				
				
			});	
	
	/*Staff member click event*/ 
			jQuery('body').on('click', '.staff-member .sf-element-bx', function(){																		
				var memberid = jQuery(this).attr("data-id");																
				jQuery("#memberid").attr('data-memid',memberid);
				jQuery("#memberid").val(memberid);
				jQuery(".staff-member .sf-element-bx").removeClass('selected');
				jQuery(this).addClass('selected');
				jQuery(this).prop("checked",status);
				jQuery('.anymember').prop("checked",false);
				jQuery(".anymember").removeAttr("disabled");
			});
			/*Add Any member*/
			jQuery('body').on('click', '.anymember', function(){				
				jQuery(".staff-member .sf-element-bx").removeClass('selected');
				jQuery("#memberid").val('');
				jQuery("#memberid").attr('data-memid','');
				
				jQuery(".anymember")
				 .prop("disabled", this.checked)
				 .prop("checked", this.checked);
			});
	
	/*Add to favorite*/
	jQuery('body').on('click', '.add-favorite', function(){

				var providerid = jQuery(this).attr('data-proid');
				var userid = jQuery(this).attr('data-userid');
				var data = {
						  "action": "addtofavorite",
						  "userid": userid,
						  "providerid": providerid
						};
						
				var formdata = jQuery.param(data);
				
				jQuery.ajax({

						type: 'POST',

						url: ajaxurl,
						
						beforeSend: function() {
							jQuery('.loading-area').show();
						},
						
						data: formdata,
						
						dataType: "json",

						success:function (data, textStatus) {
							
							jQuery('.loading-area').hide();
							if(data['status'] == 'success'){
								
								jQuery( '<a href="javascript:;" class="remove-favorite" data-proid="'+providerid+'" data-userid="'+userid+'"><i class="fa fa-heart"></i>'+param.my_fav+'</a>' ).insertBefore( ".add-favorite" );
								jQuery('.add-favorite').remove();

							}

							
						}

					});																
	});
	/*Remove from favorite*/
	jQuery('body').on('click', '.remove-favorite', function(){

				var providerid = jQuery(this).attr('data-proid');
				var userid = jQuery(this).attr('data-userid');
				var data = {
						  "action": "removefromfavorite",
						  "userid": userid,
						  "providerid": providerid
						};
						
				var formdata = jQuery.param(data);
				
				jQuery.ajax({

						type: 'POST',

						url: ajaxurl,
						
						beforeSend: function() {
							jQuery('.loading-area').show();
						},
						
						data: formdata,
						
						dataType: "json",

						success:function (data, textStatus) {
							
							jQuery('.loading-area').hide();
							if(data['status'] == 'success'){
								
								jQuery( '<a href="javascript:;" class="add-favorite" data-proid="'+providerid+'" data-userid="'+userid+'"><i class="fa fa-heart"></i>'+param.add_to_fav+'</a>' ).insertBefore( ".remove-favorite" );
								jQuery('.remove-favorite').remove();

							}

							
						}

					});																
	});
	
	
	provider_id = jQuery('#provider').attr('data-provider');
	
	var data = {
				  "action": "reset_bookingcalendar",
				  "provider_id": provider_id
				};
		
	var formdata = jQuery.param(data);
	
	jQuery.ajax({

				type: 'POST',

				url: ajaxurl,
				
				dataType: "json",
				
				beforeSend: function() {
					jQuery('.loading-area').show();
				},
				
				data: formdata,

				success:function (data, textStatus) {
					jQuery('.loading-area').hide();
					if(data['status'] == 'success'){
					daynumarr = jQuery.parseJSON(data['daynum']);
					datearr = jQuery.parseJSON(data['dates']);
					bookedarr = jQuery.parseJSON(data['bookeddates']);
					disabledates = jQuery.parseJSON(data['disabledates']);
					service_finder_deleteCookie('setselecteddate');
					service_finder_deleteCookie('otppass'); 
					service_finder_deleteCookie('vaildemail');
					jQuery("#my-calendar").zabuto_calendar({
						today: true,
						show_previous: false,
						mode : 'add',
						daynum : daynumarr,
						datearr : datearr,
						bookedarr : bookedarr,
						show_next: disablemonths,
						disabledates : disabledates,
                        action: function () {
							jQuery('.dow-clickable').removeClass("selected");
							jQuery(this).addClass("selected");
							date = jQuery("#" + this.id).data("date");
							service_finder_setCookie('setselecteddate', date); 
                            
							if(jQuery.inArray("availability", caps) > -1 && jQuery.inArray("staff-members", caps) > -1 && staffmember == 'yes'){
								return service_finder_timeslotCallback(this.id, provider_id, totalhours);
							}else if(jQuery.inArray("availability", caps) > -1 && jQuery.inArray("staff-members", caps) > -1 && (staffmember == 'no' || staffmember == "")){
								return service_finder_timeslotCallback(this.id, provider_id, totalhours);
							}else if(jQuery.inArray("availability", caps) > -1 && (jQuery.inArray("staff-members", caps) == -1 || (staffmember == 'no' || staffmember == ""))){
								return service_finder_timeslotCallback(this.id, provider_id, totalhours);
							}else if(jQuery.inArray("availability", caps) == -1 && jQuery.inArray("staff-members", caps) > -1 && staffmember == 'yes'){
								return service_finder_memberCallback(this.id, provider_id);	
							}else if(jQuery.inArray("availability", caps) == -1 && (jQuery.inArray("staff-members", caps) == -1 || (staffmember == 'no' || staffmember == ""))){
								jQuery('#selecteddate').attr('data-seldate',date);
								jQuery('#selecteddate').val(date);
							}
                        },
                    });	
					
					}else if(data['status'] == 'error'){
					}
					
					
				
				}

			});
	
	
	/*Adjust Iframe Height*/
	function service_finder_adjustIframeHeight() {
        var $body   = jQuery('body'),
                $iframe = $body.data('iframe.fv');
        if ($iframe) {
            // Adjust the height of iframe
            $iframe.height($body.height());
        }
    }
	
	
	/*Booking Process*/
	 jQuery('.book-now')
        .bootstrapValidator({
          message: param.not_valid,
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'fa fa-refresh fa-spin'
            },
            fields: {
				zipcode: {
					validators: {
						notEmpty: {
							message: param.postal_code
						},
						remote: {
                        type: 'POST',
                        url: datavalidate+'?provider_id='+provider_id,
                        message: param.postcode_not_avl
                    }
						 
					}
				},
				region: {
					validators: {
						notEmpty: {
							message: param.region
						}
					}
				},
				'service[]': {
					validators: {
						choice: {
							min: 1,
							max: 100,
							message: param.select_service
						}
					}
				},
				firstname: {
					validators: {
						notEmpty: {
							message: param.signup_first_name
						}
					}
				},
				lastname: {
					validators: {
						notEmpty: {
							message: param.signup_last_name
						}
					}
				},
				email: {
                validators: {
                    notEmpty: {
														message: param.req
													},
					emailAddress: {
                        message: param.signup_user_email
                    }
					}
				},
				fillotp: {
					validators: {
						notEmpty: {
														message: param.req
													},
						callback: {
																message: param.otp_right,
																callback: function(value, validator, $field) {
																	if(service_finder_getCookie('otppass') == value && service_finder_getCookie('otppass') != ""){
																	return true;
																	}else{
																	return false;	
																	}
																}
															}
					}
				},
				phone: {
                validators: {
                    notEmpty: {
														message: param.req
													},
                    digits: {message: param.only_digits},
                }
	            },
				address: {
					validators: {
						notEmpty: {
							message: param.signup_address
						}
					}
				},
				city: {
					validators: {
						notEmpty: {
							message: param.city
						}
					}
				},
				country: {
					validators: {
						notEmpty: {
							message: param.signup_country
						}
					}
				},
				bookingpayment_mode: {
					validators: {
						notEmpty: {
							message: param.select_payment
						}
					}
				},
            }
        })
		.on('click',  'input[type="submit"]', function(e) {
           if(jQuery('.book-now select[name="card_month"] option:selected').val()==""){month_flag = 1;jQuery('.book-now select[name="card_month"]').parent('div').addClass('has-error').removeClass('has-success'); jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);}else{month_flag = 0;jQuery('.book-now select[name="card_month"]').parent('div').removeClass('has-error').addClass('has-success'); jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);}
			
			if(jQuery('.book-now select[name="card_year"] option:selected').val()==""){year_flag = 1;jQuery('.book-now select[name="card_year"]').parent('div').addClass('has-error').removeClass('has-success'); jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);}else{year_flag = 0;jQuery('.book-now select[name="card_year"]').parent('div').removeClass('has-error').addClass('has-success'); jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);}
			
			if(jQuery('.book-now select[name="twocheckout_card_month"] option:selected').val()==""){twocheckout_month_flag = 1;jQuery('.book-now select[name="twocheckout_card_month"]').parent('div').addClass('has-error').removeClass('has-success'); jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);}else{twocheckout_month_flag = 0;jQuery('.book-now select[name="twocheckout_card_month"]').parent('div').removeClass('has-error').addClass('has-success'); jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);}
			
			if(jQuery('.book-now select[name="twocheckout_card_year"] option:selected').val()==""){twocheckout_year_flag = 1;jQuery('.book-now select[name="twocheckout_card_year"]').parent('div').addClass('has-error').removeClass('has-success'); jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);}else{twocheckout_year_flag = 0;jQuery('.book-now select[name="twocheckout_card_year"]').parent('div').removeClass('has-error').addClass('has-success'); jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);}
			
	    })
		.on('error.field.bv', function(e, data) {
            data.bv.disableSubmitButtons(false); // disable submit buttons on errors
	    })
		.on('status.field.bv', function(e, data) {
            data.bv.disableSubmitButtons(false); // disable submit buttons on valid
        })
		.on('change', 'input[name="bookingpayment_mode"]', function() {
			var paymode = jQuery(this).val();
			if(paymode == 'stripe'){
				jQuery('#bookingcardinfo').show();
				jQuery('#bookingtwocheckoutcardinfo').hide();
				jQuery('#wiredinfo').hide();
				jQuery('#bookingpayulatamcardinfo').hide();
											jQuery('.book-now')
											.bootstrapValidator('addField', 'card_number', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											})
											.bootstrapValidator('addField', 'card_cvc', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											})
											.bootstrapValidator('addField', 'card_month', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											})
											.bootstrapValidator('addField', 'card_year', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											});
											
											jQuery('.book-now')
											.bootstrapValidator('removeField', 'payulatam_cardtype')
											.bootstrapValidator('removeField', 'payulatam_card_number')
											.bootstrapValidator('removeField', 'payulatam_card_cvc')
											.bootstrapValidator('removeField', 'payulatam_card_month')
											.bootstrapValidator('removeField', 'payulatam_card_year')
											.bootstrapValidator('removeField', 'twocheckout_card_number')
											.bootstrapValidator('removeField', 'twocheckout_card_cvc')
											.bootstrapValidator('removeField', 'twocheckout_card_month')
											.bootstrapValidator('removeField', 'twocheckout_card_year');
											
			}else if(paymode == 'twocheckout'){
				jQuery('#bookingtwocheckoutcardinfo').show();
				jQuery('#bookingcardinfo').hide();
				jQuery('#wiredinfo').hide();
				jQuery('#bookingpayulatamcardinfo').hide();
											jQuery('.book-now')
											.bootstrapValidator('addField', 'twocheckout_card_number', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											})
											.bootstrapValidator('addField', 'twocheckout_card_cvc', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											})
											.bootstrapValidator('addField', 'twocheckout_card_month', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											})
											.bootstrapValidator('addField', 'twocheckout_card_year', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											});
											
											jQuery('.book-now')
											.bootstrapValidator('removeField', 'payulatam_cardtype')
											.bootstrapValidator('removeField', 'payulatam_card_number')
											.bootstrapValidator('removeField', 'payulatam_card_cvc')
											.bootstrapValidator('removeField', 'payulatam_card_month')
											.bootstrapValidator('removeField', 'payulatam_card_year')
											.bootstrapValidator('removeField', 'card_number')
											.bootstrapValidator('removeField', 'card_cvc')
											.bootstrapValidator('removeField', 'card_month')
											.bootstrapValidator('removeField', 'card_year');
			}else if(paymode == 'payulatam'){
				jQuery('#bookingtwocheckoutcardinfo').hide();
				jQuery('#bookingcardinfo').hide();
				jQuery('#wiredinfo').hide();
				jQuery('#bookingpayulatamcardinfo').show();
											jQuery('.book-now')
											.bootstrapValidator('addField', 'payulatam_cardtype', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											})
											.bootstrapValidator('addField', 'payulatam_card_number', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											})
											.bootstrapValidator('addField', 'payulatam_card_cvc', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											})
											.bootstrapValidator('addField', 'payulatam_card_month', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											})
											.bootstrapValidator('addField', 'payulatam_card_year', {
												validators: {
													notEmpty: {
														message: param.req
													},
													digits: {message: param.only_digits},
												}
											});
											
											jQuery('.book-now')
											.bootstrapValidator('removeField', 'card_number')
											.bootstrapValidator('removeField', 'card_cvc')
											.bootstrapValidator('removeField', 'card_month')
											.bootstrapValidator('removeField', 'card_year')
											.bootstrapValidator('removeField', 'twocheckout_card_number')
											.bootstrapValidator('removeField', 'twocheckout_card_cvc')
											.bootstrapValidator('removeField', 'twocheckout_card_month')
											.bootstrapValidator('removeField', 'twocheckout_card_year');
			
			}else if(paymode == 'wired'){
				jQuery('#wiredinfo').show();
				jQuery('#bookingtwocheckoutcardinfo').hide();
				jQuery('#bookingcardinfo').hide();
				jQuery('#bookingpayulatamcardinfo').hide();
											jQuery('.book-now')
											.bootstrapValidator('removeField', 'card_number')
											.bootstrapValidator('removeField', 'card_cvc')
											.bootstrapValidator('removeField', 'card_month')
											.bootstrapValidator('removeField', 'card_year')
											.bootstrapValidator('removeField', 'payulatam_cardtype')
											.bootstrapValidator('removeField', 'payulatam_card_number')
											.bootstrapValidator('removeField', 'payulatam_card_cvc')
											.bootstrapValidator('removeField', 'payulatam_card_month')
											.bootstrapValidator('removeField', 'payulatam_card_year')
											.bootstrapValidator('removeField', 'twocheckout_card_number')
											.bootstrapValidator('removeField', 'twocheckout_card_cvc')
											.bootstrapValidator('removeField', 'twocheckout_card_month')
											.bootstrapValidator('removeField', 'twocheckout_card_year');
			}else{
				jQuery('#bookingcardinfo').hide();
				jQuery('#bookingtwocheckoutcardinfo').hide();
				jQuery('#wiredinfo').hide();
				jQuery('#bookingpayulatamcardinfo').hide();
											jQuery('.book-now')
											.bootstrapValidator('removeField', 'card_number')
											.bootstrapValidator('removeField', 'card_cvc')
											.bootstrapValidator('removeField', 'card_month')
											.bootstrapValidator('removeField', 'card_year')
											.bootstrapValidator('removeField', 'payulatam_cardtype')
											.bootstrapValidator('removeField', 'payulatam_card_number')
											.bootstrapValidator('removeField', 'payulatam_card_cvc')
											.bootstrapValidator('removeField', 'payulatam_card_month')
											.bootstrapValidator('removeField', 'payulatam_card_year')
											.bootstrapValidator('removeField', 'twocheckout_card_number')
											.bootstrapValidator('removeField', 'twocheckout_card_cvc')
											.bootstrapValidator('removeField', 'twocheckout_card_month')
											.bootstrapValidator('removeField', 'twocheckout_card_year');
			}
		})
		.on('click', '.otp', function() {
				
				var emailid = jQuery("#email").val();
				jQuery(".alert-danger").remove();
				if(emailid == ''){
					jQuery( '<div class="alert alert-danger">'+param.email_req+'</div>' ).insertAfter( ".otp-section .input-group" );
					return false;
				}
				var data = {
						  "action": "sendotp",
						  "emailid": emailid,
						};
						
				var formdata = jQuery.param(data);
				
				jQuery.ajax({

						type: 'POST',

						url: ajaxurl,
						
						beforeSend: function() {
							jQuery('.loading-area').show();
						},
						
						data: formdata,

						success:function (data, textStatus) {
							jQuery('.loading-area').hide();
							jQuery( '<div class="alert alert-success padding-5 otpsuccess">'+param.otp_mail+'</div>' ).insertAfter( ".otp-section .input-group" );
							service_finder_clearconsole();
							service_finder_setCookie('otppass', data); 
							service_finder_setCookie('vaildemail',emailid);
							jQuery(".otp").remove();
							
											jQuery('.book-now')
											.bootstrapValidator('addField', 'fillotp', {
												validators: {
															notEmpty: {
																message: param.otp_right	
															},
															callback: {
																message: param.right,
																callback: function(value, validator, $field) {
																	if(service_finder_getCookie('otppass') == value){
																	return true;
																	}else{
																	return false;	
																	}
																}
															}
														}
											})
											.bootstrapValidator('addField', 'email', {
												validators: {
															emailAddress: {
																message: param.signup_user_email
															},
															callback: {
																message: 'Please re-confirm the email address',
																callback: function(value, validator, $field) {
																	if(service_finder_getCookie('vaildemail') == value){
																	return true;
																	}else{
																	jQuery(".otp").remove();
																	jQuery(".otpsuccess").remove();	
																	jQuery( '<a href="javascript:;" class="otp">'+param.gen_otp+'</a>' ).insertAfter( ".otp-section .input-group" );
																	return false;	
																	}
																}
															}
														}
											});
						}

					});					  
		})
        .bootstrapWizard({
            tabClass: 'nav nav-pills',
            onTabClick: function(tab, navigation, index) {
				return false;
				if(booking_basedon == 'region'){
					if(index == 0){
						if(jQuery('.book-now select[name="region"] option:selected').val()==""){
							region_flag = 1;
							jQuery('.book-now select[name="region"]').parent('div').addClass('has-error').removeClass('has-success'); 
						}else{
							region_flag = 0;
							jQuery('.book-now select[name="region"]').parent('div').removeClass('has-error').addClass('has-success'); 
						}
						if(region_flag==1){return false;}
						
					}
				}
				jQuery("#step1").find(".alert").remove();
				if(service_flag == 0 && booking_charge_on_service == 'yes' && (skip_service == 0)){
					jQuery("#step1").find('.tab-service-area').append('<div class="col-md-12 clearfix"><div class="alert alert-danger">'+param.select_service+'</div></div>');
					return false;
				}
				if(index == 1 || index == 3 || index == 4){
				jQuery('.book-now').find('input[type="submit"]').prop('disabled', false);
			  	var $validator = jQuery('.book-now').data('bootstrapValidator').validate();
					 if($validator.isValid()){
					jQuery("#step2").find(".alert").remove();
						
						var date = jQuery('#selecteddate').attr('data-seldate');
						if(jQuery.inArray("availability", caps) > -1){
							var getslot = jQuery("#boking-slot").attr("data-slot");
							if(getslot != ""){
								if(member_flag == 1){
								return true;
								}else{
								jQuery("#step2").find('.tab-pane-inr').append('<div class="col-md-12 clearfix"><div class="alert alert-danger">'+param.member_select+'</div></div>');
								return false;	
								}
							}else{
								jQuery("#step2").find('.tab-pane-inr').append('<div class="col-md-12 clearfix"><div class="alert alert-danger">'+param.timeslot+'</div></div>');
								return false;
							}	
						}else{
							return true;	
						}
					 }else{
						return false;	 
					 }
			  
			  }else{
				var $validator = jQuery('.book-now').data('bootstrapValidator').validate();
                                   return $validator.isValid();  
			  }
            },
            onNext: function(tab, navigation, index) {
              var numTabs    = jQuery('#rootwizard').find('.tab-pane').length;
             jQuery("html, body").animate({
				scrollTop: jQuery(".form-wizard").offset().top
			}, 1000);
			
			 if(booking_basedon == 'region'){
				if(index == 1){
					if(jQuery('.book-now select[name="region"] option:selected').val()==""){
						region_flag = 1;
						jQuery('.book-now select[name="region"]').parent('div').addClass('has-error').removeClass('has-success'); 
					}else{
						region_flag = 0;
						jQuery('.book-now select[name="region"]').parent('div').removeClass('has-error').addClass('has-success'); 
					}
					if(region_flag==1){return false;}
				}
			}
			jQuery("#step1").find(".alert").remove();
			if(service_flag == 0 && booking_charge_on_service == 'yes' && (skip_service == 0)){
				jQuery("#step1").find('.tab-service-area').append('<div class="col-md-12 clearfix"><div class="alert alert-danger">'+param.select_service+'</div></div>');
				return false;
			}
			 if(index == 2){
			  	
					jQuery("#step2").find(".alert").remove();
						var getslot = jQuery("#boking-slot").attr("data-slot");
						var date = jQuery('#selecteddate').attr('data-seldate');
						
						calculate_commisionfee(totalcost);
						
						jQuery("#selecteddate").val(date);
						if(jQuery.inArray("availability", caps) > -1){
							if(getslot != ""){
								if(member_flag == 1){
								return true;
								}else{
								jQuery("#step2").find('.tab-pane-inr').append('<div class="col-md-12 clearfix"><div class="alert alert-danger">'+param.member_select+'</div></div>');
								return false;	
								}
							}else{
								jQuery("#step2").find('.tab-pane-inr').append('<div class="col-md-12 clearfix"><div class="alert alert-danger">'+param.timeslot+'</div></div>');
								return false;
							}	
						}else{
							return true;	
						}
						
			  
			  }else if(index  == 3){
				  var $validator = jQuery('.book-now').data('bootstrapValidator').validate();
				  if($validator.isValid()){
					 if(totalcost > 0){
					 if(woopayment){
							
							if(walletsystem == true || skipoption == true || (offersystem == true && offermethod == 'booking')){

								var $html = '';
								if(offersystem == true && offermethod == 'booking'){
								$html += '<div class="viewcoupon-bx">' +
										'<button class="btn btn-primary btn-sm" data-toggle="collapse" data-target="#addwoobookingcoupon"><i class="fa fa-arrow-circle-down"></i> '+param.have_coupon+'</button> ' +
										'<div id="addwoobookingcoupon" class="collapse">' +
										'<input type="text" name="woocouponcode" id="woocouponcode" class="form-control sf-form-control">' +
										'<a href="javascropt:;" class="verifywoobookingcoupon btn btn-custom">'+param.verify+'</a>' +
										'</div> ' +
										'</div> ';
								}
								if(walletsystem == true || skipoption == true){
								$html += '<div id="bookingwalletpayment" class="bookingwallet-bx">';
								if(walletsystem == true){
								$html += '<ul class="list-unstyled clear">'+
											'<li>'+
													'<h5>'+param.wallet_balance+'</h5>'+
													'<strong>'+walletamountwithcurrency+'</strong>'+
												'</li>'+
											'</ul>';
								$html += '<div class="radio sf-radio-checkbox sf-payments-outer">'+
										  '<input type="radio" value="wallet" name="booking_woopayment" id="booking_wallet" >'+
										  '<label for="booking_wallet">'+param.wallet+'</label>'+
										  '<img src="'+imgpath+'/payment/wallet.jpg" title="'+param.wallet+'" alt="'+param.wallet+'">'+
										'</div> ';
								}
								$html += '<div class="radio sf-radio-checkbox sf-payments-outer">'+
										  '<input type="radio" value="woopayment" name="booking_woopayment" id="booking_woopayment" >'+
										  '<label for="booking_woopayment">'+param.checkout+'</label>'+
										  '<img src="'+imgpath+'/payment/woopayment.jpg" title="'+param.checkout+'" alt="'+param.checkout+'">'+
										'</div> ';
								if(skipoption == true){		
								$html += '<div class="radio sf-radio-checkbox sf-payments-outer">'+
										  '<input type="radio" value="skippayment" name="booking_woopayment" id="booking_skippayment" >'+
										  '<label for="booking_skippayment">'+param.skip_payment+'</label>'+
										'</div> ';		
								}
								$html += '</div>';
								}
								
								bootbox.dialog({
									title: "",
									message: $html,
									buttons: {
										success: {
											label: param.continue_lable,
											className: "btn-primary",
											callback: function () {
												var woooption = jQuery('#bookingwalletpayment').find('input[name=booking_woopayment]:checked').val();
												
												if(woooption == undefined){
													woooption = '';
												}
												
												if(woooption == '' && (walletsystem == true || skipoption == true)){
													jQuery('.alert').remove();	
													jQuery( "<div class='alert alert-danger'>"+param.payment_method_req+"</div>" ).insertAfter( "#bookingwalletpayment" );
													return false;
												}
												if(woooption == "wallet"){
													if(charge_admin_fee_from == 'customer')
													{
														var walletchargeamount = parseFloat(totalcost) + parseFloat(adminfee);
													}else{
														var walletchargeamount = parseFloat(totalcost);
													}
													if(parseFloat(walletamount) < parseFloat(walletchargeamount)){
														jQuery( "<div class='alert alert-danger'>"+param.insufficient_wallet_amount+"</div>" ).insertBefore( "#bookingwalletpayment" );
															jQuery("html, body").animate({
															scrollTop: jQuery(".alert-danger").offset().top
														}, 1000);	
														return false;	
													}
													var data = {
													  "action": "walletcheckout",
													  "provider": provider_id,
													  "totalcost": parseFloat(totalcost),
													  "bookingdate": date,
													  "bookingpayment_mode": 'wallet',
													};
													
													var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
													
													jQuery.ajax({
															type: 'POST',
															url: ajaxurl,
															dataType: "json",
															beforeSend: function() {
															jQuery('.loading-area').show();
															},
															data: formdata,
															success:function (data, textStatus) {
																jQuery('.loading-area').hide();
																jQuery('.alert').remove();
																jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
																if(data['status'] == 'success'){
																	jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertBefore( "#book-now-section" );	
																	if(data['redirecturl'] != ''){
																	window.location = data['redirecturl'];	
																	}else{
																	jQuery("#step4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
																	jQuery(".wizard-actions").remove();
																	}
																}else if(data['status'] == 'error'){
																	jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
																	jQuery("html, body").animate({
																	scrollTop: jQuery(".alert-danger").offset().top
																}, 1000);
																}
															}
														});	
												}else if(woooption == "skippayment"){
													var data = {
													  "action": "freecheckout",
													  "provider": provider_id,
													  "totalcost": totalcost,
													  "bookingdate": date,
													  "bookingpayment_mode": 'skippayment'
													};
													
													var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
													
													jQuery.ajax({
										
																type: 'POST',
										
																url: ajaxurl,
																
																dataType: "json",
																
																beforeSend: function() {
																jQuery('.loading-area').show();
																},
																
																data: formdata,
										
																success:function (data, textStatus) {
																	jQuery('.loading-area').hide();
																	jQuery('.alert').remove();
																	jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
																	if(data['status'] == 'success'){
																		jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertBefore( "#book-now-section" );	
																		jQuery("html, body").animate({
																			scrollTop: jQuery(".alert-success").offset().top
																		}, 1000);
																		if(data['redirecturl'] != ''){
																		window.location = data['redirecturl'];	
																		}else{
																		jQuery("#panel-4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
																		}
																		
																				
																	}else if(data['status'] == 'error'){
																		jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
																		jQuery("html, body").animate({
																			scrollTop: jQuery(".alert-danger").offset().top
																		}, 1000);
																	}
																	
																}
										
															});	
												}else{
													addto_woo_payment();	
												}
											}
										}
									}
								})
								.on('shown.bs.modal',function () {
									jQuery('body').on('click', '.verifywoobookingcoupon', function(){
									jQuery('.alert').remove();
									var couponcode = jQuery('#woocouponcode').val();
									
									if(couponcode == ""){
										jQuery( "<div class='alert alert-danger'>"+param.req+"</div>" ).insertAfter( "#addwoobookingcoupon" );	
										return false;
									}else{
										var data = {
												  "action": "verify_booking_couponcode",
												  "userid": provider_id,
												  "couponcode": couponcode,
												  "totalcost": totalcost,
												};
												
										var formdata = jQuery.param(data);
										
										jQuery.ajax({
							
												type: 'POST',
							
												url: ajaxurl,
												
												beforeSend: function() {
													jQuery('.loading-area').show();
													jQuery('.alert').remove();
												},
												
												data: formdata,
												
												dataType: "json",
							
												success:function (data, textStatus) {
													
													jQuery('.loading-area').hide();
													if(data['status'] == 'success'){
														jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertAfter( "#addwoobookingcoupon" );	
														var updatedtotalcost = data['updatedtotalcost'];
														totaldiscount = data['discount'];
														jQuery('#totaldiscount').val(totaldiscount);
														jQuery('#couponcode').val(couponcode);
														calculate_commisionfee(updatedtotalcost,'discount');
														
													}else{
														jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertAfter( "#addwoobookingcoupon" );	
													}
							
													return false;
												}
							
											});		
									}
									return false;
								});							   
								});	
							}else{
								addto_woo_payment();	
							}
							return false;
							
							}else{
					  jQuery('#submitlink').hide();
					  jQuery('#submitbtn').show();
					  return true;
					  }
					 }else{
							var data = {
							  "action": "freecheckout",
							  "provider": provider_id,
							  "totalcost": totalcost,
							  "bookingdate": date,
							  "bookingpayment_mode": 'skippayment'
							};
							
							var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
							
							jQuery.ajax({
				
										type: 'POST',
				
										url: ajaxurl,
										
										dataType: "json",
										
										beforeSend: function() {
										jQuery('.loading-area').show();
										},
										
										data: formdata,
				
										success:function (data, textStatus) {
											jQuery('.loading-area').hide();
											jQuery('.alert').remove();
											jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
											if(data['status'] == 'success'){
												jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertBefore( "#book-now-section" );	
												jQuery("html, body").animate({
													scrollTop: jQuery(".alert-success").offset().top
												}, 1000);
												if(data['redirecturl'] != ''){
												window.location = data['redirecturl'];	
												}else{
												jQuery("#panel-4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
												}
												
														
											}else if(data['status'] == 'error'){
												jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
												jQuery("html, body").animate({
													scrollTop: jQuery(".alert-danger").offset().top
												}, 1000);
											}
											
										}
				
									});		
									return false;
							}
				  }else{
					return false;  
				  }
				  
			  }else if(index  == 4){
				   jQuery('.book-now').find('input[type="submit"]').prop('disabled', false);
					var $validator = jQuery('.book-now').data('bootstrapValidator').validate();
					if($validator.isValid()){		
					var paymode = jQuery('input[name="bookingpayment_mode"]:checked').val();
					if(paymode == 'stripe'){
						var card_number = jQuery('input[name="card_number"]').val();
						var card_cvc = jQuery('input[name="card_cvc"]').val();
						var card_month = jQuery('input[name="card_month"]').val();
						var card_year = jQuery('input[name="card_year"]').val();
						if(month_flag==1 || year_flag==1){return false;}
						if(card_number != "" && card_cvc != "" && card_month != "" && card_year != ""){	
						jQuery('.loading-area').show();
						
						if(stripepublickey != ""){
						Stripe.setPublishableKey(stripepublickey);
							 Stripe.card.createToken({
						  number: jQuery('#card_number').val(),
						  cvc: jQuery('#card_cvc').val(),
						  exp_month: jQuery('#card_month').val(),
						  exp_year: jQuery('#card_year').val()
						}, service_finder_stripeResponseHandler);
						}else{
							jQuery('.loading-area').hide();
							jQuery( "<div class='alert alert-danger'>"+param.pub_key+"</div>" ).insertBefore( "#book-now-section" );
							jQuery("html, body").animate({
									scrollTop: jQuery(".alert-danger").offset().top
								}, 1000);
						}	 
						
						}
					}else if(paymode == 'twocheckout'){
					
								var twocheckout_card_number = jQuery('input[name="twocheckout_card_number"]').val();
								var twocheckout_card_cvc = jQuery('input[name="twocheckout_card_cvc"]').val();
								var twocheckout_card_month = jQuery('select[name="twocheckout_card_month"]').val();
								var twocheckout_card_year = jQuery('select[name="twocheckout_card_year"]').val();
								if(twocheckout_month_flag==1 || twocheckout_year_flag==1){return false;}
								if(twocheckout_card_number != "" && twocheckout_card_cvc != "" && twocheckout_card_month != "" && twocheckout_card_year != ""){	
								//jQuery('.loading-area').show();
								
								if(twocheckoutpublishkey != ""){
								 
								try {
									TCO.loadPubKey(twocheckoutmode);
									jQuery('.loading-area').show();
									tokenRequest();
								} catch(e) {
									jQuery(".alert-success,.alert-danger").remove();
									jQuery('.loading-area').hide();
									jQuery( "<div class='alert alert-danger'>"+e.toSource()+"</div>" ).insertBefore( "#book-now-section" );
									jQuery("html, body").animate({
											scrollTop: jQuery(".alert-danger").offset().top
										}, 1000);
			
								}
								
								}else{
									jQuery('.loading-area').hide();
									jQuery( "<div class='alert alert-danger'>"+param.pub_key+"</div>" ).insertBefore( "#book-now-section" );
									jQuery("html, body").animate({
											scrollTop: jQuery(".alert-danger").offset().top
										}, 1000);
								}	 
								
								
									 
								}
					
					}else if(paymode == 'paypal' || paymode == 'payumoney'){
					
											jQuery('.book-now')
											.on('success.form.bv', function(form) {
												
												jQuery("#totalcost").val(totalcost);
												jQuery("#selecteddate").val(date);
												return true;
											});
					
					}else if(paymode == 'payulatam'){
					// Prevent form submission
					form.preventDefault();
					var crd_type = jQuery('#payulatam_cardtype').val();
					var crd_number = jQuery('#payulatam_card_number').val();
					var crd_cvc = jQuery('#payulatam_card_cvc').val();
					var crd_month = jQuery('#payulatam_card_month').val();
					var crd_year = jQuery('#payulatam_card_year').val();
					if(crd_type != "" && crd_number != "" && crd_cvc != "" && crd_month != "" && crd_year != ""){	
					jQuery('.loading-area').show();
					
					var data = {
						  "action": "payulatam_checkout",
						};
						
					var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
					
					jQuery.ajax({
							type: 'POST',
							url: ajaxurl,
							data: formdata,
							dataType: "json",
							success:function (data, textStatus) {
								jQuery('.loading-area').hide();
								jQuery('.alert').remove();
								jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
								if(data['status'] == 'success'){
									jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertBefore( "#book-now-section" );	
									if(data['redirecturl'] != ''){
									window.location = data['redirecturl'];	
									}else{
									jQuery("#step4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
									jQuery(".wizard-actions").remove();
									}
									
											
								}else if(data['status'] == 'error'){
									jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
									jQuery("html, body").animate({
									scrollTop: jQuery(".alert-danger").offset().top
								}, 1000);
								}
								
							}
					});		
						
						 
					}
		
				
					}else if(paymode == 'wired' || paymode == 'cod' || paymode == 'skippayment'){
											
											form.preventDefault();
											
											var data = {
											  "action": "freecheckout",
											  "provider": provider_id,
											  "totalcost": totalcost,
											  "bookingdate": date,
											};
											
											var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
											
											jQuery.ajax({
							
													type: 'POST',
							
													url: ajaxurl,
													
													dataType: "json",
													
													beforeSend: function() {
													jQuery('.loading-area').show();
													},
													
													data: formdata,
							
													success:function (data, textStatus) {
														jQuery('.loading-area').hide();
														jQuery('.alert').remove();
														jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
														if(data['status'] == 'success'){
															jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertBefore( "#book-now-section" );	
															if(data['redirecturl'] != ''){
															window.location = data['redirecturl'];	
															}else{
															jQuery("#step4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
															jQuery(".wizard-actions").remove();
															}
															
																	
														}else if(data['status'] == 'error'){
															jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
															jQuery("html, body").animate({
															scrollTop: jQuery(".alert-danger").offset().top
														}, 1000);
														}
														
													}
							
												});
					
					}else if(paymode == 'wallet'){
					
						form.preventDefault();
						
						if(charge_admin_fee_from == 'customer')
						{
							var walletchargeamount = parseFloat(totalcost) + parseFloat(adminfee);
						}else{
							var walletchargeamount = parseFloat(totalcost);
						}
						if(parseFloat(walletamount) < parseFloat(walletchargeamount)){
							jQuery( "<div class='alert alert-danger'>"+param.insufficient_wallet_amount+"</div>" ).insertBefore( "#book-now-section" );
							jQuery("html, body").animate({
								scrollTop: jQuery(".alert-danger").offset().top
							}, 1000);	
							return false;	
						}
						var data = {
						  "action": "walletcheckout",
						  "provider": provider_id,
						  "totalcost": parseFloat(totalcost),
						  "bookingdate": date,
						};
						
						var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
						
						jQuery.ajax({
								type: 'POST',
								url: ajaxurl,
								dataType: "json",
								beforeSend: function() {
								jQuery('.loading-area').show();
								},
								data: formdata,
								success:function (data, textStatus) {
									jQuery('.loading-area').hide();
									jQuery('.alert').remove();
									jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
									if(data['status'] == 'success'){
										jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertBefore( "#book-now-section" );	
										if(data['redirecturl'] != ''){
										window.location = data['redirecturl'];	
										}else{
										jQuery("#step4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
										jQuery(".wizard-actions").remove();
										}
									}else if(data['status'] == 'error'){
										jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
										jQuery("html, body").animate({
										scrollTop: jQuery(".alert-danger").offset().top
									}, 1000);
									}
								}
							});
						
					}
					}else{
						return false;	
					}
						
			  }else{
				var $validator = jQuery('.book-now').data('bootstrapValidator').validate();
                                   return $validator.isValid();  
			  }
			  
            },
            onPrevious: function(tab, navigation, index) {
				jQuery("html, body").animate({
				scrollTop: jQuery(".form-wizard").offset().top
			}, 1000);
				
				jQuery('#submitlink').show();
				jQuery('#submitbtn').hide();
				
                return true;
            },
            onTabShow: function(tab, navigation, index) {
                // Update the label of Next button when we are at the last tab
                var numTabs = jQuery('#rootwizard').find('.tab-pane').length;
                jQuery('#rootwizard')
                    .find('.next')
                        .removeClass('disabled')    // Enable the Next button
                        .find('a')
                        .html(index === numTabs - 1 ? param.paynow : param.next_text+' <i class="fa fa-arrow-right"></i>');

                // You don't need to care about it
                // It is for the specific demo
                service_finder_adjustIframeHeight();
				var $total = navigation.find('li').length;
			var $current = index+1;
			var $percent = ($current/$total) * 100;
			jQuery('#rootwizard').find('.progress-bar').css({width:$percent+'%'});
            }
        })
		.on('success.form.bv', function(form) {
            // Prevent form submission
			jQuery('.book-now').find('input[type="submit"]').prop('disabled', false);
	        var paymode = jQuery('input[name="bookingpayment_mode"]:checked').val();
			if(paymode == 'stripe'){
			form.preventDefault();
			
						var card_number = jQuery('input[name="card_number"]').val();
						var card_cvc = jQuery('input[name="card_cvc"]').val();
						var card_month = jQuery('input[name="card_month"]').val();
						var card_year = jQuery('input[name="card_year"]').val();
						if(month_flag==1 || year_flag==1){return false;}
						if(card_number != "" && card_cvc != "" && card_month != "" && card_year != ""){	
						jQuery('.loading-area').show();
						if(stripepublickey != ""){
						Stripe.setPublishableKey(stripepublickey);
							 Stripe.card.createToken({
						  number: jQuery('#card_number').val(),
						  cvc: jQuery('#card_cvc').val(),
						  exp_month: jQuery('#card_month').val(),
						  exp_year: jQuery('#card_year').val()
						}, service_finder_stripeResponseHandler);
						}else{
							jQuery('.loading-area').hide();
							jQuery( "<div class='alert alert-danger'>"+param.pub_key+"</div>" ).insertBefore( "#book-now-section" );
							jQuery("html, body").animate({
									scrollTop: jQuery(".alert-danger").offset().top
								}, 1000);
						}	 
						
						
							 
						}
					
			}else if(paymode == 'twocheckout'){
			form.preventDefault();
			
						if(twocheckout_month_flag==1 || twocheckout_year_flag==1){return false;}
						//jQuery('.loading-area').show();
						if(twocheckoutpublishkey != ""){
							
							try {
								TCO.loadPubKey(twocheckoutmode);
								jQuery('.loading-area').show();
								tokenRequest();
							} catch(e) {
								jQuery('.loading-area').hide();
								jQuery(".alert-success,.alert-danger").remove();
								jQuery( "<div class='alert alert-danger'>"+e.toSource()+"</div>" ).insertBefore( "#book-now-section" );
								jQuery("html, body").animate({
										scrollTop: jQuery(".alert-danger").offset().top
									}, 1000);
		
							}
						
						}else{
							jQuery('.loading-area').hide();
							jQuery( "<div class='alert alert-danger'>"+param.pub_key+"</div>" ).insertBefore( "#book-now-section" );
							jQuery("html, body").animate({
									scrollTop: jQuery(".alert-danger").offset().top
								}, 1000);
						}	 
						
			}else if(paymode == 'payulatam'){
					// Prevent form submission
					form.preventDefault();
					var crd_type = jQuery('#payulatam_cardtype').val();
					var crd_number = jQuery('#payulatam_card_number').val();
					var crd_cvc = jQuery('#payulatam_card_cvc').val();
					var crd_month = jQuery('#payulatam_card_month').val();
					var crd_year = jQuery('#payulatam_card_year').val();
					if(crd_type != "" && crd_number != "" && crd_cvc != "" && crd_month != "" && crd_year != ""){	
					jQuery('.loading-area').show();
					
					var data = {
						  "action": "payulatam_checkout",
						};
						
					var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
					
					jQuery.ajax({
							type: 'POST',
							url: ajaxurl,
							data: formdata,
							dataType: "json",
							success:function (data, textStatus) {
								jQuery('.loading-area').hide();
								jQuery('.alert').remove();
								jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
								if(data['status'] == 'success'){
									jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertBefore( "#book-now-section" );	
									if(data['redirecturl'] != ''){
									window.location = data['redirecturl'];	
									}else{
									jQuery("#step4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
									jQuery(".wizard-actions").remove();
									}
									
											
								}else if(data['status'] == 'error'){
									jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
									jQuery("html, body").animate({
									scrollTop: jQuery(".alert-danger").offset().top
								}, 1000);
								}
								
							}
					});		
						
						 
					}
		
				
					
			}else if(paymode == 'wired' || paymode == 'cod' || paymode == 'skippayment'){
				form.preventDefault();
											var data = {
											  "action": "freecheckout",
											  "provider": provider_id,
											  "totalcost": totalcost,
											  "bookingdate": date,
											};
											
											var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
											
											jQuery.ajax({
							
													type: 'POST',
							
													url: ajaxurl,
													
													dataType: "json",
													
													beforeSend: function() {
													jQuery('.loading-area').show();
													},
													
													data: formdata,
							
													success:function (data, textStatus) {
														jQuery('.loading-area').hide();
														jQuery('.alert').remove();
														jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
														if(data['status'] == 'success'){
															jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertBefore( "#book-now-section" );	
															if(data['redirecturl'] != ''){
															window.location = data['redirecturl'];	
															}else{
															jQuery("#step4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
															jQuery(".wizard-actions").remove();
															}
															
																	
														}else if(data['status'] == 'error'){
															jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
															jQuery("html, body").animate({
															scrollTop: jQuery(".alert-danger").offset().top
														}, 1000);
														}
														
													}
							
												});
					
					}else if(paymode == 'wallet'){
					
						form.preventDefault();
						
						if(charge_admin_fee_from == 'customer')
						{
							var walletchargeamount = parseFloat(totalcost) + parseFloat(adminfee);
						}else{
							var walletchargeamount = parseFloat(totalcost);
						}
						if(parseFloat(walletamount) < parseFloat(walletchargeamount)){
							jQuery( "<div class='alert alert-danger'>"+param.insufficient_wallet_amount+"</div>" ).insertBefore( "#book-now-section" );
								jQuery("html, body").animate({
								scrollTop: jQuery(".alert-danger").offset().top
							}, 1000);	
							return false;	
						}
						var data = {
						  "action": "walletcheckout",
						  "provider": provider_id,
						  "totalcost": parseFloat(totalcost),
						  "bookingdate": date,
						};
						
						var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
						
						jQuery.ajax({
								type: 'POST',
								url: ajaxurl,
								dataType: "json",
								beforeSend: function() {
								jQuery('.loading-area').show();
								},
								data: formdata,
								success:function (data, textStatus) {
									jQuery('.loading-area').hide();
									jQuery('.alert').remove();
									jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
									if(data['status'] == 'success'){
										jQuery( "<div class='alert alert-success'>"+data['suc_message']+"</div>" ).insertBefore( "#book-now-section" );	
										if(data['redirecturl'] != ''){
										window.location = data['redirecturl'];	
										}else{
										jQuery("#step4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
										jQuery(".wizard-actions").remove();
										}
									}else if(data['status'] == 'error'){
										jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
										jQuery("html, body").animate({
										scrollTop: jQuery(".alert-danger").offset().top
									}, 1000);
									}
								}
							});
						
					}
		});

		function addto_woo_payment(){

		var data = {
		  "action": "sf_add_to_woo_cart",
		  "wootype": "booking",
		  "provider": provider_id,
		  "totalcost": totalcost,
		  "bookingdate": date
		};
		
		var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
		
		jQuery.ajax({
			type        : 'POST',
			url         : ajaxurl,
			data        : formdata,
			dataType    : 'json',
			xhrFields   : { withCredentials: true },
			crossDomain : 'withCredentials' in new XMLHttpRequest(),
			success     : function (response) {
				if (response['success']) {
					window.location.href = cart_url;
				} else {
					jQuery(".alert-success,.alert-danger").remove();
					jQuery( "<div class='alert alert-danger'>"+response.error+"</div>" ).insertBefore( "#book-now-section" );
					jQuery("html, body").animate({
							scrollTop: jQuery(".alert-danger").offset().top
						}, 1000);
				}
			}
		});  
		return false;	
	}
		/*Stripe Handler*/
		function service_finder_stripeResponseHandler(status, response) {
  
			  if (response.error) {
				  // Show the errors on the form
				  jQuery('.loading-area').hide();
				  jQuery( "<div class='alert alert-danger'>"+response.error.message+"</div>" ).insertBefore( "#book-now-section" );
				  jQuery("html, body").animate({
										scrollTop: jQuery(".alert-danger").offset().top
									}, 1000);
				
			  } else {
				// response contains id and card, which contains additional card details
				var token = response.id;
				
				/*To Add Service cost also in minimum cost*/
				
				var data = {
						  "action": "checkout",
						  "provider": provider_id,
						  "stripeToken": token,
						  "totalcost": totalcost,
						  "bookingdate": date
						};
						
				var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
				
				jQuery.ajax({

						type: 'POST',

						url: ajaxurl,
						
						dataType: "json",
						
						beforeSend: function() {
						},
						
						data: formdata,

						success:function (data, textStatus) {
							jQuery('.loading-area').hide();
							jQuery('.alert').remove();
							jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
							if(data['status'] == 'success'){
								jQuery("#step4").find(".panel-summary").html("<div class='alert alert-success'>"+param.booking_suc+"</div>");
								if(data['redirecturl'] != ''){
								window.location = data['redirecturl'];	
								}else{
								jQuery("#step4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
								jQuery(".wizard-actions").remove();
								}
								
										
							}else if(data['status'] == 'error'){
								jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
								jQuery("html, body").animate({
										scrollTop: jQuery(".alert-danger").offset().top
									}, 1000);
							}
							
						}

					});
    
 				}
		}
		
		var tokenRequest = function() {
		
		var twocheckout_card_number = jQuery('input[name="twocheckout_card_number"]').val();
		var twocheckout_card_cvc = jQuery('input[name="twocheckout_card_cvc"]').val();
		var twocheckout_card_month = jQuery('select[name="twocheckout_card_month"]').val();
		var twocheckout_card_year = jQuery('select[name="twocheckout_card_year"]').val();
		
		// Setup token request arguments
		var args = {
		  sellerId: twocheckoutaccountid,
		  publishableKey: twocheckoutpublishkey,
		  ccNo: twocheckout_card_number,
		  cvv: twocheckout_card_cvc,
		  expMonth: twocheckout_card_month,
		  expYear: twocheckout_card_year
		};

		// Make the token request
		TCO.requestToken(successCallback, errorCallback, args);
	  };
		
		 // Called when token created successfully.
		  var successCallback = function(data) {
			// Set the token as the value for the token input
			var token = data.response.token.token;
				
				/*To Add Service cost also in minimum cost*/
				
				var data = {
						  "action": "twocheckout",
						  "provider": provider_id,
						  "twocheckouttoken": token,
						  "totalcost": totalcost,
						  "bookingdate": date
						};
						
				var formdata = jQuery('form.book-now').serialize() + "&" + jQuery.param(data);
				
				jQuery.ajax({

						type: 'POST',

						url: ajaxurl,
						
						dataType: "json",
						
						beforeSend: function() {
								jQuery('.loading-area').show();
						},
						
						data: formdata,

						success:function (data, textStatus) {
							jQuery('.loading-area').hide();
							jQuery('.alert').remove();
							jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
							if(data['status'] == 'success'){
								jQuery("#step4").find(".panel-summary").html("<div class='alert alert-success'>"+param.booking_suc+"</div>");
								if(data['redirecturl'] != ''){
								window.location = data['redirecturl'];	
								}else{
								jQuery("#step4 .tab-pane-inr").html('<h3>'+param.booking_suc+'</h3>');
								jQuery(".wizard-actions").remove();
								}
								
										
							}else if(data['status'] == 'error'){
								jQuery( "<div class='alert alert-danger'>"+data['err_message']+"</div>" ).insertBefore( "#book-now-section" );
								jQuery("html, body").animate({
										scrollTop: jQuery(".alert-danger").offset().top
									}, 1000);
							}
							
						}

					});
		
		  };
		
		  // Called when token creation fails.
		  var errorCallback = function(data) {
			if (data.errorCode === 200) {
			  // This error code indicates that the ajax call failed. We recommend that you retry the token request.
			} else {
			  jQuery('.loading-area').hide();
			  jQuery('form.book-now').find('input[type="submit"]').prop('disabled', false);
				  jQuery( "<div class='alert alert-danger'>"+data.errorMsg+"</div>" ).insertBefore( "#book-now-section" );
				  jQuery("html, body").animate({
										scrollTop: jQuery(".alert-danger").offset().top
									}, 1000);
			}
		  };
		  
		  /*Callback function to get timeslots*/
  function service_finder_timeslotCallback(id, provider_id, totalhours) {
	  	service_finder_resetMembers();
		var date = jQuery("#" + id).data("date");
		jQuery('#selecteddate').attr('data-seldate',date);
		jQuery('#selecteddate').val(date);
		var data = {
			  "action": "get_bookingtimeslot",
			  "seldate": date,
			  "provider_id": provider_id,
			  "totalhours": totalhours,
			};
		var formdata = jQuery.param(data);
		  
		jQuery.ajax({

			type: 'POST',

			url: ajaxurl,

			data: formdata,
			
			beforeSend: function() {
				jQuery('.loading-area').show();
			},

			success:function (data, textStatus) {
				jQuery('.loading-area').hide();
				jQuery('.timeslots').html(data);
				jQuery("#panel-3 h6").remove('button.edit');
				jQuery("#panel-4 h6").remove('button.edit');
			}

		});

		  return true;
	}
  /*Callback fucntion to get members*/
  function service_finder_memberCallback(id, provider_id) {
	  	service_finder_resetMembers();
		var zipcode = jQuery('input[name="zipcode"]').val();
		var region = jQuery('select[name="region"]').val();
		var provider_id = jQuery('#provider').attr('data-provider');
		var date = jQuery("#" + id).data("date");
		region = Encoder.htmlEncode(region);
		var data = {
			  "action": "load_members",
			  "zipcode": zipcode,
			  "region": region,
			  "provider_id": provider_id,
			  "date": date,
			};
		var formdata = jQuery.param(data);
		  
		jQuery.ajax({

			type: 'POST',

			url: ajaxurl,

			data: formdata,
			
			dataType: "json",
			
			beforeSend: function() {
				jQuery('.loading-area').show();
			},

			success:function (data, textStatus) {
					jQuery('.loading-area').hide();
					jQuery("#step2").find(".alert").remove();
					 if(data != null){
						if(data['status'] == 'success'){
							jQuery("#step2").find("#members").html(data['members']);
							jQuery("#step2").find("#members").append('<div class="col-lg-12"><div class="row"><div class="checkbox text-left"><input id="anymember" class="anymember" type="checkbox" name="anymember[]" value="yes" checked><label for="anymember">'+param.anyone+'</label></div></div></div>');
							jQuery('.display-ratings').rating();
							jQuery('.sf-show-rating').show();
						}
					}
			}

		});	

		  return true;
	}	
	/*Reset Members*/
	function service_finder_resetMembers(){
		jQuery("#step2").find("#members").html('');
		jQuery("#memberid").val('');	
		jQuery("#memberid").attr('data-memid','');
	}

		
  });
  
  
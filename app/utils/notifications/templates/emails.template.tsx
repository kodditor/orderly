import { IOrderResponse } from '@/models/OrderProducts.model';
import * as React from 'react';
import { styledCedis } from '../../frontend/utils';
import { Tables } from '@/types/supabase';
import { ILocation } from '@/models/orderShopper.model';
import { emailConfirmationParameters } from '@/models/notification.model';

export function ConfirmEmail({ parameters }:{parameters: emailConfirmationParameters }){
	
	let total = 0;

	if(parameters.products){
				
		for(let i = 0; i < parameters.products.length; i++){
			total += parameters.products[i].price * parameters.products[i].quantity
		}
	}

	return (
		<html className='bg-peach w-full p-12 md:p-16'>
			<div className='flex flex-col rounded-xl bg-white p-8 md:p-16 items-center gap-4 shadow-lg'>
				<img src='/img/logo.png' className='w-48 mb-4' />
				<h1 className='font-bold text-darkRed text-2xl md:text-3xl mb-4'>Order Confirmed!</h1>
				<p className='w-full'>
					Hi {parameters.firstName ?? 'customer'},<br /><br />
					Thank you for you purchase!<br />
					Your order has been confirmed by {parameters.shopName} successfully.<br />
					We'll notify you when your order is out for delivery! <br/><br />

					Here are your order details:<br /><br />
					Order Number: <span className='font-bold'>{parameters.order_id ?? 1023}</span><br />
					Total: <span className='font-bold'>GHS{styledCedis(total)}</span><br />
					Delivery Address: <span className='font-bold'>{parameters.location.buildingNum + ' ' + parameters.location.streetAddress + ' ' + parameters.location.city + ' ' + parameters.location.region + ' ' + parameters.location.country/* 'Accra, Greater Accra, Ghana'*/}</span>
					<br/><br/>
					Stay Orderly! <br/><br/>
					Best Regards,<br/>
					The Orderly Team <br/><br/>
				</p>
			</div>
			<div className='w0full flex items-center justify-center'>
				<span className='text-gray-400 mt-4'>Need Support?  <a href='https://orderlygh.shop/support' className='font-semibold'> Get in touch</a></span>
			</div>
		</html>
	)
}
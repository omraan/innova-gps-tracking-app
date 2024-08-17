export function getRelatedOrders(orders: any): CustomerOrders[] {
	return Object.values(
		orders.reduce((acc: any, order: any) => {
			const { customerId, orderNumber, ...rest } = order.value;

			if (!acc[customerId!]) {
				acc[customerId!] = {
					customerId,
					amountOrders: 0,
					orderIds: [],
					orderNumbers: [],
					...rest,
				};
			}

			acc[customerId!].amountOrders += 1;
			acc[customerId!].orderIds.push(order.name);
			acc[customerId!].orderNumbers.push(orderNumber);

			return acc;
		}, {})
	);
}

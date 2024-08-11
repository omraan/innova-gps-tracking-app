export function getRelatedOrders(orders: OrderExtended[]): CustomerOrders[] {
	return Object.values(
		orders.reduce((acc: any, order: any) => {
			const { customerId, id: orderId, orderNumber, ...rest } = order;

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
			acc[customerId!].orderIds.push(orderId);
			acc[customerId!].orderNumbers.push(orderNumber);

			return acc;
		}, {})
	);
}

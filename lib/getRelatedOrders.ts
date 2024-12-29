export function getRelatedOrders(orders: { name: string; value: OrderExtended }[]): CustomerOrders[] {
	return Object.values(
		orders.reduce((acc: any, order: { name: string; value: OrderExtended }) => {
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
			if (orderNumber) {
				acc[customerId!].orderNumbers.push(orderNumber);
			}

			return acc;
		}, {})
	);
}

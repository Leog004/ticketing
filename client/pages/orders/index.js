import Link from "next/link";
import React from "react";

export default function OrderIndex({ orders }) {
  return (
    <ul>
      {orders.map((order) => {
        return (
          <Link href="/orders/[orderId]" as={`/orders/${order.id}`}>
            <li key={order.id}>
              {order.ticket.title} - {order.status}
            </li>
          </Link>
        );
      })}
    </ul>
  );
}

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get("/api/orders");
  return { orders: data };
};

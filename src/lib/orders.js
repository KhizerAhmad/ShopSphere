import { supabase } from './supabaseClient'

/**
 * Creates an order + order_items from the current cart, then clears the cart.
 * cartItems: [{ id, product, quantity }]
 * address: checkout form data
 */

export async function placeOrder(userId, cartItems, total) {
  const safeTotal = Number(total)

  if (isNaN(safeTotal)) {
    return { error: new Error("Total is not a number") }
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
        total: safeTotal,
        status: 'pending'
      }
    ])
    .select()
    .single()

  if (orderError) return { error: orderError }

  const orderItems = cartItems.map((row) => ({
    order_id: order.id,
    product_id: row.product.id,
    product_name: row.product.name,
    price: Number(row.product.price),
    quantity: Number(row.quantity),
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) return { error: itemsError }

  await supabase
    .from('cart_items')
    .delete()
    .in('id', cartItems.map((row) => row.id))

  return { data: order, error: null }
}

export async function fetchMyOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    })

  return {
    data: data ?? [],
    error,
  }
}
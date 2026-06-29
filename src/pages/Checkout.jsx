import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { placeOrder } from "../lib/orders";
import "./Checkout.css";

const SHIPPING = 10;
const TAX = 0.05;

export default function Checkout() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { items, subtotal, refreshCart } = useCart();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [errors, setErrors] = useState({});

  const shipping = items.length ? SHIPPING : 0;
  const tax = subtotal * TAX;
  const total = Number((subtotal + shipping + tax).toFixed(2))

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function validate() {
    const err = {};

    if (!form.fullName.trim())
      err.fullName = "Full name is required.";

    if (!form.phone.trim())
      err.phone = "Phone number is required.";
    else if (!/^[0-9]{10,15}$/.test(form.phone))
      err.phone = "Invalid phone number.";

    if (!form.email.trim())
      err.email = "Email required.";
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    )
      err.email = "Invalid email.";

    if (!form.address.trim())
      err.address = "Address required.";

    if (!form.city.trim())
      err.city = "City required.";

    if (!form.state.trim())
      err.state = "State required.";

    if (!form.country.trim())
      err.country = "Country required.";

    if (!form.postalCode.trim())
      err.postalCode = "Postal Code required.";

    setErrors(err);

    return Object.keys(err).length === 0;
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const { error } = await placeOrder(
      user.id,
      items,
      total,
      form
    );

    setLoading(false);

    if (error) {
      showToast("Could not place order.", "error");
      return;
    }

    await refreshCart();

    showToast("Order placed successfully!", "success");

    navigate("/orders");
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty container">
        <h2>Your cart is empty.</h2>
      </div>
    );
  }

  return (
    <div className="checkout container">

      <h1>Checkout</h1>

      <div className="checkout-grid">

        <form
          className="checkout-form"
          onSubmit={handlePlaceOrder}
        >

          <div className="field">
            <label>Full Name</label>

            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />

            {errors.fullName &&
              <span>{errors.fullName}</span>}
          </div>

          <div className="field">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            {errors.email &&
              <span>{errors.email}</span>}
          </div>

          <div className="field">
            <label>Phone</label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            {errors.phone &&
              <span>{errors.phone}</span>}
          </div>

          <div className="field">
            <label>Street Address</label>

            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
            />

            {errors.address &&
              <span>{errors.address}</span>}
          </div>

          <div className="field-row">

            <div className="field">
              <label>City</label>

              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
              />

              {errors.city &&
                <span>{errors.city}</span>}
            </div>

            <div className="field">
              <label>State</label>

              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
              />

              {errors.state &&
                <span>{errors.state}</span>}
            </div>

          </div>

          <div className="field-row">

            <div className="field">
              <label>Postal Code</label>

              <input
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
              />

              {errors.postalCode &&
                <span>{errors.postalCode}</span>}
            </div>

            <div className="field">
              <label>Country</label>

              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
              />

              {errors.country &&
                <span>{errors.country}</span>}
            </div>

          </div>

          <button
            className="place-order-btn"
            disabled={loading}
          >
            {loading
              ? "Placing Order..."
              : "Place Order"}
          </button>

        </form>

        <div className="checkout-summary">

          <h2>Order Summary</h2>

          <div>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div>
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>

          <div>
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
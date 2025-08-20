import { useState } from "react";
import { getData } from "country-list";
import { useCart } from "../context/CartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CheckoutPage() {
  const countries = getData();
  const allowedCountries = ["US", "CA"];
  const filteredCountries = countries.filter((c) =>
    allowedCountries.includes(c.code)
  );

  const { cart, calculateCartTotal } = useCart();

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  // --- Coupon state ---
  const [coupon, setCoupon] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  function handleApplyCoupon() {
    if (coupon.toUpperCase() === "CHEAPSKATE") {
      setDiscountAmount(5);
      toast.success("Coupon applied successfully!");
    } else {
      setDiscountAmount(0);
      toast.error("Invalid coupon code");
    }
  }

  // --- Billing same as shipping toggle ---
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  // --- Shipping rate state ---
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);
  const [shippingRate, setShippingRate] = useState(null);
  const [canCheckout, setCanCheckout] = useState(false);
  const [calcClicked, setCalcClicked] = useState(false);

  // --- Address form (single source of truth) ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Any address change invalidates existing shipping calc
    if (
      ["address_line_1", "address_line_2", "city", "state", "zip", "country"].includes(
        name
      )
    ) {
      setShippingRate(null);
      setCanCheckout(false);
      setCalcClicked(false);
      setRateError(null);
    }
  }

  function isValidZip(zip) {
    return /^\d{5}$/.test(zip);
  }

  // --- Parcel (replace with your Supabase-driven version later) ---
  const parcel = {
    length: 6,
    width: 4,
    height: 2,
    distance_unit: "in",
    weight: 12,
    mass_unit: "oz",
  };

  async function handleCalculateShipping() {
    setCalcClicked(true);
    setRateError(null);

    // basic validation
    if (!isValidZip(formData.zip) || !formData.city || !formData.state) {
      setRateError("Enter a valid city, state, and 5-digit ZIP first.");
      return;
    }
    if (!cart || cart.length === 0) {
      setRateError("Your cart is empty.");
      return;
    }

    setRateLoading(true);
    try {
      const res = await fetch("/.netlify/functions/shippo-shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address_to: {
            name: formData.name || "Customer",
            email: formData.email || "",
            street1: formData.address_line_1 || "",
            street2: formData.address_line_2 || "",
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country || "US",
          },
          parcel, // swap with your computed parcel when ready
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          (data && data.details && data.details.detail) ||
            data.error ||
            `Request failed (${res.status})`
        );
      }

      if (Array.isArray(data.rates) && data.rates.length) {
        const cheapest = data.rates.reduce((a, b) =>
          Number(a.amount) < Number(b.amount) ? a : b
        );
        setShippingRate(cheapest);
        setCanCheckout(true);
      } else {
        setRateError("No rates returned for this address.");
        setShippingRate(null);
        setCanCheckout(false);
      }
    } catch (err) {
      setRateError(err.message || "Failed to calculate shipping");
      setShippingRate(null);
      setCanCheckout(false);
    } finally {
      setRateLoading(false);
    }
  }

  // --- Totals ---
  const subtotal = calculateCartTotal();
  const shipping = shippingRate ? Number(shippingRate.amount) : 0;
  const tax = 3.0; // placeholder
  const total = subtotal - discountAmount + shipping + tax;

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: Form */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>

          <form className="bg-white shadow p-6 rounded-lg space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Contact */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact information</h2>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                placeholder="Email Address"
              />
            </div>

            {/* Payment (placeholder inputs for now) */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment details</h2>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input w-full"
                placeholder="Name on card"
              />
              <input className="input w-full" placeholder="Card number" />
              <div className="flex gap-4">
                <input className="input flex-1" placeholder="MM/YY" />
                <input className="input flex-1" placeholder="CVC" />
              </div>
            </div>

            {/* Shipping address */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Shipping address</h2>
              <input
                name="address_line_1"
                value={formData.address_line_1}
                onChange={handleChange}
                className="input w-full"
                placeholder="Address Line 1"
              />
              <input
                name="address_line_2"
                value={formData.address_line_2}
                onChange={handleChange}
                className="input w-full"
                placeholder="Address Line 2 (Apt,Suite,etc)"
              />
              <div className="flex gap-4">
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input flex-1"
                  placeholder="City"
                />
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input flex-1"
                  placeholder="State / Province"
                />
                <input
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  className="input flex-1"
                  placeholder="ZIP / Postal"
                />
              </div>

              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="input w-full mb-2 bg-white text-gray-900"
              >
                {filteredCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Calculate shipping row */}
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCalculateShipping}
                  className="px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-60"
                  disabled={rateLoading}
                >
                  {rateLoading ? "Calculating…" : "Calculate shipping"}
                </button>

                {calcClicked && !rateLoading && shippingRate && (
                  <span className="text-sm text-green-700">
                    {shippingRate.provider}{" "}
                    {shippingRate.servicelevel_name || ""} —{" "}
                    {fmt.format(Number(shippingRate.amount))}
                  </span>
                )}

                {rateError && (
                  <span className="text-sm text-red-600">{rateError}</span>
                )}
              </div>
            </div>

            {/* Billing same as shipping */}
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="billing-same"
                checked={billingSameAsShipping}
                onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="billing-same" className="ml-2 text-sm text-gray-700">
                Billing address is the same as shipping address
              </label>
            </div>

            {/* Pay button (locked until shipping calculated) */}
            <button
              className={`w-full py-2 rounded font-medium ${
                canCheckout
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              disabled={!canCheckout}
            >
              Pay {fmt.format(total)}
            </button>
          </form>
        </div>

        {/* RIGHT: Cart Summary */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Order</h3>
          <ul className="divide-y divide-gray-200">
            {cart.map((item) => (
              <li key={item.id} className="flex py-4">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-16 w-16 rounded object-cover border border-gray-200"
                />
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-900">
                      {fmt.format(item.price)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {item.color_choice}
                    {item.custom_name && ` – ${item.custom_name}`}
                  </p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Coupon */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm text-black focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Apply
            </button>
          </div>

          {/* Summary */}
          <div className="pt-6 border-t mt-6 space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{fmt.format(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {rateLoading && "…"}
                {!rateLoading && shippingRate && fmt.format(shipping)}
                {!rateLoading && !shippingRate && (calcClicked ? "—" : "Click 'Calculate shipping'")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{fmt.format(tax)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm py-1 text-green-700">
                <span>Discount</span>
                <span>−{fmt.format(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{fmt.format(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

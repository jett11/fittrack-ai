import { supabase, isDemoMode } from './supabaseClient'

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout.')))
      return
    }
    const script = document.createElement('script')
    script.src = CHECKOUT_SRC
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout.'))
    document.body.appendChild(script)
  })
}

export async function startPremiumCheckout({ user }) {
  if (isDemoMode) {
    throw new Error('Payments aren’t available in demo mode.')
  }

  await loadRazorpayScript()

  const { data: order, error: orderError } = await supabase.functions.invoke('create-razorpay-order')
  if (orderError || order?.error) {
    throw new Error(order?.error ?? orderError?.message ?? 'Could not start checkout.')
  }

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'FitTrack AI',
      description: 'Premium — monthly',
      prefill: { email: user.email },
      theme: { color: '#18c78a' },
      handler: async (response) => {
        try {
          const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          })
          if (error || data?.error) {
            reject(new Error(data?.error ?? error?.message ?? 'Payment could not be verified.'))
            return
          }
          resolve(data)
        } catch (e) {
          reject(e)
        }
      },
      modal: {
        ondismiss: () => reject(new Error('cancelled')),
      },
    })
    razorpay.open()
  })
}

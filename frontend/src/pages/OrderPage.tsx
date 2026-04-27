import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import Footer from '../components/Footer';

interface OrderPageProps {
  onNavigate: (page: string, id?: string) => void;
}

const STEPS = ['Shipping', 'Billing', 'Order Summary'];

const OrderPage: React.FC<OrderPageProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isLoggedIn = useAppSelector(s => s.auth.isLoggedIn);
  const user = useAppSelector(s => s.auth.user);
  const cartItems = useAppSelector(s => s.cart.items);
  const total = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedContact, setSelectedContact] = useState(0);

  return (
    <main>
      <div className="max-w-screen-xl mx-auto px-4 pt-6 pb-8">
        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                  i < currentStep
                    ? 'bg-stone-900 border-stone-900'
                    : i === currentStep
                    ? 'bg-white border-stone-900'
                    : 'bg-white border-stone-300'
                }`} />
                <span className={`text-xs mt-1 font-medium ${
                  i === currentStep ? 'text-stone-900' : 'text-stone-400'
                }`}>{step}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentStep ? 'bg-stone-900' : 'bg-stone-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left: Steps */}
          <div className="md:col-span-3">
            {currentStep === 0 && (
              <div className="space-y-3">
                {!isLoggedIn && (
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <ArrowRight size={14} />
                    <span>Please log in first.</span>
                  </div>
                )}
                {user && (
                  <>
                    <div className="flex items-start gap-2 text-sm text-stone-700">
                      <ArrowRight size={14} className="mt-0.5 shrink-0" />
                      <div className="w-full">
                        <p className="font-medium mb-2">Choose the address.</p>
                        <div className="space-y-2">
                          {user.addresses.map((addr, i) => (
                            <label key={addr.id} className="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all"
                              style={{ borderColor: selectedAddress === i ? '#1c1917' : '#e7e5e4' }}
                            >
                              <input
                                type="radio"
                                name="address"
                                checked={selectedAddress === i}
                                onChange={() => setSelectedAddress(i)}
                                className="mt-0.5"
                              />
                              <div>
                                <p className="text-xs font-semibold text-stone-600">{addr.label}</p>
                                <p className="text-xs text-stone-500">{addr.full}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-stone-700">
                      <ArrowRight size={14} className="mt-0.5 shrink-0" />
                      <div className="w-full">
                        <p className="font-medium mb-2">Choose a contact.</p>
                        <div className="space-y-2">
                          {user.contacts.map((c, i) => (
                            <label key={i} className="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all"
                              style={{ borderColor: selectedContact === i ? '#1c1917' : '#e7e5e4' }}
                            >
                              <input
                                type="radio"
                                name="contact"
                                checked={selectedContact === i}
                                onChange={() => setSelectedContact(i)}
                              />
                              <span className="text-sm text-stone-600">{c}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <ArrowRight size={14} />
                      <span>Proceed for payment.</span>
                    </div>
                  </>
                )}

                <button
                  onClick={() => setCurrentStep(1)}
                  className="mt-4 bg-stone-900 text-white w-full py-3 rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors"
                >
                  Continue to Billing
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-stone-900">Billing Details</h2>
                <div className="space-y-3">
                  {['Cardholder Name', 'Card Number', 'Expiry', 'CVV'].map(field => (
                    <div key={field}>
                      <label className="text-xs text-stone-500 block mb-1">{field}</label>
                      <input
                        type={field === 'CVV' ? 'password' : 'text'}
                        placeholder={field}
                        className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(0)} className="flex-1 border border-stone-200 py-3 rounded-xl text-sm font-medium text-stone-600 hover:border-stone-400 transition-colors">
                    Back
                  </button>
                  <button onClick={() => setCurrentStep(2)} className="flex-1 bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check size={24} className="text-white" />
                  </div>
                  <h2 className="text-lg font-serif font-bold text-stone-900 mb-1">Order Confirmed!</h2>
                  <p className="text-sm text-stone-500 mb-4">Your order has been placed successfully.</p>
                  <button onClick={() => onNavigate('home')} className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors">
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          {cartItems.length > 0 && (
            <div className="md:col-span-2">
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 sticky top-20">
                <h3 className="text-sm font-semibold text-stone-900 mb-3">Order Summary</h3>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3 items-start">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
                        <p className="text-xs text-stone-400">{product.subheading}</p>
                        <p className="text-sm font-bold text-stone-900 mt-1">${(product.price * quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-200 mt-3 pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-stone-900">Total</span>
                  <span className="text-sm font-bold text-stone-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </main>
  );
};

export default OrderPage;

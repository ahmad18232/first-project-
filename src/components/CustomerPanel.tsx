import React, { useState } from 'react';
import { Movie, Booking } from '../types';
import { ClayCard } from './ClayCard';
import { FloatingInput } from './FloatingInput';
import { RippleButton } from './RippleButton';
import { TheaterSeatPicker } from './TheaterSeatPicker';
import { isValidEmail, isValid11DigitNumber, formatToCppDateTime, generateId } from '../utils';
import { 
  User, Mail, Film, Calendar, Armchair, Ticket, 
  CreditCard as CardIcon, Wallet, Coins, CheckCircle, 
  ArrowLeft, ShoppingBag, Receipt, Sparkles 
} from 'lucide-react';

interface CustomerPanelProps {
  movies: Movie[];
  bookings: Booking[];
  onBookTicket: (
    movieId: string,
    seatCount: number,
    paymentMethod: 'Cash' | 'Credit Card' | 'Online Wallet',
    refNumber: string,
    bookedOn: string,
    customerName: string,
    customerEmail: string
  ) => Booking | null;
  onShowSnackbar: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CustomerPanel: React.FC<CustomerPanelProps> = ({
  movies,
  bookings,
  onBookTicket,
  onShowSnackbar,
}) => {
  // Customer Credentials
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProfileSet, setIsProfileSet] = useState(false);

  // Active Booking Flow
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [requestedSeatsCount, setRequestedSeatsCount] = useState('1');
  const [selectedSeatIndices, setSelectedSeatIndices] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'Online Wallet'>('Cash');
  const [paymentAccount, setPaymentAccount] = useState('');
  
  // App navigation state within customer
  const [customerTab, setCustomerTab] = useState<'browse' | 'my-bookings'>('browse');
  
  // Step in checkout: 'select-movie' | 'configure-seats' | 'payment' | 'processing' | 'receipt'
  const [bookingStep, setBookingStep] = useState<'select-movie' | 'configure-seats' | 'payment' | 'processing' | 'receipt'>('select-movie');
  const [processingMessage, setProcessingMessage] = useState('Verifying seat logs...');
  const [latestReceipt, setLatestReceipt] = useState<Booking | null>(null);

  // Validation errors
  const [profileError, setProfileError] = useState('');
  const [bookingError, setBookingError] = useState('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    if (!customerName.trim()) {
      setProfileError('Please enter your name.');
      return;
    }

    if (!isValidEmail(customerEmail)) {
       setProfileError('Invalid email! Please enter a valid email address.');
       return;
     }

    setIsProfileSet(true);
    onShowSnackbar(`Profile set! Welcome, ${customerName}.`, "success");
  };

  const handleMovieSelect = (movie: Movie) => {
    if (movie.seats <= 0) {
      onShowSnackbar("Sorry, no seats available for this movie!", "error");
      return;
    }
    setSelectedMovie(movie);
    setRequestedSeatsCount('1');
    setSelectedSeatIndices([]);
    setBookingStep('configure-seats');
  };

  const handleSeatToggle = (seatIndex: number) => {
    const maxCount = parseInt(requestedSeatsCount, 10) || 1;
    
    if (selectedSeatIndices.includes(seatIndex)) {
      setSelectedSeatIndices(prev => prev.filter(index => index !== seatIndex));
    } else {
      if (selectedSeatIndices.length >= maxCount) {
        // Shift old seats out or alert
        onShowSnackbar(`You can only select up to ${maxCount} seat(s). Increase seat count to add more.`, "info");
        return;
      }
      setSelectedSeatIndices(prev => [...prev, seatIndex]);
    }
  };

  const handleSeatsConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    const seatCount = parseInt(requestedSeatsCount, 10);
    if (isNaN(seatCount) || seatCount <= 0) {
      setBookingError('Please enter a valid number of seats.');
      return;
    }

    if (!selectedMovie) return;

    if (seatCount > selectedMovie.seats) {
      setBookingError(`Only ${selectedMovie.seats} seat(s) left. Booking cancelled.`);
      return;
    }

    if (selectedSeatIndices.length !== seatCount) {
      setBookingError(`Please select exactly ${seatCount} seats on the theater grid.`);
      return;
    }

    setBookingStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!isValid11DigitNumber(paymentAccount)) {
      setBookingError('Invalid number! It must be exactly 11 digits.');
      return;
    }

    if (!selectedMovie) return;

    // Trigger Processing animation (Material state)
    setBookingStep('processing');
    
    setTimeout(() => {
      setProcessingMessage('Syncing bank ledger...');
      setTimeout(() => {
        setProcessingMessage('Generating printable ticket receipt...');
        setTimeout(() => {
          // Finalize booking
          const seatCount = parseInt(requestedSeatsCount, 10);
          const nowStr = formatToCppDateTime(new Date());
          
          const bookingResult = onBookTicket(
            selectedMovie.id, 
            seatCount, 
            paymentMethod, 
            paymentAccount,
            nowStr,
            customerName,
            customerEmail
          );

          if (bookingResult) {
            setLatestReceipt(bookingResult);
            setBookingStep('receipt');
            onShowSnackbar("Ticket booked successfully!", "success");
          } else {
            setBookingStep('configure-seats');
            onShowSnackbar("Booking failed. Please try again.", "error");
          }
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const getPaymentPlaceholder = () => {
    switch (paymentMethod) {
      case 'Cash':
        return 'Reference number (11 digits)';
      case 'Credit Card':
        return 'Credit Card number (11 digits)';
      case 'Online Wallet':
        return 'Wallet ID (11 digits)';
    }
  };

  const getMyBookings = () => {
    return bookings.filter(b => b.customerEmail.toLowerCase() === customerEmail.toLowerCase());
  };

  // Profile setup screen
  if (!isProfileSet) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 animate-fadeIn">
        <ClayCard clayColor="white" className="border-slate-100">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-3 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),_inset_-2px_-2px_4px_rgba(110,231,183,0.3)] border border-emerald-200">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight text-center">Customer Gate</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Provide your details to book movie tickets</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <FloatingInput
              label="Full Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onClear={() => setCustomerName('')}
              icon={<User className="h-4 w-4" />}
              required
            />

            <FloatingInput
              label="Email Address"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              onClear={() => setCustomerEmail('')}
              icon={<Mail className="h-4 w-4" />}
              required
            />

            {profileError && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-100 rounded-2xl text-xs text-rose-600 font-bold animate-pulse">
                {profileError}
              </div>
            )}

            <RippleButton
              variant="clay"
              clayColor="emerald"
              type="submit"
              fullWidth
              className="mt-6 font-bold"
            >
              Enter Ticket Office
            </RippleButton>
          </form>
        </ClayCard>
      </div>
    );
  }

  // Browse section
  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      {/* Customer Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-widest">
            Movie Ticket Office
          </span>
          <h2 className="font-display font-bold text-3xl text-slate-800 tracking-tight mt-1.5">Welcome, {customerName}</h2>
          <p className="text-xs text-slate-400 font-semibold">{customerEmail}</p>
        </div>
        <div className="flex gap-2">
          <RippleButton
            variant={customerTab === 'browse' ? 'primary' : 'secondary'}
            onClick={() => {
              setCustomerTab('browse');
              setBookingStep('select-movie');
            }}
            className="rounded-2xl"
          >
            <Film className="h-4 w-4" />
            Now Showing
          </RippleButton>
          <RippleButton
            variant={customerTab === 'my-bookings' ? 'primary' : 'secondary'}
            onClick={() => setCustomerTab('my-bookings')}
            className="rounded-2xl"
          >
            <Receipt className="h-4 w-4" />
            My Tickets ({getMyBookings().length})
          </RippleButton>
        </div>
      </div>

      {customerTab === 'browse' && (
        <div className="animate-fadeIn">
          {/* Active Booking Steps */}
          {bookingStep === 'select-movie' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-lg text-slate-800">Select an Active Screening</h3>
              </div>
              
              {movies.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-100 shadow-sm">
                  <p className="text-slate-400 font-medium">No movies are currently scheduled by administrator.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {movies.map((movie, idx) => {
                    // Cyclic clay cards
                    const colorVariants: ('blue' | 'violet' | 'emerald' | 'amber' | 'rose')[] = ['blue', 'violet', 'emerald', 'amber', 'rose'];
                    const chosenColor = colorVariants[idx % colorVariants.length];
                    
                    return (
                      <ClayCard 
                        key={movie.id} 
                        clayColor={chosenColor} 
                        bordered={false} 
                        className="flex flex-col justify-between h-72 cursor-pointer group active:scale-98"
                        onClick={() => handleMovieSelect(movie)}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="font-display font-bold text-xl leading-tight group-hover:text-indigo-600 transition-colors">
                              {movie.title}
                            </h4>
                            <span className="text-xs font-mono font-bold whitespace-nowrap bg-white/70 px-2 py-1 rounded-md border border-black/5">
                              Rs. {movie.price.toFixed(0)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs font-bold text-black/50 mb-4">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{movie.showTime}</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs font-semibold mb-4 bg-white/40 px-3 py-2 rounded-xl border border-white/40">
                            <span>Available Seats:</span>
                            <span className={`font-mono font-bold text-sm ${movie.seats === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                              {movie.seats} / {movie.totalSeats}
                            </span>
                          </div>

                          <RippleButton
                            variant="clay"
                            clayColor={movie.seats === 0 ? 'slate' : chosenColor}
                            fullWidth
                            disabled={movie.seats === 0}
                            className="font-bold border border-black/10 py-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMovieSelect(movie);
                            }}
                          >
                            {movie.seats === 0 ? 'SOLD OUT' : 'BOOK TICKET'}
                          </RippleButton>
                        </div>
                      </ClayCard>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {bookingStep === 'configure-seats' && selectedMovie && (
            <div className="max-w-xl mx-auto animate-fadeIn">
              <ClayCard clayColor="white" className="border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <RippleButton
                    variant="text"
                    onClick={() => setBookingStep('select-movie')}
                    className="p-1 px-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-500"
                    title="Go Back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </RippleButton>
                  <h3 className="font-display font-bold text-xl text-slate-800">Seat Configuration</h3>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h4 className="font-display font-bold text-slate-800 text-lg leading-tight">{selectedMovie.title}</h4>
                    <p className="text-xs text-indigo-600 font-bold font-mono mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedMovie.showTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-semibold">Single Ticket Price</p>
                    <p className="font-mono font-bold text-slate-800">Rs. {selectedMovie.price.toFixed(2)}</p>
                  </div>
                </div>

                <form onSubmit={handleSeatsConfigSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                      How many seats would you like to book?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max={selectedMovie.seats}
                        value={requestedSeatsCount}
                        onChange={(e) => {
                          setRequestedSeatsCount(e.target.value);
                          setSelectedSeatIndices([]); // Reset seat picking when count changes
                        }}
                        className="w-24 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2 text-slate-800 font-mono font-bold text-center focus:outline-none focus:border-indigo-500"
                      />
                      <span className="flex-1 flex items-center text-xs text-slate-400 font-semibold bg-slate-100 px-4 py-2 rounded-2xl">
                        Max available: {selectedMovie.seats} seats
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                      Interactive Seating Grid (Pick Seats)
                    </label>
                    <TheaterSeatPicker
                      totalSeats={selectedMovie.totalSeats}
                      availableSeats={selectedMovie.seats}
                      selectedSeats={selectedSeatIndices}
                      onSeatToggle={handleSeatToggle}
                      maxSeats={parseInt(requestedSeatsCount, 10) || 0}
                    />
                  </div>

                  {bookingError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-500 font-bold">
                      {bookingError}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">Total Ticket Cost</p>
                      <p className="font-display font-black text-2xl text-slate-800 font-mono">
                        Rs. {((parseInt(requestedSeatsCount, 10) || 0) * selectedMovie.price).toFixed(2)}
                      </p>
                    </div>
                    <RippleButton
                      variant="clay"
                      clayColor="blue"
                      type="submit"
                    >
                      Proceed to Pay
                    </RippleButton>
                  </div>
                </form>
              </ClayCard>
            </div>
          )}

          {bookingStep === 'payment' && selectedMovie && (
            <div className="max-w-md mx-auto animate-fadeIn">
              <ClayCard clayColor="white" className="border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                  <RippleButton
                    variant="text"
                    onClick={() => setBookingStep('configure-seats')}
                    className="p-1 px-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-500"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </RippleButton>
                  <h3 className="font-display font-bold text-xl text-slate-800">Checkout Payment</h3>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                  <div className="flex justify-between items-start pb-3 border-b border-slate-200/50">
                    <div>
                      <h4 className="font-bold text-slate-700">{selectedMovie.title}</h4>
                      <p className="text-xs text-slate-400 font-semibold font-mono mt-0.5">{selectedMovie.showTime}</p>
                    </div>
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
                      {requestedSeatsCount} Tickets
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 text-sm">
                    <span className="text-slate-500 font-semibold">Amount to Pay</span>
                    <span className="font-display font-black text-lg text-slate-800 font-mono">
                      Rs. {((parseInt(requestedSeatsCount, 10) || 0) * selectedMovie.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 ml-1">
                      Choose payment method:
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('Cash');
                          setPaymentAccount('');
                          setBookingError('');
                        }}
                        className={`py-3.5 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'Cash'
                            ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-[2px_2px_8px_rgba(252,211,77,0.25)]'
                            : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50/50'
                        }`}
                      >
                        <Coins className="h-5 w-5" />
                        <span className="text-xs font-bold">Cash</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('Credit Card');
                          setPaymentAccount('');
                          setBookingError('');
                        }}
                        className={`py-3.5 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'Credit Card'
                            ? 'border-blue-400 bg-blue-50 text-blue-800 shadow-[2px_2px_8px_rgba(147,197,253,0.25)]'
                            : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50/50'
                        }`}
                      >
                        <CardIcon className="h-5 w-5" />
                        <span className="text-xs font-bold">Credit Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('Online Wallet');
                          setPaymentAccount('');
                          setBookingError('');
                        }}
                        className={`py-3.5 px-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'Online Wallet'
                            ? 'border-violet-400 bg-violet-50 text-violet-800 shadow-[2px_2px_8px_rgba(196,181,253,0.25)]'
                            : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50/50'
                        }`}
                      >
                        <Wallet className="h-5 w-5" />
                        <span className="text-xs font-bold">Wallet</span>
                      </button>
                    </div>
                  </div>

                  <FloatingInput
                    label={
                      paymentMethod === 'Cash' 
                        ? '11 Digit Cash Reference Code' 
                        : paymentMethod === 'Credit Card' 
                        ? '11 Digit Credit Card Number' 
                        : '11 Digit Online Wallet Account ID'
                    }
                    type="text"
                    maxLength={11}
                    value={paymentAccount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // Numbers only
                      setPaymentAccount(val);
                    }}
                    onClear={() => setPaymentAccount('')}
                    placeholder={getPaymentPlaceholder()}
                    helperText="Must be exactly 11 digits"
                    required
                  />

                  {bookingError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-500 font-bold">
                      {bookingError}
                    </div>
                  )}

                  <RippleButton
                    variant="clay"
                    clayColor={
                      paymentMethod === 'Cash' 
                        ? 'amber' 
                        : paymentMethod === 'Credit Card' 
                        ? 'blue' 
                        : 'violet'
                    }
                    type="submit"
                    fullWidth
                    className="font-bold text-sm mt-4"
                  >
                    Confirm Payment (Rs. {((parseInt(requestedSeatsCount, 10) || 0) * selectedMovie.price).toFixed(2)})
                  </RippleButton>
                </form>
              </ClayCard>
            </div>
          )}

          {bookingStep === 'processing' && (
            <div className="max-w-md mx-auto my-12 animate-fadeIn text-center">
              <ClayCard clayColor="white" className="border-slate-100 flex flex-col items-center py-10">
                <div className="relative mb-6">
                  {/* Rotating Circular Loader (Material) */}
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600">
                    <Armchair className="h-6 w-6 animate-pulse" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800">Processing Booking...</h3>
                <p className="text-sm text-slate-400 font-semibold mt-2 animate-pulse">{processingMessage}</p>
              </ClayCard>
            </div>
          )}

          {bookingStep === 'receipt' && latestReceipt && (
            <div className="max-w-md mx-auto animate-fadeIn">
              <ClayCard clayColor="emerald" bordered={false} className="p-8 relative overflow-hidden">
                {/* Visual confetti / burst elements */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-200/30 rounded-full blur-xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-emerald-200/20 rounded-full blur-xl pointer-events-none"></div>

                <div className="flex flex-col items-center text-center mb-6 border-b border-emerald-200/40 pb-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-md mb-3 animate-bounce">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-black text-2xl text-emerald-950 uppercase tracking-tight">Booking Confirmed</h3>
                  <p className="text-xs text-emerald-700/80 font-bold mt-1">Enjoy your movie!</p>
                </div>

                {/* Ticket Details */}
                <div className="space-y-4 text-xs font-semibold text-emerald-950 bg-white/65 p-5 rounded-2xl border border-white/40 shadow-sm relative">
                  {/* Notch circles to represent actual ticket design */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-50 rounded-full border-r border-emerald-200"></div>
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-50 rounded-full border-l border-emerald-200"></div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">Customer</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{latestReceipt.customerName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{latestReceipt.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">Ticket Ref No.</p>
                      <p className="font-mono text-slate-700 font-bold text-sm mt-0.5">{latestReceipt.referenceNumber}</p>
                    </div>
                  </div>

                  <div className="border-t border-emerald-200/30 pt-3">
                    <p className="text-[10px] text-emerald-700 font-bold uppercase">Movie Title</p>
                    <p className="font-display font-bold text-slate-800 text-base mt-0.5">{latestReceipt.movieTitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-emerald-200/30 pt-3">
                    <div>
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">Seats Booked</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {latestReceipt.seatsBooked} {latestReceipt.seatsBooked === 1 ? 'Seat' : 'Seats'}
                      </p>
                      {selectedSeatIndices.length > 0 && (
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5 font-mono">
                          Seat No: {selectedSeatIndices.map(s => s + 1).join(', ')}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">Paid via</p>
                      <p className="font-bold text-slate-800 mt-0.5">{latestReceipt.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-emerald-200/30 pt-3">
                    <div>
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">Show Time</p>
                      <p className="font-mono text-slate-700 font-bold mt-0.5">{latestReceipt.showTime}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">Booked On</p>
                      <p className="font-mono text-slate-500 font-bold mt-0.5">{latestReceipt.bookedAt}</p>
                    </div>
                  </div>

                  <div className="border-t border-emerald-200/30 pt-4 flex justify-between items-center">
                    <p className="text-[10px] text-emerald-700 font-bold uppercase">Total Amount Paid</p>
                    <p className="font-mono font-black text-lg text-slate-800">
                      Rs. {latestReceipt.amountPaid.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Printable dynamic simulated Barcode */}
                <div className="mt-6 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 flex flex-col items-center w-full">
                    <div className="flex gap-0.5 justify-center h-8 w-full max-w-[200px]">
                      {Array.from({ length: 42 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-slate-800 h-full"
                          style={{
                            width: (i % 3 === 0 || i % 7 === 0) ? '3px' : '1px',
                            opacity: (i % 4 === 0 || i % 9 === 0) ? 0.15 : 0.95
                          }}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">
                      BARCODE-{latestReceipt.id}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <RippleButton
                    variant="clay"
                    clayColor="slate"
                    fullWidth
                    onClick={() => {
                      setBookingStep('select-movie');
                      setSelectedMovie(null);
                    }}
                    className="font-bold border border-black/5"
                  >
                    Book Another Ticket
                  </RippleButton>
                </div>
              </ClayCard>
            </div>
          )}
        </div>
      )}

      {customerTab === 'my-bookings' && (
        <div className="animate-fadeIn">
          <h3 className="font-display font-bold text-lg text-slate-800 mb-4">Your Booking Receipts</h3>
          
          {getMyBookings().length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col items-center gap-3">
              <ShoppingBag className="h-10 w-10 text-slate-300" />
              <p className="text-slate-400 font-medium">You haven't booked any movie tickets yet.</p>
              <RippleButton
                variant="primary"
                onClick={() => setCustomerTab('browse')}
                className="mt-2"
              >
                Browse Screenings
              </RippleButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getMyBookings().map((booking) => (
                <ClayCard key={booking.id} clayColor="white" className="border-slate-100 p-5 relative overflow-hidden flex flex-col justify-between h-56">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-display font-bold text-base text-slate-800 leading-snug">{booking.movieTitle}</h4>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {booking.seatsBooked} {booking.seatsBooked === 1 ? 'Seat' : 'Seats'}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] font-semibold text-slate-500">
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Show: <span className="font-mono text-slate-700">{booking.showTime}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" />
                        Reference: <span className="font-mono text-slate-700">{booking.referenceNumber}</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <Receipt className="h-3 w-3 text-slate-400" />
                        Paid via: <span className="text-slate-700">{booking.paymentMethod}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3.5 border-t border-slate-100 mt-2">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Total Paid</p>
                      <p className="font-mono font-bold text-sm text-slate-800">Rs. {booking.amountPaid.toFixed(2)}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      ID: {booking.id}
                    </span>
                  </div>
                </ClayCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

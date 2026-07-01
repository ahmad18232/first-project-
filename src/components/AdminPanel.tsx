import React, { useState } from 'react';
import { Movie, Booking } from '../types';
import { ClayCard } from './ClayCard';
import { FloatingInput } from './FloatingInput';
import { RippleButton } from './RippleButton';
import { isFutureDateTime, formatToCppDateTime } from '../utils';
import { Lock, User, PlusCircle, Shield, List, Ticket, DollarSign, LogOut } from 'lucide-react';

interface AdminPanelProps {
  movies: Movie[];
  bookings: Booking[];
  onAddMovie: (newMovie: Omit<Movie, 'id'>) => void;
  onLogout: () => void;
  onShowSnackbar: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  movies,
  bookings,
  onAddMovie,
  onLogout,
  onShowSnackbar,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Movie Form State
  const [movieTitle, setMovieTitle] = useState('');
  const [moviePrice, setMoviePrice] = useState('');
  const [movieSeats, setMovieSeats] = useState('');
  const [movieTime, setMovieTime] = useState('');
  const [formError, setFormError] = useState('');
  
  // Navigation tabs in admin panel
  const [activeTab, setActiveTab] = useState<'movies' | 'add' | 'bookings'>('movies');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attempts <= 0) {
      onShowSnackbar("Too many failed attempts. Locked out.", "error");
      return;
    }

    const ADMIN_USER = "Ahmdez";
    const ADMIN_PASS = "Ahmad108136";

    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      setIsLoggedIn(true);
      onShowSnackbar(`Login successful! Welcome, ${username}.`, "success");
    } else {
      const remaining = attempts - 1;
      setAttempts(remaining);
      if (remaining <= 0) {
        onShowSnackbar("Incorrect credentials. Too many failed attempts.", "error");
      } else {
        onShowSnackbar(`Incorrect username or password. Attempts left: ${remaining}`, "error");
      }
    }
  };

  const handleAddMovieSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!movieTitle.trim()) {
      setFormError('Movie title is required.');
      return;
    }

    const priceNum = parseFloat(moviePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price greater than 0.');
      return;
    }

    const seatsNum = parseInt(movieSeats, 10);
    if (isNaN(seatsNum) || seatsNum <= 0) {
      setFormError('Please enter a valid number of seats greater than 0.');
      return;
    }

    // Showtime validation using C++ future checker
    const refTime = new Date(); // Right now (current test is 1-Jul-2026)
    const validation = isFutureDateTime(movieTime, refTime);
    if (!validation.isValid) {
      setFormError(validation.errorMsg || 'Invalid date time.');
      return;
    }

    // Call onAddMovie
    onAddMovie({
      title: movieTitle.trim(),
      price: priceNum,
      seats: seatsNum,
      totalSeats: seatsNum,
      showTime: movieTime.trim(),
    });

    onShowSnackbar(`Successfully added movie: ${movieTitle}`, "success");
    
    // Reset Form
    setMovieTitle('');
    setMoviePrice('');
    setMovieSeats('');
    setMovieTime('');
    setActiveTab('movies');
  };

  const autofillDateTime = () => {
    // Fill with a valid future date relative to July 1st, 2026
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2); // 2 days in future
    tomorrow.setHours(19, 0, 0, 0); // 7:00 PM
    setMovieTime(formatToCppDateTime(tomorrow));
  };

  // Stats calculations
  const totalEarnings = bookings.reduce((sum, b) => sum + b.amountPaid, 0);
  const totalTicketsSold = bookings.reduce((sum, b) => sum + b.seatsBooked, 0);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 animate-fadeIn px-4">
        <ClayCard clayColor="white" className="border-slate-100">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-3 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),_inset_-2px_-2px_4px_rgba(165,180,252,0.3)] border border-indigo-200">
              <Shield className="h-7 w-7" />
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight text-center">Admin Access</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Authorized personnel login only</p>
          </div>

          {attempts <= 0 ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center mb-4">
              <p className="text-sm text-rose-700 font-bold">LOCKED OUT</p>
              <p className="text-xs text-rose-500 font-medium mt-1">Too many failed login attempts. Please contact systems administrator.</p>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <FloatingInput
                label="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onClear={() => setUsername('')}
                icon={<User className="h-4 w-4" />}
                required
                disabled={attempts <= 0}
              />

              <FloatingInput
                label="Admin Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onClear={() => setPassword('')}
                icon={<Lock className="h-4 w-4" />}
                required
                disabled={attempts <= 0}
              />

              {attempts < 3 && (
                <div className="text-center text-xs font-bold text-rose-500 mt-2">
                  Attempts left: {attempts} / 3
                </div>
              )}

              <RippleButton
                variant="clay"
                clayColor="blue"
                type="submit"
                fullWidth
                className="mt-6"
                disabled={attempts <= 0}
              >
                Authorize & Login
              </RippleButton>
            </form>
          )}
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4 animate-fadeIn">
      {/* Admin Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 uppercase tracking-widest">
            Admin Console
          </span>
          <h2 className="font-display font-bold text-3xl text-slate-800 tracking-tight mt-1.5">Welcome, Ahmdez</h2>
        </div>
        <RippleButton
          variant="secondary"
          onClick={() => {
            setIsLoggedIn(false);
            onLogout();
          }}
          className="rounded-2xl border border-slate-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </RippleButton>
      </div>

      {/* Quick Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <ClayCard clayColor="blue" bordered={false} className="p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-700/80 uppercase">Total Revenue</p>
            <p className="font-display font-bold text-xl text-indigo-950">Rs. {totalEarnings.toFixed(2)}</p>
          </div>
        </ClayCard>

        <ClayCard clayColor="violet" bordered={false} className="p-4 flex items-center gap-4">
          <div className="p-3 bg-violet-500 rounded-2xl text-white shadow-lg">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-violet-700/80 uppercase">Tickets Booked</p>
            <p className="font-display font-bold text-xl text-violet-900">{totalTicketsSold} Seats</p>
          </div>
        </ClayCard>

        <ClayCard clayColor="emerald" bordered={false} className="p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg">
            <List className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-700/80 uppercase">Movies Hosted</p>
            <p className="font-display font-bold text-xl text-emerald-900">{movies.length} Active</p>
          </div>
        </ClayCard>
      </div>

      {/* Navigation tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 max-w-md mb-6">
        <button
          onClick={() => setActiveTab('movies')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'movies'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-100 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <List className="h-3.5 w-3.5" />
          View Movies
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'add'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-100 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add Movie
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'bookings'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-100 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket className="h-3.5 w-3.5" />
          Booking Logs
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'movies' && (
        <ClayCard clayColor="white" className="border-slate-100 animate-fadeIn">
          <h3 className="font-display font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            Current Showing Movies ({movies.length})
          </h3>
          {movies.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-8">No movies available. Add a movie to get started!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Movie Title</th>
                    <th className="py-3 px-4 font-bold">Ticket Price</th>
                    <th className="py-3 px-4 font-bold">Available Seats</th>
                    <th className="py-3 px-4 font-bold text-right">Show Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {movies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-slate-50/30 transition-all font-medium text-slate-700">
                      <td className="py-3 px-4 font-bold text-slate-800">{movie.title}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">Rs. {movie.price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          movie.seats === 0
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : movie.seats <= 3
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {movie.seats} / {movie.totalSeats}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-500 font-mono">{movie.showTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ClayCard>
      )}

      {activeTab === 'add' && (
        <ClayCard clayColor="white" className="border-slate-100 animate-fadeIn max-w-xl">
          <h3 className="font-display font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-indigo-600" />
            Add New Movie
          </h3>
          <p className="text-xs text-slate-400 font-semibold mb-6">Create a new screening with validation</p>

          <form onSubmit={handleAddMovieSubmit} className="space-y-4">
            <FloatingInput
              label="Movie Title"
              value={movieTitle}
              onChange={(e) => setMovieTitle(e.target.value)}
              onClear={() => setMovieTitle('')}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingInput
                label="Ticket Price (Rs.)"
                type="number"
                min="1"
                step="any"
                value={moviePrice}
                onChange={(e) => setMoviePrice(e.target.value)}
                onClear={() => setMoviePrice('')}
                required
              />

              <FloatingInput
                label="Total Seats"
                type="number"
                min="1"
                value={movieSeats}
                onChange={(e) => setMovieSeats(e.target.value)}
                onClear={() => setMovieSeats('')}
                required
              />
            </div>

            <div className="relative">
              <FloatingInput
                label="Show Time (e.g. 02-07-2026 07:00 PM)"
                value={movieTime}
                onChange={(e) => setMovieTime(e.target.value)}
                onClear={() => setMovieTime('')}
                helperText="Must be a future date in format DD-MM-YYYY hh:mm AM/PM"
                required
              />
              <button
                type="button"
                onClick={autofillDateTime}
                className="absolute right-3 top-5 text-[10px] bg-slate-100 hover:bg-slate-200 font-bold px-2 py-1 rounded-md text-slate-500 transition-all"
              >
                Autofill Valid
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-100 rounded-2xl text-xs text-rose-600 font-bold animate-pulse">
                {formError}
              </div>
            )}

            <div className="pt-3">
              <RippleButton
                variant="clay"
                clayColor="blue"
                type="submit"
                fullWidth
              >
                Create Screening
              </RippleButton>
            </div>
          </form>
        </ClayCard>
      )}

      {activeTab === 'bookings' && (
        <ClayCard clayColor="white" className="border-slate-100 animate-fadeIn">
          <h3 className="font-display font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            History Logs (Bookings File Sync)
          </h3>
          {bookings.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-8">No booking logs available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Customer</th>
                    <th className="py-3 px-4 font-bold">Movie</th>
                    <th className="py-3 px-4 font-bold">Seats</th>
                    <th className="py-3 px-4 font-bold">Paid Via</th>
                    <th className="py-3 px-4 font-bold">Total Cost</th>
                    <th className="py-3 px-4 text-right font-bold">Booked On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/30 transition-all font-medium text-slate-700">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{booking.customerName}</div>
                        <div className="text-[10px] text-slate-400">{booking.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{booking.movieTitle}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">{booking.seatsBooked}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200">
                          {booking.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">Rs. {booking.amountPaid.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-slate-500 font-semibold font-mono text-[11px]">{booking.bookedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ClayCard>
      )}
    </div>
  );
};

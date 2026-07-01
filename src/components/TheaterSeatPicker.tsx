import React from 'react';

interface TheaterSeatPickerProps {
  totalSeats: number;
  bookedSeats: number[];
  selectedSeats: number[];
  onSeatsChange: (seats: number[]) => void;
  maxSeats: number;
}

export const TheaterSeatPicker: React.FC<TheaterSeatPickerProps> = ({
  totalSeats,
  bookedSeats,
  selectedSeats,
  onSeatsChange,
  maxSeats,
}) => {
  const takenSeats = React.useMemo(() => {
    return new Set(bookedSeats);
  }, [bookedSeats]);

  const handleSeatToggle = (index: number) => {
    if (selectedSeats.includes(index)) {
      onSeatsChange(selectedSeats.filter((i) => i !== index));
    } else {
      if (selectedSeats.length >= maxSeats) {
        if (maxSeats === 1) {
          onSeatsChange([index]);
        } else {
          onSeatsChange([...selectedSeats.slice(1), index]);
        }
      } else {
        onSeatsChange([...selectedSeats, index]);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-5 clay-inset">
      {/* Visual Screen Indicator */}
      <div className="w-4/5 h-2 bg-slate-300 rounded-full mb-8 relative shadow-[0_4px_12px_rgba(148,163,184,0.3)]">
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          SCREEN
        </span>
      </div>

      {/* Seats Grid */}
      <div className="grid grid-cols-5 gap-3.5 mb-6 max-w-xs">
        {Array.from({ length: totalSeats }).map((_, index) => {
          const seatNumber = index + 1;
          const isTaken = takenSeats.has(index);
          const isSelected = selectedSeats.includes(index);

          let seatStyle = "";
          if (isTaken) {
            // Booked seats: Red
            seatStyle = "bg-red-600 border-red-700 text-red-50 cursor-not-allowed opacity-90 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.15)]";
          } else if (isSelected) {
            // Want to book seats: Light Green
            seatStyle = "bg-green-300 border-green-500 text-green-950 font-bold cursor-pointer scale-105 shadow-[3px_3px_8px_rgba(74,222,128,0.35),_inset_2px_2px_4px_rgba(255,255,255,0.7)] transition-all duration-200 hover:bg-green-200";
          } else {
            // Available seats: Dark Green
            seatStyle = "bg-emerald-800 border-emerald-950 text-emerald-50 cursor-pointer shadow-[3px_3px_8px_rgba(6,78,59,0.25),_inset_2px_2px_4px_rgba(255,255,255,0.15)] hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all duration-200";
          }

          return (
            <button
              key={index}
              type="button"
              disabled={isTaken}
              onClick={() => handleSeatToggle(index)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-semibold transition-all duration-200 ${seatStyle}`}
              title={isTaken ? `Seat ${seatNumber} (Booked)` : isSelected ? `Seat ${seatNumber} (Selected to book)` : `Seat ${seatNumber} (Available)`}
            >
              {seatNumber}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-emerald-800 border border-emerald-950 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.15)]"></span>
          <span>Available (Dark Green)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-red-600 border border-red-700"></span>
          <span>Booked (Red)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-green-300 border border-green-500 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.6)]"></span>
          <span>Selected to Book (Light Green)</span>
        </div>
      </div>

      {maxSeats > 0 && (
        <div className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
          Selected {selectedSeats.length} of {maxSeats} seats required
        </div>
      )}
    </div>
  );
};
